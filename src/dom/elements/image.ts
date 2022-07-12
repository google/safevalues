/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {Url} from '../safeurl/index';

/**
 * Sets the Src attribute from the given Url.
 */
export function setSrc(img: HTMLImageElement, url: Url) {
  img.src = url;
}
