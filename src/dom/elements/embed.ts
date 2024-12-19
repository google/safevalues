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
 * Sets the Src attribute from the given SafeUrl.
 */
export function setEmbedSrc(
  embedEl: HTMLEmbedElement,
  url: TrustedResourceUrl,
): void {
  embedEl.src = unwrapResourceUrl(url) as string;
}
