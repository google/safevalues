/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * Sets the Src attribute from the given SafeUrl.
 */
export function setSrc(img: HTMLImageElement, url: SafeUrl) {
  img.src = unwrapUrl(url);
}
