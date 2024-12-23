/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * Sets the Href attribute from the given Url.
 */
export function setAnchorHref(anchor: HTMLAnchorElement, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    anchor.href = sanitizedUrl;
  }
}
