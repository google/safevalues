/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * Sets the Formaction attribute from the given Url.
 */
export function setButtonFormaction(button: HTMLButtonElement, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    button.formAction = sanitizedUrl;
  }
}
