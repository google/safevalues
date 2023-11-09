/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';
import {createHtmlInternal, unwrapHtml} from '../internals/html_impl';
import {assertIsTemplateObject} from '../internals/string_literal';

/**
 * Creates a DocumentFragment object from a template literal (without any
 * embedded expressions).
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           safeFragment`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 */
export function safeFragment(
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
