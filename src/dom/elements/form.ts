/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders';

/**
 * Sets the Action attribute from the given Url.
 */
export function setAction(form: HTMLFormElement, url: Url) {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    form.action = sanitizedUrl;
  }
}
