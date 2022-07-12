/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../internals/url_impl';
import {Url} from '../safeurl/index';

/**
 * Sets the Src attribute from the given Url.
 */
export function setSrc(img: HTMLImageElement, url: Url) {
  img.src = url instanceof SafeUrl ? unwrapUrl(url) : url;
}
