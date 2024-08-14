/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SafeStyleSheet,
  unwrapStyleSheet,
} from '../../internals/style_sheet_impl.js';

/** Safe setters for `HTMLStyleElement`s. */
export function setTextContent(
  elem: HTMLStyleElement,
  safeStyleSheet: SafeStyleSheet,
) {
  elem.textContent = unwrapStyleSheet(safeStyleSheet);
}
