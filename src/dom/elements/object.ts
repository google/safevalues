/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';

/** Sets the data attribute using a TrustedResourceUrl */
export function setObjectData(
  obj: HTMLObjectElement,
  v: TrustedResourceUrl,
): void {
  obj.data = unwrapResourceUrl(v) as string;
}
