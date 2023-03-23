/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeSvgEl from '../../../src/dom/elements/svg';

describe('safeSvgEl', () => {
  let svgEl: SVGElement;
  beforeEach(() => {
    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  });

  it('sets `src` attribute as expected', () => {
    const url = 'https://google.com/content';
    safeSvgEl.setAttribute(svgEl, 'src', url);
    expect(svgEl.getAttribute('src')).toBe('https://google.com/content');
  });

  it('refuses to set `href` attribute', () => {
    const url = 'https://verymalicious.com/content#payload';
    const setHerf = () => {
      safeSvgEl.setAttribute(svgEl, 'href', url);
    };
    expect(setHerf).toThrow(
        new Error(`Setting the 'href' attribute on SVG can cause XSS.`));
  });
});
