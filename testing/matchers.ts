/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A set of ArgumentMatchers to test for safe types. These
 * matchers unwrap the safe type to compare the wrapped string value with an
 * expected value. They implicitely check that the correct implementation of
 * safe type was used.
 */

import {ArgumentMatcher} from 'google3/third_party/javascript/closure/testing/mockmatchers';
import * as compat from 'safevalues/compat';

/**
 * Returns an ArgumentMatcher that compares a TrustedScriptURL against an
 * expected string url value. This is generally what people want to test when
 * they pass TrustedScriptURLs around.
 */
export function resourceUrlMatcher(expectedUrl: string|
                                   compat.TrustedScriptURL): ArgumentMatcher {
  const urlContent = compat.isScriptUrl(expectedUrl) ?
      compat.unwrapScriptUrl(expectedUrl) :
      expectedUrl;
  return new ArgumentMatcher(
      (url: compat.TrustedScriptURL) =>
          compat.unwrapScriptUrl(url) === urlContent);
}
