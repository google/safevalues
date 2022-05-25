/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * Sets the Action attribute from the given SafeUrl.
 */
export function setAction(form: HTMLFormElement, url: SafeUrl) {
  form.action = unwrapUrl(url);
}
