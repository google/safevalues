/*
 * @license
 * Copyright 2021 Google LLC

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

import {createHtml} from '../src/implementation/html_impl';
import {createScript} from '../src/implementation/script_impl';
import {createScriptUrl} from '../src/implementation/script_url_impl';

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
  return createScriptUrl(s);
}
