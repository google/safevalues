/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev.js';

/**
 * A secret token that must be passed to safe type constructors. It is only
 * accessible from within safevalues, ensuring that unrestricted safe type
 * creation is only possible within safevalues. In particular, this prevents
 * forgery such as `safeHtmlValue.constructor('javascript:evil')`.
 */
export const secretToken = {};

/**
 * Asserts that the given token matches the secret safevalues token. An
 * exception is thrown if that is not the case.
 */
export function ensureTokenIsValid(token: object): void {
  if (process.env.NODE_ENV !== 'production') {
    if (token !== secretToken) {
      throw new Error('Bad secret');
    }
  }
}
