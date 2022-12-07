/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';

/**
 * Sets the Href attribute from the given TrustedResourceUrl.
 */
export function setHref(baseEl: HTMLBaseElement, url: TrustedResourceUrl) {
  baseEl.href = unwrapResourceUrl(url) as string;
}
