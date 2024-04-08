/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {SafeStyleSheet, unwrapStyleSheet} from '../../internals/style_sheet_impl';

/** Safe setters for `HTMLStyleElement`s. */
export function setTextContent(
    elem: HTMLStyleElement, safeStyleSheet: SafeStyleSheet) {
  elem.textContent = unwrapStyleSheet(safeStyleSheet);
}
