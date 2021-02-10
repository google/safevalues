/*
 * @license
 * Copyright 2020 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createHtml} from '../implementation/html_impl';
import {createScript} from '../implementation/script_impl';
import {createScriptUrl} from '../implementation/script_url_impl';


/**
 * Defines whether we use/check the justification or not, setting it to false
 * allows the optimizer to strip all the justifications.
 */
let isDebug: boolean = false;

/**
 * Asserts that the provided justification is valid (non-empty). Throws an
 * exception if that is not the case.
 */
function assertValidJustification(justification: string) {
  // The following assertion as well as all justification strings will be
  // stripped out of production JS binaries
  if (isDebug &&
      (typeof justification !== 'string' || justification.trim() === '')) {
    let errMsg =
        'Calls to uncheckedconversion functions must go through security review.';
    errMsg += ' A justification must be provided to capture what security' +
        ' assumptions are being made.';
    throw new Error(errMsg);
  }
}

/**
 * Performs an "unchecked conversion" to TrustedHTML from a plain string that is
 * known to satisfy the TrustedHTML type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `html` satisfies the TrustedHTML type contract in all
 * possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function htmlFromStringKnownToSatisfyTypeContract(
    html: string, justification: string): TrustedHTML {
  assertValidJustification(justification);
  return createHtml(html);
}

/**
 * Performs an "unchecked conversion" to TrustedScript from a plain string that
 * is known to satisfy the TrustedScript type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `script` satisfies the TrustedScript type contract in
 * all possible program states. An appropriate `justification` must be provided
 * explaining why this particular use of the function is safe.
 */
export function scriptFromStringKnownToSatisfyTypeContract(
    script: string, justification: string): TrustedScript {
  assertValidJustification(justification);
  return createScript(script);
}

/**
 * Performs an "unchecked conversion" to TrustedScriptURL from a plain string
 * that is known to satisfy the SafeUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of `url` satisfies the TrustedScriptURL type
 * contract in all possible program states. An appropriate `justification` must
 * be provided explaining why this particular use of the function is safe.
 */
export function scriptUrlFromStringKnownToSatisfyTypeContract(
    url: string, justification: string): TrustedScriptURL {
  assertValidJustification(justification);
  return createScriptUrl(url);
}


export const TEST_ONLY = {
  setDebug(value: boolean) {
    isDebug = value;
  }
};
