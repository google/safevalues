/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../safeurl/index';

/**
 * open calls {@link Window.open} on the given {@link Window}, given a
 * target {@link Url}.
 */
export function open(
    win: Window, url: Url, target?: string, features?: string): Window|null {
  return win.open(unwrapUrlOrSanitize(url), target, features);
}
