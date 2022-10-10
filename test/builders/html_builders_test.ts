/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {concatHtmls, htmlEscape, scriptToHtml, scriptUrlToHtml} from '../../src/builders/html_builders';
import {safeScript, valueAsScript} from '../../src/builders/script_builders';
import {testonlyResourceUrl} from '../conversions';

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
          .toEqual('a<br>b');
      expect(htmlEscape('&&\n\r\n&', {preserveNewlines: true}).toString())
          .toEqual('&amp;&amp;<br><br>&amp;');
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
      expect(htmlEscape('a \t b', {preserveSpaces: true}).toString())
          .toEqual('a \t&#160;b');
    });

    it('keeps spaces and newlines as expected', () => {
      expect(htmlEscape('a<\n  b', {
               preserveNewlines: true,
               preserveSpaces: true
             }).toString())
          .toEqual('a&lt;<br>&#160; b');
      expect(htmlEscape('a<\n   b', {
               preserveNewlines: true,
               preserveSpaces: true
             }).toString())
          .toEqual('a&lt;<br>&#160; &#160;b');
      expect(htmlEscape('a\r b', {preserveNewlines: true, preserveSpaces: true})
                 .toString())
          .toEqual('a<br>&#160;b');
    });

    it('keeps tabs as expected', () => {
      expect(htmlEscape('a\tb').toString()).toEqual('a\tb');
      expect(htmlEscape('a\tb', {preserveTabs: false}).toString())
          .toEqual('a\tb');
      expect(htmlEscape('a\tb', {preserveTabs: true}).toString())
          .toEqual('a<span style="white-space:pre">\t</span>b');
      expect(htmlEscape('\t\t a\nb', {preserveTabs: true}).toString())
          .toEqual('<span style="white-space:pre">\t\t</span> a\nb');
    });

    it('keeps spaces, tabs, and newlines as expected', () => {
      expect(htmlEscape('\t\t a\nb', {
               preserveNewlines: true,
               preserveSpaces: true,
               preserveTabs: true
             }).toString())
          .toEqual('<span style="white-space:pre">\t\t</span>&#160;a<br>b');
    });
  });

  describe('scriptToHtml', () => {
    it('builds the right tags', () => {
      expect(scriptToHtml(safeScript`const a = b < c;`).toString())
          .toEqual('<script>const a = b < c;</script>');
      expect(
          scriptToHtml(safeScript`const a = b < c;`, {id: 'myid'}).toString())
          .toEqual('<script id="myid">const a = b < c;</script>');
      expect(scriptToHtml(safeScript`const a = b < c;`, {
               nonce: 'mynonce'
             }).toString())
          .toEqual('<script nonce="mynonce">const a = b < c;</script>');
      expect(scriptToHtml(safeScript`const a = b < c;`, {
               id: 'myid',
               nonce: 'mynonce'
             }).toString())
          .toEqual(
              '<script id="myid" nonce="mynonce">const a = b < c;</script>');
    });

    it('allows setting type', () => {
      const json = valueAsScript({
        '@context': 'https://schema.org/',
        '@type': 'Test',
        'name': 'JSON Script',
      });
      expect(scriptToHtml(json, {type: 'application/ld+json'}).toString())
          .toEqual(
              '<script type="application/ld+json">' +
              '{"@context":"https://schema.org/","@type":"Test","name":"JSON Script"}' +
              '</script>');
      expect(scriptToHtml(safeScript`const a = b < c;`, {
               type: 'text/javascript'
             }).toString())
          .toEqual('<script type="text/javascript">const a = b < c;</script>');
    });

    it('escapes attributes', () => {
      const createdSafeScript = safeScript`xyz;`;
      expect(scriptToHtml(createdSafeScript, {id: '<">'}).toString())
          .toEqual('<script id="&lt;&quot;&gt;">xyz;</script>');
      expect(scriptToHtml(createdSafeScript, {nonce: '<">'}).toString())
          .toEqual('<script nonce="&lt;&quot;&gt;">xyz;</script>');
    });
  });

  describe('scriptUrlToHtml', () => {
    it('builds the right tags', () => {
      expect(scriptUrlToHtml(testonlyResourceUrl('//abc<')).toString())
          .toEqual('<script src="//abc&lt;"></script>');
      expect(scriptUrlToHtml(testonlyResourceUrl('//abc<'), {
               async: true
             }).toString())
          .toEqual('<script src="//abc&lt;" async></script>');
      expect(scriptUrlToHtml(testonlyResourceUrl('//abc<'), {
               async: false
             }).toString())
          .toEqual('<script src="//abc&lt;"></script>');
      expect(scriptUrlToHtml(testonlyResourceUrl('//abc<'), {
               async: false,
               nonce: '123'
             }).toString())
          .toEqual('<script src="//abc&lt;" nonce="123"></script>');
      expect(scriptUrlToHtml(testonlyResourceUrl('//abc<<'), {
               async: false,
               nonce: '123'
             }).toString())
          .toEqual('<script src="//abc&lt;&lt;" nonce="123"></script>');
    });

    it('escapes attributes', () => {
      const url = testonlyResourceUrl('//a?b&c');
      expect(scriptUrlToHtml(url, {async: false, nonce: `"'&`}).toString())
          .toEqual(
              '<script src="//a?b&amp;c" nonce="&quot;&apos;&amp;"></script>');
    });
  });

  describe('concatHtmls', () => {
    it('concatenates `SafeHtml` values', () => {
      const html1 = htmlEscape('a');
      const html2 = htmlEscape('b');
      expect(concatHtmls([html1, html2]).toString()).toEqual('ab');
    });
  });
});
