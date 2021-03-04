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

import {ensureTokenIsValid} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';

const secretToken = {};

/** Implementation for `TrustedScript` */
class ScriptImpl  {
  readonly privateDoNotAccessOrElseWrappedScript: string;

  constructor(script: string, token: object) {
    ensureTokenIsValid(token, secretToken);
    this.privateDoNotAccessOrElseWrappedScript = script;
  }

  /** @override */
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
  return createScriptInternal(
      script, getTrustedTypesPolicy()?.createScript(script));
}

/**
 * An empty `TrustedScript` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_SCRIPT: TrustedScript = {
  valueOf() {
    return createScriptInternal('', getTrustedTypes()?.emptyScript);
  }
}.valueOf();

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
export function uwrapScriptForSink(value: TrustedScript): TrustedScript&string {
  if (getTrustedTypes()?.isScript(value)) {
    return value as TrustedScript & string;
  } else if (value instanceof ScriptImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedScript;
    return unwrapped as TrustedScript & string;
  } else {
    throw new Error('wrong type');
  }
}

/**
 * Same as `uwrapScriptForSink`, but returns an actual string
 *
 * Also ensures to return the right string value for `TrustedScript` objects if
 * the `toString function has been overwritten on the object.
 */
export function unwrapScriptAsString(value: TrustedScript): string {
  const unwrapped = uwrapScriptForSink(value);
  if (getTrustedTypes()?.isScript(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedScript`.
    return TrustedScript.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
