/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';

/**
 * Sets the Href attribute from the given TrustedResourceUrl.
 */
export function setBaseHref(
  baseEl: HTMLBaseElement,
  url: TrustedResourceUrl,
): void {
  baseEl.href = unwrapResourceUrl(url) as string;
}
