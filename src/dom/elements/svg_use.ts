/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {extractScheme} from '../../builders/url_builders.js';
import '../../environment/dev.js';

/**
 * Sets the Href attribute from the given URL.
 * javascript: and data: URL are blocked as they can lead to XSS and the <use>
 * element only loads resources same-origin.
 */
export function setSvgUseHref(useEl: SVGUseElement, url: string): void {
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
