/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {createHtml, SafeHtml} from '../internals/html_impl';
import {createResourceUrl, TrustedResourceUrl} from '../internals/resource_url_impl';
import {createScript, SafeScript} from '../internals/script_impl';


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
 * Performs a "reviewed conversion" to SafeHtml from a plain string that is
 * known to satisfy the SafeHtml type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `html` satisfies the SafeHtml type contract in all
 * possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function htmlSafeByReview(
    html: string, justification: string): SafeHtml {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createHtml(html);
}

/**
 * Performs a "reviewed conversion" to SafeScript from a plain string that
 * is known to satisfy the SafeScript type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `script` satisfies the SafeScript type contract in
 * all possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function scriptSafeByReview(
    script: string, justification: string): SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createScript(script);
}

/**
 * Performs a "reviewed conversion" to TrustedResourceUrl from a plain string
 * that is known to satisfy the SafeUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `url` satisfies the TrustedResourceUrl type
 * contract in all possible program states. An appropriate `justification` must
 * be provided explaining why this particular use of the function is safe.
 */
export function resourceUrlSafeByReview(
    url: string, justification: string): TrustedResourceUrl {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(justification);
  }
  return createResourceUrl(url);
}
