/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * Sets the Href attribute from the given SafeUrl.
 */
export function setHref(area: HTMLAreaElement, url: SafeUrl) {
  area.href = unwrapUrl(url);
}
