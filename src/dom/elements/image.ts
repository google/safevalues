/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_sanitizer';

/**
 * Sets the Src attribute from the given Url.
 */
export function setSrc(img: HTMLImageElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    img.src = sanitizedUrl;
  }
}
