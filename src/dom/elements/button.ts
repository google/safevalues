/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../safeurl/index';

/**
 * Sets the Formaction attribute from the given Url.
 */
export function setFormaction(button: HTMLButtonElement, url: Url) {
  button.formAction = unwrapUrlOrSanitize(url);
}
