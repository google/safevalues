/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev.js';

const UNSAFE_SVG_ATTRIBUTES = ['href', 'xlink:href'];

/**
 * Set attribute on SVGElement if the attribute doesn't have security
 * implications. If the attribute can potentially cause XSS, throw an error.
 */
export function setSvgAttribute(
  svg: SVGElement,
  attr: string,
  value: string,
): void {
  const attrLower = attr.toLowerCase();
  if (
    UNSAFE_SVG_ATTRIBUTES.indexOf(attrLower) !== -1 ||
    attrLower.indexOf('on') === 0
  ) {
    let msg = '';
    if (process.env.NODE_ENV !== 'production') {
      msg = `Setting the '${attrLower}' attribute on SVG can cause XSS.`;
    }
    throw new Error(msg);
  }

  svg.setAttribute(attr, value);
}
