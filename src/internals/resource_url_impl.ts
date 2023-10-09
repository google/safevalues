/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypesPolicy} from './trusted_types';


/**
 * String that is safe to use in all URL contexts in DOM APIs and HTML
 * documents; even as a reference to resources that may load in the current
 * origin (e.g. scripts and stylesheets).

 * See
 https://github.com/google/safevalues/blob/main/src/README.md#trustedresourceurl
 */
export abstract class TrustedResourceUrl {
  // tslint:disable-next-line:no-unused-variable
  // @ts-ignore
  private readonly brand!: never;  // To prevent structural typing.
}

/** Implementation for `TrustedResourceUrl` */
class ResourceUrlImpl extends TrustedResourceUrl {
  readonly privateDoNotAccessOrElseWrappedResourceUrl: TrustedScriptURL|string;

  constructor(url: TrustedScriptURL|string, token: object) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedResourceUrl = url;
  }

  override toString(): string {
    return this.privateDoNotAccessOrElseWrappedResourceUrl.toString();
  }
}

/**
 * Builds a new `TrustedResourceUrl` from the given string, without
 * enforcing safety guarantees. It may cause side effects by creating a Trusted
 * Types policy. This shouldn't be exposed to application developers, and must
 * only be used as a step towards safe builders or safe constants.
 */
export function createResourceUrlInternal(url: string): TrustedResourceUrl {
  /** @noinline */
  const noinlineUrl = url;
  const trustedScriptURL =
      getTrustedTypesPolicy()?.createScriptURL(noinlineUrl);
  return new ResourceUrlImpl(trustedScriptURL ?? noinlineUrl, secretToken);
}

/**
 * Checks if the given value is a `TrustedResourceUrl` instance.
 */
export function isResourceUrl(value: unknown): value is TrustedResourceUrl {
  return value instanceof ResourceUrlImpl;
}

/**
 * Returns the value of the passed `TrustedResourceUrl` object while ensuring it
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
export function unwrapResourceUrl(value: TrustedResourceUrl): TrustedScriptURL&
    string {
  if (value instanceof ResourceUrlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedResourceUrl;
    return unwrapped as TrustedScriptURL & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedResourceUrl';
    }
    throw new Error(message);
  }
}
