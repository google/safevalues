/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {setSvgUseHref} from '../../../src/dom/elements/svg_use';

describe('setSvgUseHref', () => {
  let element: SVGUseElement;

  beforeEach(() => {
    element = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    element.setAttribute('href', 'unchanged');
  });

  it('can set inline resource identifiers', () => {
    setSvgUseHref(element, '#MyElement');
    expect(element.href.baseVal).toEqual('#MyElement');
  });

  it('can set relative URLs', () => {
    setSvgUseHref(element, 'image.svg');
    expect(element.href.baseVal).toEqual('image.svg');
  });

  it('can set URLs with safe scheme', () => {
    setSvgUseHref(element, 'https://google.com/image.svg');
    expect(element.href.baseVal).toEqual('https://google.com/image.svg');
  });

  it('can not set URLs with data: scheme', () => {
    setSvgUseHref(element, 'data:image/svg+xml,<svg></svg>');
    expect(element.href.baseVal).toEqual('unchanged');
  });

  it('can not set URLs with javascript: scheme', () => {
    setSvgUseHref(element, 'javascript:alert(1)');
    expect(element.href.baseVal).toEqual('unchanged');
  });
});
