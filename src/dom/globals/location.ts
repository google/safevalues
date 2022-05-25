/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * setHref safely sets {@link Location.href} on the given {@link Location} with
 * given {@link SafeUrl}.
 */
export function setHref(loc: Location, url: SafeUrl) {
  loc.href = unwrapUrl(url);
}

/**
 * replace safely calls {@link Location.replace} on the given {@link Location}
 * with given {@link SafeUrl}.
 */
export function replace(loc: Location, url: SafeUrl) {
  loc.replace(unwrapUrl(url));
}

/**
 * assign safely calls {@link Location.assign} on the given {@link Location}
 * with given {@link SafeUrl}.
 */
export function assign(loc: Location, url: SafeUrl) {
  loc.assign(unwrapUrl(url));
}
