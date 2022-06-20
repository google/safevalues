/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../internals/url_impl';

/**
 * Sets the Formaction attribute from the given SafeUrl.
 */
export function setFormaction(input: HTMLInputElement, url: SafeUrl) {
  input.formAction = unwrapUrl(url);
}

/**
 * Sets the Src attribute from the given SafeUrl.
 */
export function setSrc(input: HTMLInputElement, url: SafeUrl) {
  input.src = unwrapUrl(url);
}
