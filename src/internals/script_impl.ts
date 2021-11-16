/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {pure} from './pure';
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';

/** Implementation for `TrustedScript` */
class ScriptImpl {
  readonly privateDoNotAccessOrElseWrappedScript: string;

  constructor(script: string, token: object) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedScript = script;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedScript.toString();
  }
}

function createScriptInternal(
    script: string, trusted?: TrustedScript): TrustedScript {
  return (trusted ?? new ScriptImpl(script, secretToken)) as TrustedScript;
}

/**
 * Builds a new `TrustedScript` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createScript(script: string): TrustedScript {
  /** @noinline */
  const noinlineScript = script;
  return createScriptInternal(
      noinlineScript, getTrustedTypesPolicy()?.createScript(noinlineScript));
}

/**
 * An empty `TrustedScript` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_SCRIPT: TrustedScript =
    pure(() => createScriptInternal('', getTrustedTypes()?.emptyScript));

/**
 * Returns the value of the passed `TrustedScript` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedScript` or a string if Trusted Types are disabled.
 *
 * The strange return type is to ensure the value can be used at sinks without a
 * cast despite the TypeScript DOM lib not supporting Trusted Types.
 * (https://github.com/microsoft/TypeScript/issues/30024)
 *
 * Note that while the return type is compatible with `string`, you shouldn't
 * use any string functions on the result as that will fail in browsers
 * supporting Trusted Types.
 */
export function unwrapScript(value: TrustedScript): TrustedScript&string {
  if (getTrustedTypes()?.isScript(value)) {
    return value as TrustedScript & string;
  }
  if (value instanceof ScriptImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedScript;
    return unwrapped as TrustedScript & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedScript';
    }
    throw new Error(message);
  }
}

/**
 * Same as `unwrapScript`, but returns an actual string
 *
 * Also ensures to return the right string value for `TrustedScript` objects if
 * the `toString function has been overwritten on the object.
 */
export function unwrapScriptAsString(value: TrustedScript): string {
  const unwrapped = unwrapScript(value);
  if (getTrustedTypes()?.isScript(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedScript`.
    return TrustedScript.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
