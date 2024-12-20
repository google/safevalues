/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * Sets the Action attribute from the given Url.
 */
export function setFormAction(form: HTMLFormElement, url: Url): void {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    form.action = sanitizedUrl;
  }
}
