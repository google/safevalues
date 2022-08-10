/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';

/** Sets the data attribute using a TrustedResourceUrl */
export function setData(obj: HTMLObjectElement, v: TrustedResourceUrl) {
  obj.data = unwrapResourceUrl(v) as string;
}
