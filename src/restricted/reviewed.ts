/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {createHtml} from '../internals/html_impl';
import {createResourceUrl} from '../internals/resource_url_impl';
import {createScript} from '../internals/script_impl';


/**
 * Asserts that the provided justification is valid (non-empty). Throws an
 * exception if that is not the case.
 */
function assertValidJustification(justification: string) {
  if (typeof justification !== 'string' || justification.trim() === '') {
    let errMsg =
        'Calls to uncheckedconversion functions must go through security review.';
    errMsg += ' A justification must be provided to capture what security' +
        ' assumptions are being made.';
    throw new Error(errMsg);
  }
}

/**
 * Performs a "reviewed conversion" to TrustedHTML from a plain string that is
 * known to satisfy the TrustedHTML type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `html` satisfies the TrustedHTML type contract in all
 * possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function htmlSafeByReview(
    html: string, justification: string): TrustedHTML {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createHtml(html);
}

/**
 * Performs a "reviewed conversion" to TrustedScript from a plain string that
 * is known to satisfy the TrustedScript type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `script` satisfies the TrustedScript type contract in
 * all possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function scriptSafeByReview(
    script: string, justification: string): TrustedScript {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createScript(script);
}

/**
 * Performs a "reviewed conversion" to TrustedScriptURL from a plain string
 * that is known to satisfy the SafeUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `url` satisfies the TrustedScriptURL type
 * contract in all possible program states. An appropriate `justification` must
 * be provided explaining why this particular use of the function is safe.
 */
export function resourceUrlSafeByReview(
    url: string, justification: string): TrustedScriptURL {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createResourceUrl(url);
}
