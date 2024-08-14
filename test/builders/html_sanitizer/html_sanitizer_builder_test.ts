/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CssSanitizerBuilder,
  HtmlSanitizerBuilder,
} from '../../../src/builders/html_sanitizer/html_sanitizer_builder';
import {
  ResourceUrlPolicy,
  ResourceUrlPolicyHintsType,
} from '../../../src/builders/html_sanitizer/resource_url_policy';

describe('html sanitizer builder test', () => {
  it('throws an error when calling build twice', () => {
    const sanitizerBuilder = new HtmlSanitizerBuilder();
    sanitizerBuilder.build();

    expect(() => sanitizerBuilder.build()).toThrowError(
      'this sanitizer has already called build',
    );
  });

  describe('when calling onlyAllowElements:', () => {
    it('allows elements that its called with', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowElements(new Set<string>(['article']))
        .build();

      expect(sanitizer.sanitize('<article></article>').toString()).toEqual(
        '<article></article>',
      );
    });

    it('allows elements that have attribute policies', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowElements(new Set<string>(['a']))
        .build();

      expect(
        sanitizer.sanitize('<a href="https://www.google.com"></a>').toString(),
      ).toEqual('<a href="https://www.google.com"></a>');
    });

    it('removes elements that were not set', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowElements(new Set<string>(['article']))
        .build();

      expect('').toEqual(sanitizer.sanitize('<a></a>').toString());
    });

    it('throws an error when called with an element not allowed by default.', () => {
      expect(() =>
        new HtmlSanitizerBuilder().onlyAllowElements(
          new Set<string>(['madeupelement']),
        ),
      ).toThrowError(
        'Element: MADEUPELEMENT, is not allowed by html5_contract.textpb',
      );
    });

    it('becomes more restrictive with successive calls rather than replacing the previous set', () => {
      const sanitizerBuilder = new HtmlSanitizerBuilder().onlyAllowElements(
        new Set<string>(['a']),
      );

      expect(() =>
        sanitizerBuilder.onlyAllowElements(new Set<string>(['article'])),
      ).toThrowError(
        'Element: ARTICLE, is not allowed by html5_contract.textpb',
      );
    });

    it("doesn't reallow attributes that were disallowed in onlyAllowAttributes", () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowAttributes(new Set<string>(['href']))
        .onlyAllowElements(new Set<string>(['area']))
        .build();
      expect(
        sanitizer
          .sanitize(
            '<a href="https://google.com" ></a><area href="https://google.com" />',
          )
          .toString(),
      ).toEqual('<area href="https://google.com" />');
    });
  });

  describe('when calling allowCustomElements:', () => {
    it('allows elements that its called with', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowCustomElement('my-element')
        .build();

      expect(
        sanitizer.sanitize('<my-element></my-element>').toString(),
      ).toEqual('<my-element></my-element>');
    });

    it('does not override onlyAllowElements', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowElements(new Set<string>(['article']))
        .allowCustomElement('my-element')
        .build();

      expect(sanitizer.sanitize('<article></article>').toString()).toEqual(
        '<article></article>',
      );
    });

    it('allows attributes on custom elements', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowCustomElement('my-element', new Set<string>(['my-attribute']))
        .build();

      expect(
        sanitizer
          .sanitize('<my-element my-attribute="value"></my-element>')
          .toString(),
      ).toEqual('<my-element my-attribute="value"></my-element>');
    });

    it('allows attributes on custom elements and is case insensitive', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowCustomElement('my-element', new Set<string>(['myAttribute']))
        .build();

      expect(
        sanitizer
          .sanitize(
            '<my-element myAttribute="value"></my-element><my-element myattribute="value"></my-element>',
          )
          .toString(),
      ).toEqual(
        '<my-element myattribute="value"></my-element><my-element myattribute="value"></my-element>',
      );
    });

    it('removes non-allowed attributes on custom elements', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowCustomElement('my-element', new Set<string>(['my-attribute']))
        .build();

      expect(
        sanitizer
          .sanitize('<my-element my-other-attribute="value"></my-element>')
          .toString(),
      ).toEqual('<my-element></my-element>');
    });

    it('removes other custom elements', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowCustomElement('my-element')
        .build();

      expect('').toEqual(
        sanitizer.sanitize('<my-other-element></my-other-element>').toString(),
      );
    });

    it('throws an error when a non-custom-element name is provided', () => {
      expect(() =>
        new HtmlSanitizerBuilder().allowCustomElement('foo').build(),
      ).toThrowError('Element: FOO is not a custom element');
    });

    it('throws an error when a reserved name is provided', () => {
      expect(() =>
        new HtmlSanitizerBuilder().allowCustomElement('font-face').build(),
      ).toThrowError('Element: FONT-FACE is not a custom element');
    });
  });

  describe('when calling onlyAllowAttributes:', () => {
    it('allows global attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowAttributes(new Set<string>(['width']))
        .build();

      expect(
        sanitizer.sanitize('<img width="500" height="600"></img>').toString(),
      ).toEqual('<img width="500" />');
    });

    it('allows global attributes with policies', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowAttributes(new Set<string>(['target']))
        .build();
      expect(
        sanitizer
          .sanitize('<a target="_self" media="something"></a>')
          .toString(),
      ).toEqual('<a target="_self"></a>');
    });

    it("doesn't reallow elements that were disallowed in onlyAllowElements", () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowElements(new Set<string>(['area']))
        .onlyAllowAttributes(new Set<string>(['href']))
        .build();

      expect(
        sanitizer
          .sanitize(
            '<a href="https://google.com" ></a><area href="https://google.com" ></area>',
          )
          .toString(),
      ).toEqual('<area href="https://google.com" />');
    });
  });

  describe('when calling allowDataAttributes:', () => {
    it('allows data attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowDataAttributes(['data-foo'])
        .build();

      expect(
        sanitizer.sanitize('<article data-foo="hello"></article>').toString(),
      ).toEqual('<article data-foo="hello"></article>');
    });

    it('throws an error when the attribute name is not prefixed with data', () => {
      expect(() =>
        new HtmlSanitizerBuilder().allowDataAttributes(['foo']).build(),
      ).toThrowError(
        'data attribute: foo does not begin with the prefix "data-"',
      );
    });

    it('allows data attributes when called with onlyAllowAttributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .onlyAllowAttributes(new Set<string>(['src']))
        .allowDataAttributes(['data-foo'])
        .build();

      expect(
        sanitizer
          .sanitize(
            '<article data-foo="hello" src="https://google.com"></article>',
          )
          .toString(),
      ).toEqual('<article data-foo="hello"></article>');
    });
  });

  describe('when calling allowStyleAttributes:', () => {
    it('allows style attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowStyleAttributes()
        .build();

      expect(
        sanitizer
          .sanitize(
            '<div style="background-image: url(http://www.example.com/image3.jpg);"></div>',
          )
          .toString(),
      ).toEqual(
        '<div style="background-image: url(http://www.example.com/image3.jpg);"></div>',
      );
    });
  });

  describe('when calling allowClassAttributes():', () => {
    it('allows class attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowClassAttributes()
        .build();

      expect(
        sanitizer.sanitize('<div class="my-class"></div>').toString(),
      ).toEqual('<div class="my-class"></div>');
    });
  });

  describe('when calling allowIdAttributes():', () => {
    it('allows id attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder().allowIdAttributes().build();

      expect(sanitizer.sanitize('<div id="my-id"></div>').toString()).toEqual(
        '<div id="my-id"></div>',
      );
    });
  });

  describe('when calling allowIdReferenceAttributes():', () => {
    it('allows idref attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
        .allowIdReferenceAttributes()
        .build();

      expect(
        sanitizer.sanitize('<div aria-labelledby="my-id"></div>').toString(),
      ).toEqual('<div aria-labelledby="my-id"></div>');
    });
  });

  describe('when calling withResourceUrlPolicy:', () => {
    it('sets resourceUrlPolicy to the provided value', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(new URL('https://returned.by.policy'));
      const sanitizer = new HtmlSanitizerBuilder()
        .withResourceUrlPolicy(resourceUrlPolicy)
        .build();

      const sanitized = sanitizer.sanitize(
        '<img src="https://google.com"></img>',
      );

      expect(resourceUrlPolicy).toHaveBeenCalledOnceWith(
        new URL('https://google.com'),
        {
          type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
          attributeName: 'src',
          elementName: 'IMG',
        },
      );
      expect(sanitized.toString()).toEqual(
        '<img src="https://returned.by.policy/" />',
      );
    });
  });
});

