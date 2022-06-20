/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../internals/url_impl';

/**
 * Sets the Src attribute from the given SafeUrl.
 */
export function setSrc(img: HTMLImageElement, url: SafeUrl) {
  img.src = unwrapUrl(url);
}
