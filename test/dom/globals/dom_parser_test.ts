/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeDomParser from '../../../src/dom/globals/dom_parser';

describe('safeDomParser', () => {
  it('can parse XML', () => {
    const doc = safeDomParser.parseXml(new DOMParser(), '<mydoc />');
    expect(doc.documentElement.tagName).toEqual('mydoc');
  });

  it('rejects XML that contains root implicitly from the HTML namespace',
     () => {
       expect(() => {
         safeDomParser.parseXml(
             new DOMParser(), '<img xmlns="http://www.w3.org/1999/xhtml" />');
       }).toThrowError(/XML document that embeds HTML or SVG/);
     });

  it('rejects XML that contains root explicitly from the HTML namespace',
     () => {
       expect(() => {
         safeDomParser.parseXml(
             new DOMParser(),
             '<h:img xmlns:h="http://www.w3.org/1999/xhtml" />');
       }).toThrowError(/XML document that embeds HTML or SVG/);
     });

  it('rejects XML that contains nested element implicitly from the HTML namespace',
     () => {
       expect(() => {
         safeDomParser.parseXml(
             new DOMParser(),
             '<doc xmlns="http://www.w3.org/1999/xhtml"><img /></doc>');
       }).toThrowError(/XML document that embeds HTML or SVG/);
     });

  it('rejects XML that contains nested element explicitly from the HTML namespace',
     () => {
       expect(() => {
         safeDomParser.parseXml(
             new DOMParser(),
             '<doc xmlns:h="http://www.w3.org/1999/xhtml"><h:img /></doc>');
       }).toThrowError(/XML document that embeds HTML or SVG/);
     });

  it('rejects XML that contains nested HTML document', () => {
    expect(() => {
      safeDomParser.parseXml(
          new DOMParser(),
          '<doc><root xmlns="http://www.w3.org/1999/xhtml"><img /></root></doc>');
    }).toThrowError(/XML document that embeds HTML or SVG/);
  });

  it('rejects XML that contains nested HTML document with explicit namespace',
     () => {
       expect(() => {
         safeDomParser.parseXml(
             new DOMParser(),
             '<doc><root xmlns:h="http://www.w3.org/1999/xhtml"><h:img /></root></doc>');
       }).toThrowError(/XML document that embeds HTML or SVG/);
     });

  it('rejects XML that contains an element from encoded HTML namespace', () => {
    expect(() => {
      safeDomParser.parseXml(
          new DOMParser(), '<img xmlns="http://www.w3.org/1999&#47;xhtml" />');
    }).toThrowError(/XML document that embeds HTML or SVG/);
  });

  it('rejects XML that contains element from the SVG namespace', () => {
    expect(() => {
      safeDomParser.parseXml(
          new DOMParser(),
          '<doc><svg xmlns="http://www.w3.org/2000/svg" /></doc>');
    }).toThrowError(/XML document that embeds HTML or SVG/);
  });
});
