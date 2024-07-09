/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {secretToken} from '../../../src/internals/secrets';
import {HTML_TEST_VECTORS} from '../../testing/testvectors/html_test_vectors';

import {
  CssSanitizationFn,
  HtmlSanitizerImpl,
  parseSrcset,
  sanitizeHtml,
  sanitizeHtmlAssertUnchanged,
  serializeSrcset,
  Srcset,
} from '../../../src/builders/html_sanitizer/html_sanitizer';
import {
  ResourceUrlPolicy,
  ResourceUrlPolicyHintsType,
} from '../../../src/builders/html_sanitizer/resource_url_policy';
import {
  AttributePolicy,
  AttributePolicyAction,
  ElementPolicy,
  SanitizerTable,
} from '../../../src/builders/html_sanitizer/sanitizer_table/sanitizer_table';

function sanitize(
  table: SanitizerTable,
  html: string,
  styleElementSanitizer?: CssSanitizationFn,
  styleAttributeSanitizer?: CssSanitizationFn,
  resourceUrlPolicy?: ResourceUrlPolicy,
): string {
  return new HtmlSanitizerImpl(
    table,
    secretToken,
    styleElementSanitizer,
    styleAttributeSanitizer,
    resourceUrlPolicy,
  )
    .sanitize(html)
    .toString();
}

function sanitizeAssertUnchanged(table: SanitizerTable, html: string): string {
  return new HtmlSanitizerImpl(table, secretToken)
    .sanitizeAssertUnchanged(html)
    .toString();
}

