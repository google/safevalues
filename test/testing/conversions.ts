/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A set of conversions to safe types, to be used for testing
 * purposes. These utility methods perform no validation, and the
 * resulting instances may violate type contracts.
 *
 * These methods are useful when types are constructed in a manner where using
 * the production API is too inconvenient. Please do use the production API
 * whenever possible; there is value in having tests reflect common usage and it
 * avoids, by design, non-contract complying instances from being created.
 */

import {createHtmlInternal, SafeHtml} from '../../src/internals/html_impl';
import {
  createResourceUrlInternal,
  TrustedResourceUrl,
} from '../../src/internals/resource_url_impl';
import {
  createScriptInternal,
  SafeScript,
} from '../../src/internals/script_impl';
import {
  createStyleSheetInternal,
  SafeStyleSheet,
} from '../../src/internals/style_sheet_impl';

/**
 * Turns a string into SafeHtml for testing purposes. This function is for use
 * in tests only and must never be used in production code.
 */
export function testonlyHtml(s: string): SafeHtml {
  return createHtmlInternal(s);
}

/**
 * Turns a string into SafeScript for testing API purposes. This function is for
 * use in tests only and must never be used in production code.
 */
export function testonlyScript(s: string): SafeScript {
  return createScriptInternal(s);
}

/**
 * Turns a string into TrustedResourceUrl for testing purposes. This function is
 * for use in tests only and must never be used in production code.
 */
export function testonlyResourceUrl(s: string): TrustedResourceUrl {
  return createResourceUrlInternal(s);
}

/**
 * Turns a string into SafeStyleSheet for testing API purposes. This function is
 * for use in tests only and must never be used in production code.
 */
export function testonlyStyleSheet(s: string): SafeStyleSheet {
  return createStyleSheetInternal(s);
}
