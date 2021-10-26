/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';

/** Implementation for `TrustedScriptURL` */
class ResourceUrlImpl {
  readonly privateDoNotAccessOrElseWrappedResourceUrl: string;

  constructor(url: string, token: object) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedResourceUrl = url;
  }

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
export function createResourceUrl(url: string): TrustedScriptURL {
  /** @noinline */
  const noinlineUrl = url;
  const trustedScriptURL =
      getTrustedTypesPolicy()?.createScriptURL(noinlineUrl);
  return (trustedScriptURL ?? new ResourceUrlImpl(noinlineUrl, secretToken)) as
      TrustedScriptURL;
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
export function unwrapResourceUrl(value: TrustedScriptURL): TrustedScriptURL&
    string {
  if (getTrustedTypes()?.isScriptURL(value)) {
    return value as TrustedScriptURL & string;
  }
  if (value instanceof ResourceUrlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedResourceUrl;
    return unwrapped as TrustedScriptURL & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedScriptURL';
    }
    throw new Error(message);
  }
}

/**
 * Same as `unwrapResourceUrl`, but returns an actual string
 *
 * Also ensures to return the right string value for `TrustedScriptURL` objects
 * if the `toString` function has been overwritten on the object.
 */
export function unwrapResourceUrlAsString(value: TrustedScriptURL): string {
  const unwrapped = unwrapResourceUrl(value);
  if (getTrustedTypes()?.isScriptURL(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedScriptURL`.
    return TrustedScriptURL.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
