/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../safeurl/index';

/**
 * Sets the Formaction attribute from the given Url.
 */
export function setFormaction(input: HTMLInputElement, url: Url) {
  input.formAction = unwrapUrlOrSanitize(url);
}

/**
 * Sets the Src attribute from the given Url.
 */
export function setSrc(input: HTMLInputElement, url: Url) {
  input.src = unwrapUrlOrSanitize(url);
}
