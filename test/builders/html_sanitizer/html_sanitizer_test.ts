/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {secretToken} from '../../../src/internals/secrets';
import {HTML_TEST_VECTORS} from '../../testing/testvectors/html_test_vectors';

import {
  HtmlSanitizerImpl,
  sanitizeHtml,
  sanitizeHtmlAssertUnchanged,
} from '../../../src/builders/html_sanitizer/html_sanitizer';
import {
  AttributePolicy,
  AttributePolicyAction,
  ElementPolicy,
  SanitizerTable,
} from '../../../src/builders/html_sanitizer/sanitizer_table/sanitizer_table';

function sanitize(table: SanitizerTable, html: string): string {
  return new HtmlSanitizerImpl(table, secretToken).sanitize(html).toString();
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
