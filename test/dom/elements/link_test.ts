/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeLinkEl from '../../../src/dom/elements/link';
import {safeUrl, trustedResourceUrl} from '../../../src/index';

describe('safeLink#setHrefAndRel', () => {
  let linkElem: HTMLLinkElement;
  describe('with TS safe types', () => {
    beforeEach(() => {
      linkElem = document.createElement('link');
    });

    it('sets `href` and `rel` attribute as expected', () => {
      const url = safeUrl`https://google.com/author.html`;
      safeLinkEl.setHrefAndRel(linkElem, url, 'author');
      expect(linkElem.href).toBe('https://google.com/author.html');
      expect(linkElem.rel).toBe('author');
    });

    it('expects TrustedResourceUrl `href` for unknown `rel` values', () => {
      const url = trustedResourceUrl`https://google.com/test.css`;
      safeLinkEl.setHrefAndRel(linkElem, url, 'stylesheet');
      expect(linkElem.href).toBe('https://google.com/test.css');
      expect(linkElem.rel).toBe('stylesheet');
    });
  });
});
