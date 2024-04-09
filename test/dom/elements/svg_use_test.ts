/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as svgUseEl from '../../../src/dom/elements/svg_use';

describe('svgUseEl', () => {
  let element: SVGUseElement;

  beforeEach(() => {
    element = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    element.setAttribute('href', 'unchanged');
  });

  describe('setHref', () => {
    it('can set inline resource identifiers', () => {
      svgUseEl.setHref(element, '#MyElement');
      expect(element.href.baseVal).toEqual('#MyElement');
    });

    it('can set relative URLs', () => {
      svgUseEl.setHref(element, 'image.svg');
      expect(element.href.baseVal).toEqual('image.svg');
    });

    it('can set URLs with safe scheme', () => {
      svgUseEl.setHref(element, 'https://google.com/image.svg');
      expect(element.href.baseVal).toEqual('https://google.com/image.svg');
    });

    it('can not set URLs with data: scheme', () => {
      svgUseEl.setHref(element, 'data:image/svg+xml,<svg></svg>');
      expect(element.href.baseVal).toEqual('unchanged');
    });

    it('can not set URLs with javascript: scheme', () => {
      svgUseEl.setHref(element, 'javascript:alert(1)');
      expect(element.href.baseVal).toEqual('unchanged');
    });
  });
});
