/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * setLocationHref safely sets {@link Location.href} on the given
 * {@link Location} with given {@link Url}.
 */
export function setLocationHref(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.href = sanitizedUrl;
  }
}

/**
 * locationReplace safely calls {@link Location.replace} on the given
 * {@link Location} with given {@link Url}.
 */
export function locationReplace(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.replace(sanitizedUrl);
  }
}

/**
 * locationAssign safely calls {@link Location.assign} on the given
 * {@link Location} with given {@link Url}.
 */
export function locationAssign(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.assign(sanitizedUrl);
  }
}
