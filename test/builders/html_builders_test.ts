/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {concatHtmls, createScriptSrc, htmlEscape} from '../../src/builders/html_builders';
import {testingConversionToScriptUrl} from '../testing_conversions';

describe('html_builders', () => {
  describe('htmlEscape', () => {
    it('handles metacharacters as expected', () => {
      expect(htmlEscape('a<a').toString()).toEqual('a&lt;a');
      expect(htmlEscape('a>a').toString()).toEqual('a&gt;a');
      expect(htmlEscape('&').toString()).toEqual('&amp;');
      expect(htmlEscape('&amp;').toString()).toEqual('&amp;amp;');
      expect(htmlEscape('&&&').toString()).toEqual('&amp;&amp;&amp;');
      expect(htmlEscape('&&\n&').toString()).toEqual('&amp;&amp;\n&amp;');
    });

    it('keeps new lines as expected', () => {
      expect(htmlEscape('a<\nb').toString()).toEqual('a&lt;\nb');
      expect(htmlEscape('a<\nb', {preserveNewlines: false}).toString())
          .toEqual('a&lt;\nb');
      expect(htmlEscape('a<br />b', {preserveNewlines: true}).toString())
          .toEqual('a&lt;br /&gt;b');
      expect(htmlEscape('a\nb', {preserveNewlines: true}).toString())
          .toEqual('a<br />b');
      expect(htmlEscape('&&\n\r\n&', {preserveNewlines: true}).toString())
          .toEqual('&amp;&amp;<br /><br />&amp;');
      expect(htmlEscape('   a   b   ', {preserveNewlines: true}).toString())
          .toEqual('   a   b   ');
    });

    it('keeps spaces as expected', () => {
      expect(htmlEscape('a<  a').toString()).toEqual('a&lt;  a');
      expect(htmlEscape('a<  a', {preserveSpaces: false}).toString())
          .toEqual('a&lt;  a');
      expect(htmlEscape(' a b ', {preserveSpaces: true}).toString())
          .toEqual('&#160;a b ');
      expect(htmlEscape('  a  b  ', {preserveSpaces: true}).toString())
          .toEqual('&#160; a &#160;b &#160;');
      expect(htmlEscape('   a   b   ', {preserveSpaces: true}).toString())
          .toEqual('&#160; &#160;a &#160; b &#160; ');
      expect(htmlEscape('&&\n &', {preserveSpaces: true}).toString())
          .toEqual('&amp;&amp;\n&#160;&amp;');
      expect(htmlEscape('&&\n  &', {preserveSpaces: true}).toString())
          .toEqual('&amp;&amp;\n&#160; &amp;');
    });

    it('keeps spaces and newlines as expected', () => {
      expect(htmlEscape('a<\n  b', {
               preserveNewlines: true,
               preserveSpaces: true
             }).toString())
          .toEqual('a&lt;<br />&#160; b');
      expect(htmlEscape('a<\n   b', {
               preserveNewlines: true,
               preserveSpaces: true
             }).toString())
          .toEqual('a&lt;<br />&#160; &#160;b');
    });
  });

  describe('createScriptSrc', () => {
    it('builds the right tags', () => {
      expect(createScriptSrc(testingConversionToScriptUrl('//abc<')).toString())
          .toEqual('<script src="//abc&lt;"></script>');
      expect(createScriptSrc(testingConversionToScriptUrl('//abc<'), true)
                 .toString())
          .toEqual('<script src="//abc&lt;" async></script>');
      expect(createScriptSrc(testingConversionToScriptUrl('//abc<'), false)
                 .toString())
          .toEqual('<script src="//abc&lt;"></script>');
      expect(
          createScriptSrc(testingConversionToScriptUrl('//abc<'), false, '123')
              .toString())
          .toEqual('<script src="//abc&lt;" nonce="123"></script>');
      expect(
          createScriptSrc(testingConversionToScriptUrl('//abc<<'), false, '123')
              .toString())
          .toEqual('<script src="//abc&lt;&lt;" nonce="123"></script>');
    });

    it('escapes attributes', () => {
      const url = testingConversionToScriptUrl('//a?b&c');
      expect(createScriptSrc(url, false, `"'&`).toString())
          .toEqual(
              '<script src="//a?b&amp;c" nonce="&quot;&apos;&amp;"></script>');
    });
  });

  describe('concatHtmls', () => {
    it('concatenates `TrustedHTML` values', () => {
      const html1 = htmlEscape('a');
      const html2 = htmlEscape('b');
      expect(concatHtmls([html1, html2]).toString()).toEqual('ab');
    });
  });
});
