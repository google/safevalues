/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_sanitizer';

/**
 * setHref safely sets {@link Location.href} on the given {@link Location} with
 * given {@link Url}.
 */
export function setHref(loc: Location, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.href = sanitizedUrl;
  }
}

/**
 * replace safely calls {@link Location.replace} on the given {@link Location}
 * with given {@link Url}.
 */
export function replace(loc: Location, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.replace(sanitizedUrl);
  }
}

/**
 * assign safely calls {@link Location.assign} on the given {@link Location}
 * with given {@link Url}.
 */
export function assign(loc: Location, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    loc.assign(sanitizedUrl);
  }
}
