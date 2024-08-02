/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {HtmlSanitizerBuilder} from '../../../src/builders/html_sanitizer/html_sanitizer_builder';
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
