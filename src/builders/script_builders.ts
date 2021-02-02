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

import {createScript, unwrapScriptAsString} from '../implementation/script_impl';
import {assertIsTemplateObject} from '../implementation/safe_string_literal';

/**
 * Creates a TrustedScript object from a template literal (without any embedded
 * expressions).
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           script`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 */
export function script(templateObj: TemplateStringsArray): TrustedScript {
  assertIsTemplateObject(
      templateObj, false,
      'script is a template literal tag function ' +
          'that only accepts template literals without expressions. ' +
          'For example, script`foo`;');
  return createScript(templateObj[0]);
}

/** Creates a `TrustedScript` value by concatenating multiple `TrustedScript`s. */
export function concatScripts(...scripts: TrustedScript[]): TrustedScript {
  return createScript(scripts.map(unwrapScriptAsString).join(''));
}
