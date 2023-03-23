/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev';

const UNSAFE_SVG_ATTRIBUTES = [
  'href',
  'xlink:href',
];

/**
 * Set attribute on SVGElement if the attribute doesn't have security
 * implications. If the attribute can potentially cause XSS, throw an error.
 */
export function setAttribute(svg: SVGElement, attr: string, value: string) {
  attr = attr.toLowerCase();
  if (UNSAFE_SVG_ATTRIBUTES.indexOf(attr) !== -1 || attr.startsWith('on')) {
    let msg = '';
    if (process.env.NODE_ENV !== 'production') {
      msg = `Setting the '${attr}' attribute on SVG can cause XSS.`;
    }
    throw new Error(msg);
  }

  svg.setAttribute(attr, value);
}