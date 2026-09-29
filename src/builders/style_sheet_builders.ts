/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev.js';
import {assertIsTemplateObject} from '../internals/string_literal.js';
import {
  createStyleSheetInternal,
  SafeStyleSheet,
  unwrapStyleSheet,
} from '../internals/style_sheet_impl.js';

/**
 * Creates a SafeStyleSheet object from a template literal.
 *
 * This function is a template literal tag function. It should be called with
 * a template literal, with or without embedded `SafeStyleSheet` expressions.
 * For example,
 *                         safeStyleSheet`foo`;
 * The literal parts must not have any < characters in them. This is so that
 * SafeStyleSheet's contract is preserved, allowing the SafeStyleSheet to
 * correctly be interpreted as a sequence of CSS declarations and without
 * affecting the syntactic structure of any surrounding CSS and HTML.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param rest This represents the template's embedded `SafeStyleSheet`
 *     expressions.
 */
export function safeStyleSheet(
  templateObj: TemplateStringsArray,
  ...rest: readonly SafeStyleSheet[]
): SafeStyleSheet {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(templateObj, rest.length);
  }

  let styleSheet = '';
  for (let i = 0; i < templateObj.length; i++) {
    if (process.env.NODE_ENV !== 'production') {
      if (/</.test(templateObj[i])) {
        throw new Error(
          `'<' character is forbidden in styleSheet string: ${templateObj[i]}`,
        );
      }
    }
    styleSheet += templateObj[i];
    if (i < rest.length) {
      styleSheet += unwrapStyleSheet(rest[i]);
    }
  }

  return createStyleSheetInternal(styleSheet);
}

/**
 * Creates a `SafeStyleSheet` value by concatenating multiple
 * `SafeStyleSheet`s.
 */
export function concatStyleSheets(
  sheets: readonly SafeStyleSheet[],
): SafeStyleSheet {
  return createStyleSheetInternal(sheets.map(unwrapStyleSheet).join(''));
}
