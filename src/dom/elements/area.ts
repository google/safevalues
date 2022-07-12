/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../safeurl/index';

/**
 * Sets the Href attribute from the given Url.
 */
export function setHref(area: HTMLAreaElement, url: Url) {
  area.href = unwrapUrlOrSanitize(url);
}
