/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * open calls {@link Window.open} on the given {@link Window}, given a
 * target {@link SafeUrl}.
 */
export function open(
    win: Window, url: SafeUrl, target?: string, features?: string): Window|
    null {
  return win.open(unwrapUrl(url), target, features);
}