describe('HtmlSanitizer', () => {
  describe('using test vectors', () => {
    for (const v of HTML_TEST_VECTORS) {
      it(`passes testVector[${v.name}]`, () => {
        const sanitized = sanitizeHtml(v.input).toString();
        expect(v.acceptable).toContain(sanitized);
      });
    }
  });

  it('drops unknown elements', () => {
    const emptyTable = new SanitizerTable(
      new Set(),
      new Map(),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(emptyTable, '<a></a>');

    expect(sanitized).toBe('');
  });

  it('always drops form elements', () => {
    const allowFormElements = new SanitizerTable(
      new Set(['FORM']),
      new Map([['FORM', new Map()]]),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(allowFormElements, '<form></form>');

    expect(sanitized).toBe('');
  });

  it('drops clobbered form elements', () => {
    const allowClobberingElements = new SanitizerTable(
      new Set(['FORM', 'INPUT']),
      new Map(),
      new Set(['name']),
      new Map(),
    );

    const sanitized = sanitize(
      allowClobberingElements,
      `<form>
      <input name="nodeType" />
      <input name="nodeName" />
      <input name="attributes" />
      <input name="setAttribute" />
      <input name="parentNode" />
      <input name="appendChild" />
    </form>`,
    );

    expect(sanitized).toBe('');
  });

  it('keeps allowed elements', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(sanitizerTable, '<a></a>');
    expect(sanitized).toBe('<a></a>');
  });

  it('drops unknown attribute', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(sanitizerTable, '<a href="value"></a>');
    expect(sanitized).toBe('<a></a>');
  });

  it('uses global attribute policy when no element specific one is provided', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map([['A', new Map()]]),
      new Set(),
      new Map([['href', {policyAction: AttributePolicyAction.KEEP}]]),
    );

    const sanitized = sanitize(sanitizerTable, '<a href="value"></a>');
    expect(sanitized).toBe('<a href="value"></a>');
  });

  it('uses element specific attribute policy even when a global one is provided', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map([
        ['A', new Map([['href', {policyAction: AttributePolicyAction.KEEP}]])],
      ]),
      new Set(),
      new Map([['href', {policyAction: AttributePolicyAction.DROP}]]),
    );

    const sanitized = sanitize(sanitizerTable, '<a href="value"></a>');
    expect(sanitized).toBe('<a href="value"></a>');
  });

  it('drops attributes with the drop attribute policy', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map([
        ['A', new Map([['drop', {policyAction: AttributePolicyAction.DROP}]])],
      ]),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(sanitizerTable, '<a drop></a>');
    expect(sanitized).toBe('<a></a>');
  });

  it('keeps attributes with the keep attribute policy', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map([
        ['A', new Map([['keep', {policyAction: AttributePolicyAction.KEEP}]])],
      ]),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(sanitizerTable, '<a keep="value"></a>');
    expect(sanitized).toBe('<a keep="value"></a>');
  });

  it('sanitizes attributes with the sanitize url attribute policy', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map<string, ElementPolicy>([
        [
          'A',
          new Map<string, AttributePolicy>([
            [
              'sanitize_url',
              {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL},
            ],
          ]),
        ],
      ]),
      new Set(),
      new Map<string, AttributePolicy>(),
    );

    const sanitized = sanitize(
      sanitizerTable,
      '<a sanitize_url="javascript:evil()"></a>',
    );
    expect(sanitized).toBe('<a sanitize_url="about:invalid#zClosurez"></a>');
  });

  it('normalizes attributes with the normalize attribute policy', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(),
      new Map([
        [
          'A',
          new Map([
            [
              'normalize',
              {policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE},
            ],
          ]),
        ],
      ]),
      new Set(),
      new Map(),
    );

    const sanitized = sanitize(sanitizerTable, '<a normalize="VALUE"></a>');
    expect(sanitized).toBe('<a normalize="value"></a>');
  });

  it('keeps the value dependent attribute when all of the conditions are met', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map([
        [
          'value_dependent_attribute',
          {
            policyAction: AttributePolicyAction.KEEP,
            conditions: new Map([
              ['constrained_attribute', new Set(['accepted_value'])],
              ['another_attribute', new Set(['accepted_value'])],
            ]),
          },
        ],
        ['constrained_attribute', {policyAction: AttributePolicyAction.KEEP}],
        ['another_attribute', {policyAction: AttributePolicyAction.KEEP}],
      ]),
    );

    const sanitized = sanitize(
      sanitizerTable,
      '<a value_dependent_attribute="" constrained_attribute="accepted_value" another_attribute="accepted_value"></a>',
    );
    const expectedValues = [
      '<a value_dependent_attribute="" constrained_attribute="accepted_value" another_attribute="accepted_value"></a>',
      '<a value_dependent_attribute="" another_attribute="accepted_value" constrained_attribute="accepted_value"></a>',
      '<a constrained_attribute="accepted_value" value_dependent_attribute="" another_attribute="accepted_value"></a>',
      '<a another_attribute="accepted_value" constrained_attribute="accepted_value" value_dependent_attribute=""></a>',
    ];
    expect(expectedValues).toContain(sanitized);
  });

  it('removes the value dependent attribute when not all of the conditions are met', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map([
        [
          'value_dependent_attribute',
          {
            policyAction: AttributePolicyAction.KEEP,
            conditions: new Map([
              ['constrained_attribute', new Set(['accepted_value'])],
              ['another_attribute', new Set(['accepted_value'])],
            ]),
          },
        ],
        ['constrained_attribute', {policyAction: AttributePolicyAction.KEEP}],
        ['another_attribute', {policyAction: AttributePolicyAction.KEEP}],
      ]),
    );

    const sanitized = sanitize(
      sanitizerTable,
      '<a value_dependent_attribute="" constrained_attribute="accepted_value" another_attribute="invalid_value"></a>',
    );
    const expectedValues = [
      '<a another_attribute="invalid_value" constrained_attribute="accepted_value"></a>',
      '<a constrained_attribute="accepted_value" another_attribute="invalid_value"></a>',
    ];
    expect(expectedValues).toContain(sanitized);
  });

  it('removes the value dependent attribute when the constrained attribute has an improper value', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map([
        [
          'value_dependent_attribute',
          {
            policyAction: AttributePolicyAction.KEEP,
            conditions: new Map([
              ['constrained_attribute', new Set(['accepted_value'])],
            ]),
          },
        ],
        ['constrained_attribute', {policyAction: AttributePolicyAction.KEEP}],
      ]),
    );

    const sanitized = sanitize(
      sanitizerTable,
      '<a value_dependent_attribute="" constrained_attribute="invalid_value"></a>',
    );
    expect(sanitized).toBe('<a constrained_attribute="invalid_value"></a>');
  });

  it('keeps the value dependent attribute when none of the constraint attributes are specified', () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['A']),
      new Map(),
      new Set(),
      new Map([
        [
          'value_dependent_attribute',
          {
            policyAction: AttributePolicyAction.KEEP,
            conditions: new Map([
              ['constrained_attribute', new Set(['accepted_value'])],
            ]),
          },
        ],
        ['constrained_attribute', {policyAction: AttributePolicyAction.KEEP}],
      ]),
    );

    const sanitized = sanitize(
      sanitizerTable,
      '<a value_dependent_attribute=""></a>',
    );
    expect(sanitized).toBe('<a value_dependent_attribute=""></a>');
  });

  it('does not load external resources during sanitization', async () => {
    const sanitizerTable = new SanitizerTable(
      new Set(['IMG', 'AUDIO', 'VIDEO']),
      new Map([
        ['IMG', new Map([['src', {policyAction: AttributePolicyAction.KEEP}]])],
        [
          'AUDIO',
          new Map([['src', {policyAction: AttributePolicyAction.KEEP}]]),
        ],
        [
          'VIDEO',
          new Map([['src', {policyAction: AttributePolicyAction.KEEP}]]),
        ],
      ]),
      new Set(),
      new Map(),
    );
    const html = `
      <img   src=ftp://not-load-subresources>
      <audio src=ftp://not-load-subresources></audio>
      <video src=ftp://not-load-subresources></video>`;

    sanitize(sanitizerTable, html);

    // Give the subresources a little time to load.
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const entry = performance
      .getEntries()
      .find((entry) => entry.name.startsWith('ftp://not-load-subresources'));

    expect(entry).toBeUndefined();
  });

  describe('with resourceUrlPolicy', () => {
    it(
      'keeps attributes marked as KEEP_AND_USE_RESOURCE_URL_POLICY or KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET' +
        ' unchanged when the resourceUrlPolicy is undefined',
      () => {
        const sanitizerTable = new SanitizerTable(
          new Set(['IMG']),
          new Map([
            [
              'IMG',
              new Map([
                [
                  'src_local',
                  {
                    policyAction:
                      AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
                  },
                ],
                [
                  'srcset_local',
                  {
                    policyAction:
                      AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
                  },
                ],
              ]),
            ],
          ]),
          new Set(),
          new Map([
            [
              'src_global',
              {
                policyAction:
                  AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
              },
            ],
            [
              'srcset_global',
              {
                policyAction:
                  AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
              },
            ],
          ]),
        );

        const sanitized = sanitize(
          sanitizerTable,
          '<img src_local="https://google.com/local" src_global="https://google.com/global">' +
            '<img srcset_local="https://google.com/local" srcset_global="https://google.com/global">',
          undefined,
          undefined,
          /* resourceUrlPolicy= */ undefined,
        );

        expect(sanitized).toEqual(
          '<img src_local="https://google.com/local" src_global="https://google.com/global" />' +
            '<img srcset_local="https://google.com/local" srcset_global="https://google.com/global" />',
        );
      },
    );

    it('calls the resourceUrlPolicy when passed with attributes marked KEEP_AND_USE_RESOURCE_URL_POLICY', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'src_local',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map([
          [
            'src_global',
            {
              policyAction:
                AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
            },
          ],
        ]),
      );
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>('resourceUrlPolicy')
        .and.returnValue(new URL('https://google.com'));

      sanitize(
        sanitizerTable,
        '<img src_local="https://google.com/local" src_global="https://google.com/global">',
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(resourceUrlPolicy).toHaveBeenCalledTimes(2);
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/local'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'src_local',
          elementName: 'IMG',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/global'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'src_global',
          elementName: 'IMG',
        },
      );
    });

    it('calls the resourceUrlPolicy when passed with attributes marked KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'srcset_local',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map([
          [
            'srcset_global',
            {
              policyAction:
                AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
            },
          ],
        ]),
      );
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>('resourceUrlPolicy')
        .and.returnValue(new URL('https://google.com'));

      sanitize(
        sanitizerTable,
        `<img
            srcset_local="https://google.com/local1 1x, https://google.com/local2 2x"
            srcset_global="https://google.com/global1 480w, https://google.com/global2 960w">`,
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(resourceUrlPolicy).toHaveBeenCalledTimes(4);
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/local1'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'srcset_local',
          elementName: 'IMG',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/local2'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'srcset_local',
          elementName: 'IMG',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/global1'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'srcset_global',
          elementName: 'IMG',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://google.com/global2'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'srcset_global',
          elementName: 'IMG',
        },
      );
    });

    it('sets the attribute to the sanitized URL when the resourceUrlPolicy returns a URL', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'src',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
                },
              ],
              [
                'srcset',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map(),
      );
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>('resourceUrlPolicy')
        .and.returnValue(new URL('https://returned.by.policy'));

      const sanitized = sanitize(
        sanitizerTable,
        '<img src="https://google.com/local" srcset="https://google.com/url1 1x, https://google.com/url2 2x">',
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(sanitized).toEqual(
        '<img src="https://returned.by.policy/" srcset="https://returned.by.policy/ 1x , https://returned.by.policy/ 2x" />',
      );
    });

    it('passes about:invalid to the resourceUrlPolicy when the attribute value is not a valid URL', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'src',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
                },
              ],
              [
                'srcset',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map(),
      );
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>('resourceUrlPolicy')
        .and.returnValue(new URL('https://google.com'));

      sanitize(
        sanitizerTable,
        '<img src="https://invalid-port:444444444/abc" srcset="https://invalid-port:444444444/abc 1x, https://invalid-port:444444444/abc 2x">',
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(resourceUrlPolicy).toHaveBeenCalledTimes(3);
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('about:invalid'),
        jasmine.anything(),
      );
    });

    it('drops the attribute when the resourceUrlPolicy returns null', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'src',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map(),
      );
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>('resourceUrlPolicy')
        .and.returnValue(null);

      const sanitized = sanitize(
        sanitizerTable,
        '<img src="https://google.com/">',
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(sanitized).toEqual('<img />');
    });

    it('drops an image candidate string from srcset when the resourceUrlPolicy returns null', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['IMG']),
        new Map([
          [
            'IMG',
            new Map([
              [
                'srcset',
                {
                  policyAction:
                    AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
                },
              ],
            ]),
          ],
        ]),
        new Set(),
        new Map(),
      );
      const resourceUrlPolicy: ResourceUrlPolicy = (url) => {
        return url.pathname.endsWith('forbid') ? null : url;
      };

      const sanitized = sanitize(
        sanitizerTable,
        '<img srcset="https://google.com/forbid 1x, https://google.com/allow 2x, https://google.com/forbid 3x">',
        undefined,
        undefined,
        resourceUrlPolicy,
      );

      expect(sanitized).toEqual('<img srcset="https://google.com/allow 2x" />');
    });
  });

  describe('with styleElementSanitizer and styleAttributeSanitizer', () => {
    it('calls the styleElementSanitizer when passed', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['STYLE']),
        new Map([]),
        new Set(),
        new Map(),
      );
      const styleElementSanitizer = jasmine
        .createSpy<CssSanitizationFn>('styleElementSanitizer')
        .and.returnValue('SANITIZED_CSS');

      const sanitized = sanitize(
        sanitizerTable,
        '<style>dangerous css {}</style>',
        styleElementSanitizer,
      );

      expect(sanitized).toEqual('<style>SANITIZED_CSS</style>');
      expect(styleElementSanitizer).toHaveBeenCalledWith('dangerous css {}');
    });

    it('keeps the stylesheet unsanitized when styleElementSanitizer is not passed', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['STYLE']),
        new Map([]),
        new Set(),
        new Map(),
      );

      const sanitized = sanitize(
        sanitizerTable,
        '<style>dangerous css {}</style>',
      );

      expect(sanitized).toEqual('<style>dangerous css {}</style>');
    });

    it('calls the styleAttributeSanitizer when passed', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A']),
        new Map(),
        new Set(),
        new Map([
          [
            'style',
            {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_STYLE},
          ],
        ]),
      );
      const styleAttributeSanitizer = jasmine
        .createSpy<CssSanitizationFn>('styleAttributeSanitizer')
        .and.returnValue('SANITIZED_CSS');

      const sanitized = sanitize(
        sanitizerTable,
        '<a style="dangerous-property: attack;"></a>',
        undefined,
        styleAttributeSanitizer,
      );

      expect(sanitized).toEqual('<a style="SANITIZED_CSS"></a>');
      expect(styleAttributeSanitizer).toHaveBeenCalledWith(
        'dangerous-property: attack;',
      );
    });

    it('keeps the stylesheet unsanitized when styleAttributeSanitizer is not passed', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A']),
        new Map(),
        new Set(),
        new Map([
          [
            'style',
            {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_STYLE},
          ],
        ]),
      );

      const sanitized = sanitize(
        sanitizerTable,
        '<a style="dangerous-property: attack;"></a>',
      );

      expect(sanitized).toEqual('<a style="dangerous-property: attack;"></a>');
    });
  });

  describe('sanitizeAssertUnchanged', () => {
    it('throws an error when an element is dropped', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['DIV']),
        new Map(),
        new Set(),
        new Map([]),
      );

      expect(() =>
        sanitizeAssertUnchanged(
          sanitizerTable,
          '<b>should remove unknown elements</b>',
        ),
      ).toThrowMatching((e) => e.message.includes(`Element: B was dropped`));
    });

    it('throws an error when an attribute is dropped', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([]),
      );

      expect(() =>
        sanitizeAssertUnchanged(sanitizerTable, '<a unknown_attr=""> </a>'),
      ).toThrowMatching((e) =>
        e.message.includes(`Attribute: unknown_attr was dropped`),
      );
    });

    it('throws an error when there is some unsatisfied constraint for a value dependent attribute', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([
          [
            'value_dependent_attribute',
            {
              policyAction: AttributePolicyAction.KEEP,
              conditions: new Map([
                ['constrained_attribute', new Set(['accepted_value'])],
              ]),
            },
          ],
          ['constrained_attribute', {policyAction: AttributePolicyAction.KEEP}],
        ]),
      );

      const sanitizer = new HtmlSanitizerImpl(sanitizerTable, secretToken);
      expect(() =>
        sanitizer.sanitizeAssertUnchanged(
          '<a value_dependent_attribute="" constrained_attribute="unacceptable_value"></a>',
        ),
      ).toThrowMatching((e) =>
        e.message.includes(
          `Not all conditions satisfied for attribute: value_dependent_attribute.`,
        ),
      );
    });

    it('throws an error when a url is modified', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([
          [
            'sanitize_url',
            {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL},
          ],
        ]),
      );

      expect(() =>
        sanitizeAssertUnchanged(
          sanitizerTable,
          '<a sanitize_url="javascript:evil()"></a>',
        ),
      ).toThrowMatching((e) =>
        e.message.includes(
          `Original url:"javascript:evil()" was sanitized to: "about:invalid#zClosurez"`,
        ),
      );
    });

    it('does not throw an error when the provided input does not change', () => {
      expect(sanitizeHtmlAssertUnchanged('<a></a>').toString()).toBe('<a></a>');
    });

    it('does not throw an error when an attribute value is normalized', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([
          [
            'normalize',
            {policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE},
          ],
        ]),
      );

      expect(
        sanitizeAssertUnchanged(
          sanitizerTable,
          '<a normalize="VALUE"></a>',
        ).toString(),
      ).toBe('<a normalize="value"></a>');
    });

    it('does not throw an error when dropping `body` elements', () => {
      expect(sanitizeHtmlAssertUnchanged('<body></body>').toString()).toBe('');
    });

    it('does not throw an error when passed unbalanced html', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([]),
      );

      expect(
        sanitizeAssertUnchanged(
          sanitizerTable,
          '<a>unbalanced html',
        ).toString(),
      ).toBe('<a>unbalanced html</a>');
    });

    it('does not throw an error when a comment is dropped', () => {
      const sanitizerTable = new SanitizerTable(
        new Set(['A', 'DIV']),
        new Map(),
        new Set(),
        new Map([]),
      );

      expect(
        sanitizeAssertUnchanged(
          sanitizerTable,
          '<a></a><!-- Some comment-->',
        ).toString(),
      ).toBe('<a></a>');
    });
  });
});

