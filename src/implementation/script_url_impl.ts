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

/** Implementation for `TrustedScriptURL` */
class ScriptUrlImpl  {
  readonly privateDoNotAccessOrElseWrappedResourceUrl: string;

  constructor(url: string, token: object) {
    ensureTokenIsValid(token, secretToken);
    this.privateDoNotAccessOrElseWrappedResourceUrl = url;
  }

  /** @override */
  toString(): string {
    return this.privateDoNotAccessOrElseWrappedResourceUrl.toString();
  }
}

/**
 * Builds a new `TrustedScriptURL` from the given string, without
 * enforcing safety guarantees. It may cause side effects by creating a Trusted
 * Types policy. This shouldn't be exposed to application developers, and must
 * only be used as a step towards safe builders or safe constants.
 */
export function createScriptUrl(url: string): TrustedScriptURL {
  const trustedScriptURL = getTrustedTypesPolicy()?.createScriptURL(url);
  return (trustedScriptURL ??
  new ScriptUrlImpl(url, secretToken)) as TrustedScriptURL;
}

/**
 * Returns the value of the passed `TrustedScriptURL` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedScriptURL` or a string if Trusted Types are
 * disabled.
 *
 * The strange return type is to ensure the value can be used at sinks without a
 * cast despite the TypeScript DOM lib not supporting Trusted Types.
 * (https://github.com/microsoft/TypeScript/issues/30024)
 *
 * Note that while the return type is compatible with `string`, you shouldn't
 * use any string functions on the result as that will fail in browsers
 * supporting Trusted Types.
 */
export function uwrapScriptUrlForSink(value: TrustedScriptURL):
    TrustedScriptURL&string {
  if (getTrustedTypes()?.isScriptURL(value)) {
    return value as TrustedScriptURL & string;
  } else if (value instanceof ScriptUrlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedResourceUrl;
    return unwrapped as TrustedScriptURL & string;
  } else {
    throw new Error('wrong type');
  }
}

/**
 * Same as `uwrapScriptUrlForSink`, but returns an actual string
 *
 * Also ensures to return the right string value for `TrustedScriptURL` objects
 * if the `toString function has been overwritten on the object.
 */
export function unwrapScriptUrlAsString(value: TrustedScriptURL):
    string {
  const unwrapped = uwrapScriptUrlForSink(value);
  if (getTrustedTypes()?.isScriptURL(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedScriptURL`.
    return TrustedScriptURL.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
