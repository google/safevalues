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

/**
 * An object of type TemplateStringsArray represents the literal part(s) of a
 * template literal. This function checks if a TemplateStringsArray object is
 * actually from a template literal.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param errorMsg The custom error message in case any checks fail.
 */
export function assertIsTemplateObject(
    templateObj: TemplateStringsArray, errorMsg: string): void {
  if (!Array.isArray(templateObj) || !Array.isArray(templateObj.raw)) {
    throw new TypeError(errorMsg);
  }
  return;
}

/**
 * An object of type TemplateStringsArray represents the literal part(s) of a
 * template literal. This function checks if a TemplateStringsArray object is
 * actually from a template literal, and that its value is constant. Empty
 * interpolations are allowed to enable inline comments in the template literal.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param emptyArgs Arguments passed to the template, which should only consist
 *     of empty strings.
 * @param errorMsg The custom error message in case any checks fail.
 */
export function assertIsConstantTemplateObject(
    templateObj: TemplateStringsArray, emptyArgs: ReadonlyArray<''>,
    errorMsg: string): void {
  assertIsTemplateObject(templateObj, errorMsg);
  if (templateObj.length !== 1 && emptyArgs.some(arg => arg !== '')) {
    throw new TypeError(errorMsg);
  }
  return;
}
