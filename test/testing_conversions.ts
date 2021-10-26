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

import {createHtml} from '../src/internals/html_impl';
import {createResourceUrl} from '../src/internals/resource_url_impl';
import {createScript} from '../src/internals/script_impl';

/**
 * Turns a string into TrustedHTML for testing purposes. This function is for
 * use in tests only and must never be used in production code.
 */
export function testingConversionToHtml(s: string): TrustedHTML {
  return createHtml(s);
}

/**
 * Turns a string into TrustedScript for testing API purposes. This function is
 * for use in tests only and must never be used in production code.
 */
export function testingConversionToScript(s: string): TrustedScript {
  return createScript(s);
}

/**
 * Turns a string into TrustedScriptURL for testing purposes. This function is
 * for use in tests only and must never be used in production code.
 */
export function testingConversionToScriptUrl(s: string): TrustedScriptURL {
  return createResourceUrl(s);
}
