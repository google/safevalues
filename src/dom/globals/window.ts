/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_sanitizer';

/**
 * open calls {@link Window.open} on the given {@link Window}, given a
 * target {@link Url}.
 */
export function open(
    win: Window, url: Url, target?: string, features?: string): Window|null {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    return win.open(sanitizedUrl, target, features);
  }
  return null;
}
