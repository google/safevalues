/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {createScript, SafeScript, unwrapScriptAsString} from '../internals/script_impl';
import {assertIsTemplateObject} from '../internals/string_literal';

type Primitive = number|string|boolean|null;
type Serializable =
    Primitive|readonly Serializable[]|{readonly [key: string]: Serializable};

/**
 * Creates a SafeScript object from a template literal (without any embedded
 * expressions).
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           safeScript`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 */
export function safeScript(templateObj: any): SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(
        templateObj, false,
        'safeScript is a template literal tag function ' +
            'that only accepts template literals without expressions. ' +
            'For example, safeScript`foo`;');
  }
  return createScript(templateObj[0]);
}

/** Creates a `SafeScript` value by concatenating multiple `SafeScript`s. */
export function concatScripts(scripts: readonly SafeScript[]): SafeScript {
  return createScript(scripts.map(unwrapScriptAsString).join(''));
}

/**
 * Converts a serializable value into JSON that is safe to interpolate into a
 * script context. In particular it escapes < characters so that a value of
 * "</script>" doesn't break out of the context.
 * @param value The value to serialize.
 */
export function scriptFromJson(value: Serializable): SafeScript {
  return createScript(JSON.stringify(value).replace(/</g, '\\x3c'));
}

/**
 * Creates a `SafeScript` object from a template literal (without any embedded
 * expressions) along with additional arguments that the script should have
 * access to. These arguments will be JSON-encoded and passed to the script as
 * a function call.
 * @example
 * ```ts
 * safeScriptWithArgs`function (name, props) {
 *  console.log(name + ' is ' + props.age);
 * }`('Bob', { 'age': 42 })
 * ```
 * would return a `SafeScript` that represents the following code:
 * ```js
 * (function (name, props) {
 *  console.log(name + ' is ' + props.age);
 * })("Bob",{"age":42})
 * ```
 * @note Be careful when passing objects as arguments, as unquoted property
 * names may be changed during compilation.
 * @param templateObj This contains the literal part of the template literal.
 * @param emptyArgs Expressions that evaluate to the empty string to enable
 *     inline comments.
 */
export function safeScriptWithArgs(
    templateObj: any, ...emptyArgs: ReadonlyArray<''>):
    (...argValues: Serializable[]) => SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    if (emptyArgs.some(a => a !== '')) {
      throw new Error(
          'safeScriptWithArgs only allows empty string expressions ' +
          'to enable inline comments.');
    }
    assertIsTemplateObject(
        templateObj, true,
        'safeScriptWithArgs is a template literal tag function ' +
            'that only accepts template literals. ' +
            'For example, safeScriptWithArgs`foo`;');
  }
  return (...argValues: Serializable[]) => {
    const values = argValues.map((v) => scriptFromJson(v).toString());
    return createScript(`(${templateObj.join('')})(${values.join(',')})`);
  };
}
