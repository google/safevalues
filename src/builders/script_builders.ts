/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev.js';
import {
  createScriptInternal,
  SafeScript,
  unwrapScript,
} from '../internals/script_impl.js';
import {assertIsTemplateObject} from '../internals/string_literal.js';

type Primitive = number | string | boolean;
type Serializable =
  | Primitive
  | ReadonlyArray<Serializable | null>
  | {readonly [key: string]: Serializable | null};

/**
 * Creates a SafeScript object from a template literal (without any embedded
 * expressions).
 *
 * This function is a template literal tag function. It should be called with
 * a template literal that does not contain any expressions. For example,
 *                           safeScript`foo`;
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param emptyArgs Expressions that evaluate to the empty string to enable
 *     inline comments.
 */
export function safeScript(
  templateObj: TemplateStringsArray,
  ...emptyArgs: ReadonlyArray<''>
): SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    if (emptyArgs.some((a) => a !== '')) {
      throw new Error(
        'safeScript only allows empty string expressions ' +
          'to enable inline comments.',
      );
    }
    assertIsTemplateObject(templateObj, emptyArgs.length);
  }
  return createScriptInternal(templateObj.join(''));
}

/** Creates a `SafeScript` value by concatenating multiple `SafeScript`s. */
export function concatScripts(scripts: readonly SafeScript[]): SafeScript {
  return createScriptInternal(scripts.map(unwrapScript).join(''));
}

/**
 * Converts a serializable value into JSON that is safe to interpolate into a
 * script context. In particular it escapes < characters so that a value of
 * "&lt/script>" doesn't break out of the context.
 * @param value The value to serialize.
 */
export function valueAsScript(value: Serializable | null): SafeScript {
  return createScriptInternal(JSON.stringify(value).replace(/</g, '\\u003C'));
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
  templateObj: TemplateStringsArray,
  ...emptyArgs: ReadonlyArray<''>
): (...argValues: ReadonlyArray<Serializable | null>) => SafeScript {
  if (process.env.NODE_ENV !== 'production') {
    if (emptyArgs.some((a) => a !== '')) {
      throw new Error(
        'safeScriptWithArgs only allows empty string expressions ' +
          'to enable inline comments.',
      );
    }
    assertIsTemplateObject(templateObj, emptyArgs.length);
  }
  return (...argValues: ReadonlyArray<Serializable | null>) => {
    const values = argValues.map((v) => valueAsScript(v).toString());
    return createScriptInternal(
      `(${templateObj.join('')})(${values.join(',')})`,
    );
  };
}
