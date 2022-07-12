/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../safeurl/index';

/**
 * Sets the Action attribute from the given Url.
 */
export function setAction(form: HTMLFormElement, url: Url) {
  form.action = unwrapUrlOrSanitize(url);
}