describe('CssSanitizerBuilder', () => {
  const STYLE_SELECTOR = 'style:not(#safevalues-internal-style)';
  const ELEMENT_NAME = 'safevalues-with-css';

  /** Helper function to find the element with sanitized shadow root. */
  function findShadowRoot(root: ParentNode): ShadowRoot | null | undefined {
    return root.querySelector(ELEMENT_NAME)?.shadowRoot;
  }

  // Overriding attachShadow (and changing the mode to 'open') is necessary to
  // inspect the contents of the shadow DOM.
  let originalAttachShadow: typeof Element.prototype.attachShadow;
  beforeEach(() => {
    originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (this: Element) {
      return originalAttachShadow.call(this, {mode: 'open'});
    };
  });
  afterEach(() => {
    Element.prototype.attachShadow = originalAttachShadow;
  });

  describe('sanitizeToFragment', () => {
    it('returns an instance of DocumentFragment', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const element = sanitizer.sanitizeToFragment('<div></div>');
      expect(element).toBeInstanceOf(DocumentFragment);
    });

    it('returns a DocumentFragment whose only child is the sanitized element with shadow DOM', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const element = sanitizer.sanitizeToFragment('<div></div>');
      expect(element.children.length).toBe(1);
      expect(element.children[0].tagName.toLowerCase()).toBe(ELEMENT_NAME);
      expect(element.children[0].shadowRoot).not.toBeNull();
    });

    it('adds internal CSS to the shadow DOM', () => {
      // Note that we don't test the exact content of the CSS so that this test
      // doesn't become a "change detector".
      const sanitizer = new CssSanitizerBuilder().build();
      const sanitized = sanitizer.sanitizeToFragment('<div></div>');
      const internalStyle = findShadowRoot(sanitized)?.querySelector(
        'style#safevalues-internal-style',
      );
      expect(internalStyle).not.toBeNull();
      expect(internalStyle?.textContent).toContain(':host');
    });

    it('keeps all STYLE elements', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const sanitized = sanitizer.sanitizeToFragment(
        '<div></div><style id="style1"></style><style id="style2"></style>',
      );

      const elements =
        findShadowRoot(sanitized)?.querySelectorAll(STYLE_SELECTOR);

      expect(elements).toHaveSize(2);
      expect(Array.from(elements!).map((e) => e.id)).toEqual(
        jasmine.arrayWithExactContents(['style1', 'style2']),
      );
    });

    it('keeps the STYLE attribute', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const sanitized = sanitizer.sanitizeToFragment(
        '<div style="background-image: url(http://www.example.com/image3.jpg);"></div>',
      );
      const div = findShadowRoot(sanitized)?.querySelector('div');
      const styleAttribute = div?.getAttribute('style');
      expect(styleAttribute).not.toBeNull();
    });

    it('sanitizes the content of the STYLE element', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `<div>Hello</div><style>p { color: RED; fake-property: abcd; }</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe('p { color: red; }');
    });

    it('sanitizes the content of the STYLE attribute', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `<div style="color: red; fake-property: abcd;"></div>`;
      const output = sanitizer.sanitizeToFragment(input);
      const div = findShadowRoot(output)?.querySelector('div');
      expect(div?.getAttribute('style')).toBe('color: red;');
    });

    it('disallows animations by default', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `
            <div>Hello</div>
            <style>
              @keyframes keyframes {
                from { color: red; }
                to { color: blue; }
              }
              div {
                animation-duration: 1s;
                animation-name: test;
              }
            </style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe('div {  }');
    });

    it('allows animations after allowAnimations is called', () => {
      const sanitizer = new CssSanitizerBuilder().allowAnimations().build();
      const input = `
          <div>Hello</div>
          <style>
            @keyframes keyframes {
              from { color: red; }
              to { color: blue; }
            }
            div {
              animation-duration: 1s;
              animation-name: test;
            }
          </style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe(
        '@keyframes keyframes { 0% { color: red; } 100% { color: blue; } }\n' +
          'div { animation-duration: 1s;animation-name: test; }',
      );
    });

    it('disallows transition-* properties by default', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `<div>Hello</div><style>div { transition-duration: 1s; transition-property: width }</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe('div {  }');
    });

    it('disallows transition shorthand by default', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `<div>Hello</div><style>div { transition: all 1s; }</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe('div {  }');
    });

    it('allows transition-* properties after allowTransitions is called', () => {
      const sanitizer = new CssSanitizerBuilder().allowTransitions().build();
      const input = `<div>Hello</div><style>div { transition-duration: 1s; transition-property: width }</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toBe(
        'div { transition-duration: 1s;transition-property: width; }',
      );
    });

    it('allows transition shorthand after allowTransitions is called', () => {
      const sanitizer = new CssSanitizerBuilder().allowTransitions().build();
      const input = `<div>Hello</div><style>div { transition: all 1s; }</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      // Different browsers expand the shorthand differently, and this is not
      // a specced behavior so it's easier to just check that the shorthand is
      // not removed.
      expect(style?.textContent).not.toEqual('div {  }');
    });

    it('allows all URLs when resource URL policy is not set', () => {
      const sanitizer = new CssSanitizerBuilder().build();
      const input = `<div>Hello</div><style>*{background-image: url(https://www.google.com/image.png)}</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toEqual(
        '* { background-image: url("https://www.google.com/image.png"); }',
      );
    });

    it('when resource URL policy is set, its return value is used as URL', () => {
      const sanitizer = new CssSanitizerBuilder()
        .withResourceUrlPolicy(() => {
          return new URL('https://returned.by.policy');
        })
        .build();
      const input = `<div>Hello</div><style>*{background-image: url(https://www.google.com/image.png)}</style>`;
      const output = sanitizer.sanitizeToFragment(input);
      const style = findShadowRoot(output)?.querySelector(STYLE_SELECTOR);
      expect(style?.textContent).toEqual(
        '* { background-image: url("https://returned.by.policy/"); }',
      );
    });
  });
});
