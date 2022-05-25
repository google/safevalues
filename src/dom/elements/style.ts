/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeStyleSheet, unwrapStyleSheet} from '../../index';

/** Safe setters for `HTMLStyleElement`s. */
export function setTextContent(
    elem: HTMLStyleElement, safeStyleSheet: SafeStyleSheet) {
  elem.textContent = unwrapStyleSheet(safeStyleSheet);
}
