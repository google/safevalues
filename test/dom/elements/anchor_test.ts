/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeAnchorEl from '../../../src/dom/elements/anchor';

describe('safeAnchor#setHref', () => {
  it('sets `href` attribute on `HTMLAnchorElement`s', () => {
    const url = 'https://google.com/example.html';
    const anchor = document.createElement('a');
    safeAnchorEl.setHref(anchor, url);
    expect(anchor.getAttribute('href')).toBe(url);
  });

  it('sets `href` attribute on `SVGAElement`s', () => {
    const url = 'https://google.com/example.html';
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    safeAnchorEl.setHref(anchor, url);
    expect(anchor.getAttribute('href')).toBe(url);
  });
});
