/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders';

/**
 * Sets the Formaction attribute from the given Url.
 */
export function setFormaction(input: HTMLInputElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    input.formAction = sanitizedUrl;
  }
}
