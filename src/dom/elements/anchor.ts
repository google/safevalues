/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../internals/url_impl';

/**
 * Sets the Href attribute from the given SafeUrl.
 */
export function setHref(anchor: HTMLAnchorElement, url: SafeUrl) {
  anchor.href = unwrapUrl(url);
}
