/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {HtmlSanitizerBuilder} from '../../../src/builders/html_sanitizer/html_sanitizer_builder';

describe('html sanitizer builder test', () => {
  it('throws an error when calling build twice', () => {
    const sanitizerBuilder = new HtmlSanitizerBuilder();
    sanitizerBuilder.build();

    expect(() => sanitizerBuilder.build())
        .toThrowError('this sanitizer has already called build');
  });

  describe('when calling onlyAllowElements:', () => {
    it('allows elements that its called with', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowElements(new Set<string>(['article']))
                            .build();

      const expectedValues = [
        '<article></article>',
        '<article />',
      ];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<article></article>').toString());
    });

    it('allows elements that have attribute policies', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowElements(new Set<string>(['a']))
                            .build();

      const expectedValues = [
        '<a href="https://www.google.com"></a>',
        '<a href="https://www.google.com" />',
      ];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<a href="https://www.google.com"></a>')
                         .toString());
    });

    it('removes elements that were not set', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowElements(new Set<string>(['article']))
                            .build();

      expect('<a></a>').toContain(sanitizer.sanitize('').toString());
    });

    it('throws an error when called with an element not allowed by default.', () => {
      expect(
          () => new HtmlSanitizerBuilder().onlyAllowElements(
              new Set<string>(['madeupelement'])))
          .toThrowError(
              'Element: MADEUPELEMENT, is not allowed by html5_contract.textpb');
    });

    it('becomes more restrictive with successive calls rather than replacing the previous set',
       () => {
         const sanitizerBuilder = new HtmlSanitizerBuilder().onlyAllowElements(
             new Set<string>(['a']));

         expect(
             () => sanitizerBuilder.onlyAllowElements(
                 new Set<string>(['article'])))
             .toThrowError(
                 'Element: ARTICLE, is not allowed by html5_contract.textpb');
       });

    it('doesn\'t reallow attributes that were disallowed in onlyAllowAttributes',
       () => {
         const sanitizer = new HtmlSanitizerBuilder()
                               .onlyAllowAttributes(new Set<string>(['href']))
                               .onlyAllowElements(new Set<string>(['area']))
                               .build();
         const expectedValues = [
           '<area href="https://google.com" ></area>',
           '<area href="https://google.com" />',
         ];
         expect(expectedValues)
             .toContain(
                 sanitizer
                     .sanitize(
                         '<a href="https://google.com" ></a><area href="https://google.com" ></area>')
                     .toString());
       });
  });

  describe('when calling onlyAllowAttributes:', () => {
    it('allows global attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowAttributes(new Set<string>(['width']))
                            .build();
      const expectedValues = [
        '<img width="500"></img>',
        '<img width="500" />',
      ];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<img width="500" height="600"></img>')
                         .toString());
    });

    it('allows global attributes with policies', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowAttributes(new Set<string>(['target']))
                            .build();
      const expectedValues = [
        '<a target="_self"></a>',
        '<a target="_self" />',
      ];
      expect(expectedValues)
          .toContain(
              sanitizer.sanitize('<a target="_self" media="something"></a>')
                  .toString());
    });
    it('doesn\'t reallow elements that were disallowed in onlyAllowElements',
       () => {
         const sanitizer = new HtmlSanitizerBuilder()
                               .onlyAllowElements(new Set<string>(['area']))
                               .onlyAllowAttributes(new Set<string>(['href']))
                               .build();
         const expectedValues = [
           '<area href="https://google.com" ></area>',
           '<area href="https://google.com" />',
         ];
         expect(expectedValues)
             .toContain(
                 sanitizer
                     .sanitize(
                         '<a href="https://google.com" ></a><area href="https://google.com" ></area>')
                     .toString());
       });
  });

  describe('when calling allowDataAttributes:', () => {
    it('allows data attributes', () => {
      const sanitizer =
          new HtmlSanitizerBuilder().allowDataAttributes(['data-foo']).build();

      const expectedValues = [
        '<article data-foo="hello"></article>',
        '<article data-foo="hello" />',
      ];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<article data-foo="hello"></article>')
                         .toString());
    });

    it('throws an error when the attribute name is not prefixed with data',
       () => {
         expect(
             () => new HtmlSanitizerBuilder()
                       .allowDataAttributes(['foo'])
                       .build())
             .toThrowError(
                 'data attribute: foo does not begin with the prefix "data-"');
       });

    it('allows data attributes when called with onlyAllowAttributes', () => {
      const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowAttributes(new Set<string>(['src']))
                            .allowDataAttributes(['data-foo'])
                            .build();
      const expectedValues = [
        '<article data-foo="hello"></article>',
        '<article data-foo="hello" />',
      ];

      expect(expectedValues)
          .toContain(sanitizer.sanitize('<article data-foo="hello" ></article>')
                         .toString());
    });
  });

  describe('when calling allowStyleAttributes:', () => {
    it('allows style attributes', () => {
      const sanitizer =
          new HtmlSanitizerBuilder().allowStyleAttributes().build();

      const expectedValues = [
        '<div style="background-image: url(&quot;http://www.example.com/image3.jpg&quot;);" />',
        '<div style="background-image: url(http://www.example.com/image3.jpg);"></div>'
      ];
      expect(expectedValues)
          .toContain(
              sanitizer
                  .sanitize(
                      '<div style="background-image: url(http://www.example.com/image3.jpg);"></div>')
                  .toString());
    });
  });

  describe('when calling allowClassAttributes():', () => {
    it('allows class attributes', () => {
      const sanitizer =
          new HtmlSanitizerBuilder().allowClassAttributes().build();

      const expectedValues =
          ['<div class="my-class"></div>', '<div class="my-class" />'];
      expect(expectedValues)
          .toContain(
              sanitizer.sanitize('<div class="my-class"></div>').toString());
    });
  });

  describe('when calling allowIdAttributes():', () => {
    it('allows id attributes', () => {
      const sanitizer = new HtmlSanitizerBuilder().allowIdAttributes().build();

      const expectedValues = ['<div id="my-id"></div>', '<div id="my-id" />'];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<div id="my-id"></div>').toString());
    });
  });

  describe('when calling allowIdReferenceAttributes():', () => {
    it('allows idref attributes', () => {
      const sanitizer =
          new HtmlSanitizerBuilder().allowIdReferenceAttributes().build();

      const expectedValues = [
        '<div aria-labelledby="my-id"></div>', '<div aria-labelledby="my-id" />'
      ];
      expect(expectedValues)
          .toContain(sanitizer.sanitize('<div aria-labelledby="my-id"></div>')
                         .toString());
    });
  });
});
