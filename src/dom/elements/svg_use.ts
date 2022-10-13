/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev';

import {extractScheme} from '../../builders/url_sanitizer';

/**
 * Sets the Href attribute from the given TrustedResourceUrl.
 */
export function setHref(useEl: SVGUseElement, url: string) {
  const scheme = extractScheme(url);
  if (scheme === 'javascript:' || scheme === 'data:') {
    if (process.env.NODE_ENV !== 'production') {
      const msg = `A URL with content '${url}' was sanitized away.`;
      console.error(msg);
    }
    return;
  }

  // Note that the href property is read-only, so setAttribute must be used.
  useEl.setAttribute('href', url);
}
