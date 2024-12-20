/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';

import {
  setLinkHrefAndRel,
  setLinkWithResourceUrlHrefAndRel,
} from '../../../src/dom/elements/link';

describe('setLinkHrefAndRel', () => {
  let linkElem: HTMLLinkElement;
  describe('with TS safe types', () => {
    beforeEach(() => {
      linkElem = document.createElement('link');
    });

    it('sets TrustedResourceUrl `href` and arbitraty `rel` attribute as expected ', () => {
      const url = trustedResourceUrl`https://google.com/test.css`;
      setLinkWithResourceUrlHrefAndRel(linkElem, url, 'stylesheet');
      expect(linkElem.href).toBe('https://google.com/test.css');
      expect(linkElem.rel).toBe('stylesheet');
    });

    it('expects TrustedResourceUrl `href` for unknown `rel` values', () => {
      const url = trustedResourceUrl`https://google.com/test.css`;
      setLinkHrefAndRel(linkElem, url, 'stylesheet');
      expect(linkElem.href).toBe('https://google.com/test.css');
      expect(linkElem.rel).toBe('stylesheet');
    });
  });

  describe('with string for SafeUrl sinks', () => {
    beforeEach(() => {
      linkElem = document.createElement('link');
    });

    it('sets `href` and `rel` attribute as expected', () => {
      const url = 'https://google.com/author.html';
      setLinkHrefAndRel(linkElem, url, 'author');
      expect(linkElem.href).toBe('https://google.com/author.html');
      expect(linkElem.rel).toBe('author');
    });
  });
});
