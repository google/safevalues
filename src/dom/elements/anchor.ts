/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_sanitizer';

/**
 * Sets the Href attribute on an HTMLAnchorElement or SVGAElement from the given
 * Url.
 */
export function setHref(anchor: HTMLAnchorElement|SVGAElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    if (anchor instanceof HTMLAnchorElement) {
      anchor.href = sanitizedUrl;
    } else {
      anchor.href.baseVal = sanitizedUrl;
    }
  }
}