describe('parseSrcset', () => {
  interface TestCase {
    input: string;
    expected: Srcset;
  }
  const TEST_CASES: TestCase[] = [
    {
      input: 'url',
      expected: {parts: [{url: 'url', descriptor: undefined}]},
    },
    {
      input: 'url, url2',
      expected: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: undefined},
        ],
      },
    },
    {
      input: 'url, url2\n1x',
      expected: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: '1x'},
        ],
      },
    },
    {
      input: '  url, url2 1x,  url3   2x ',
      expected: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: '1x'},
          {url: 'url3', descriptor: '2x'},
        ],
      },
    },
    {
      input: '  url1\n480w,url2\t640w, url3 960w',
      expected: {
        parts: [
          {url: 'url1', descriptor: '480w'},
          {url: 'url2', descriptor: '640w'},
          {url: 'url3', descriptor: '960w'},
        ],
      },
    },
  ];

  for (const testCase of TEST_CASES) {
    it(`parses ${JSON.stringify(testCase.input)} correctly`, () => {
      expect(parseSrcset(testCase.input)).toEqual(testCase.expected);
    });
  }
});

describe('serializeSrcset', () => {
  interface TestCase {
    input: Srcset;
    expected: string;
  }
  const TEST_CASES: TestCase[] = [
    {
      input: {parts: [{url: 'url', descriptor: undefined}]},
      expected: 'url',
    },
    {
      input: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: undefined},
        ],
      },
      expected: 'url , url2',
    },
    {
      input: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: '1x'},
        ],
      },
      expected: 'url , url2 1x',
    },
    {
      input: {
        parts: [
          {url: 'url', descriptor: undefined},
          {url: 'url2', descriptor: '1x'},
          {url: 'url3', descriptor: '2x'},
        ],
      },
      expected: 'url , url2 1x , url3 2x',
    },
    {
      input: {
        parts: [
          {url: 'url1', descriptor: '480w'},
          {url: 'url2', descriptor: '640w'},
          {url: 'url3', descriptor: '960w'},
        ],
      },
      expected: 'url1 480w , url2 640w , url3 960w',
    },
  ];

  for (const testCase of TEST_CASES) {
    it(`serializes ${JSON.stringify(testCase.input)} correctly`, () => {
      expect(serializeSrcset(testCase.input)).toEqual(testCase.expected);
    });
  }
});
