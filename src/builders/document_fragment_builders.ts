/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';
import {createHtmlInternal, unwrapHtml} from '../internals/html_impl';
import {assertIsTemplateObject} from '../internals/string_literal';

/**
 * Creates a DocumentFragment object from a template literal (without any
 * embedded expressions) using the document context (HTML).
 *
 * Note: use svgFragment instead to create a DocumentFragment belonging to the
 * SVG namespace.
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           htmlFragment`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 */
export function htmlFragment(
  templateObj: TemplateStringsArray,
): DocumentFragment {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(templateObj, 0);
  }
  const range = document.createRange();
  return range.createContextualFragment(
    unwrapHtml(createHtmlInternal(templateObj[0])) as string,
  );
}

/**
 * Creates a DocumentFragment object from a template literal (without any
 * embedded expressions), with an SVG context.
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           svgFragment`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 */
export function svgFragment(
  templateObj: TemplateStringsArray,
): DocumentFragment {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(templateObj, 0);
  }
  const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const range = document.createRange();
  range.selectNodeContents(svgElem);
  return range.createContextualFragment(
    unwrapHtml(createHtmlInternal(templateObj[0])) as string,
  );
}
