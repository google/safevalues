/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {Url} from '../../builders/url_sanitizer';

/**
 * Sets the Src attribute from the given Url.
 */
export function setSrc(img: HTMLImageElement, url: Url) {
  img.src = url;
}
