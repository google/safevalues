/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

// clang-format off
import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders';
// clang-format on

/**
 * Sets the Href attribute from the given Url.
 */
export function setHref(anchor: HTMLAnchorElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    anchor.href = sanitizedUrl;
  }
}
