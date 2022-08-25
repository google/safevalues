/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_sanitizer';

/**
 * Sets the Formaction attribute from the given Url.
 */
export function setFormaction(input: HTMLInputElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    input.formAction = sanitizedUrl;
  }
}
