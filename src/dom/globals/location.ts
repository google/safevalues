/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * setHref safely sets {@link Location.href} on the given {@link Location} with
 * given {@link Url}.
 */
export function setHref(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    mockableLocation.setHref(loc, sanitizedUrl);
  }
}

/**
 * replace safely calls {@link Location.replace} on the given {@link Location}
 * with given {@link Url}.
 */
export function replace(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    mockableLocation.replace(loc, sanitizedUrl);
  }
}

/**
 * assign safely calls {@link Location.assign} on the given {@link Location}
 * with given {@link Url}.
 */
export function assign(loc: Location, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    mockableLocation.assign(loc, sanitizedUrl);
  }
}

/**
 * Set of wrappers around the location object for tests to observe and mock it.
 * Window.location is a read-only property. Users used to mock it with our
 * former exports like safeLocation. This is not possible anymore now that
 * functions are directly exported on the module.
 * Ideally, we wouldn't provide this. It just happens that the safe wrappers are
 * a handy plug-in point for mocks...
 */
const mockableLocation = {
  setHref(loc: Location, url: string) {
    loc.href = url;
  },
  replace(loc: Location, url: string) {
    loc.replace(url);
  },
  assign(loc: Location, url: string) {
    loc.assign(url);
  },
};
