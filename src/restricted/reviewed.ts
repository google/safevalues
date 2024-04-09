/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';
import {createHtmlInternal, SafeHtml} from '../internals/html_impl';
import {
  createResourceUrlInternal,
  TrustedResourceUrl,
} from '../internals/resource_url_impl';
import {createScriptInternal, SafeScript} from '../internals/script_impl';
import {
  createStyleSheetInternal,
  SafeStyleSheet,
} from '../internals/style_sheet_impl';

/**
 * Utilities to convert arbitrary strings to values of the various
 * Safe HTML types, subject to security review. These are also referred to as
 * "reviewed conversions".
 *
 * These functions are intended for use-cases that cannot be expressed using an
 * existing safe API (such as a type's builder) and instead require custom code
 * to produce values of a Safe HTML type. A security review is required to
 * verify that the custom code is indeed guaranteed to produce values that
 * satisfy the target type's security contract.
 *
 * Code using restricted conversions should be structured such that this
 * property is straightforward to establish. In particular, correctness should
 * only depend on the code immediately surrounding the reviewed conversion, and
 * not on assumptions about values received from outside the enclosing function
 * (or, at the most, the enclosing file).
 */

/**
 * Asserts that the provided justification is valid (non-empty). Throws an
 * exception if that is not the case.
 */
function assertValidJustification(justification: string) {
  if (typeof justification !== 'string' || justification.trim() === '') {
    let errMsg =
      'Calls to uncheckedconversion functions must go through security review.';
    errMsg +=
      ' A justification must be provided to capture what security' +
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
  html: string,
  options: {justification: string},
): SafeHtml {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(options.justification);
  }
  return createHtmlInternal(html);
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
  script: string,
  options: {justification: string},
): SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(options.justification);
  }
  return createScriptInternal(script);
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
  url: string,
  options: {justification: string},
): TrustedResourceUrl {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(options.justification);
  }
  return createResourceUrlInternal(url);
}

/**
 * Performs a "reviewed conversion" to SafeStyleSheet from a plain string that
 * is known to satisfy the SafeStyleSheet type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `stylesheet` satisfies the SafeStyleSheet type
 * contract in all possible program states. An appropriate `justification` must
 * be provided explaining why this particular use of the function is safe; this
 * may include a security review ticket number.
 */
export function styleSheetSafeByReview(
  stylesheet: string,
  options: {justification: string},
): SafeStyleSheet {
  if (process.env.NODE_ENV !== 'production') {
    assertValidJustification(options.justification);
  }
  return createStyleSheetInternal(stylesheet);
}
