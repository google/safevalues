/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../internals/url_impl';

/**
 * Sets the Href attribute from the given SafeUrl.
 */
export function setHref(area: HTMLAreaElement, url: SafeUrl) {
  area.href = unwrapUrl(url);
}
