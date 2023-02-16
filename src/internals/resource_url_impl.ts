/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';


/**
 * Runtime implementation of `TrustedScriptURL` in browsers that don't support
 * it.
 */
class ResourceUrlImpl {
  readonly privateDoNotAccessOrElseWrappedResourceUrl: string;

  constructor(url: string, token: object) {
    ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedResourceUrl = url;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedResourceUrl.toString();
  }
}

const GlobalTrustedScriptURL =
    (typeof window !== undefined) ? window.TrustedScriptURL : undefined;

/**
 * String that is safe to use in all URL contexts in DOM APIs and HTML
 * documents; even as a reference to resources that may load in the current
 * origin (e.g. scripts and stylesheets).
 */
export type TrustedResourceUrl = TrustedScriptURL;

/**
 * Also exports the constructor so that instanceof checks work.
 */
export const TrustedResourceUrl =
    (GlobalTrustedScriptURL ?? ResourceUrlImpl) as unknown as TrustedScriptURL;

/**
 * Builds a new `TrustedResourceUrl` from the given string, without
 * enforcing safety guarantees. It may cause side effects by creating a Trusted
 * Types policy. This shouldn't be exposed to application developers, and must
 * only be used as a step towards safe builders or safe constants.
 */
export function createResourceUrl(url: string): TrustedResourceUrl {
  /** @noinline */
  const noinlineUrl = url;
  const trustedScriptURL =
      getTrustedTypesPolicy()?.createScriptURL(noinlineUrl);
  return (trustedScriptURL ?? new ResourceUrlImpl(noinlineUrl, secretToken)) as
      TrustedResourceUrl;
}

/**
 * Checks if the given value is a `TrustedResourceUrl` instance.
 */
export function isResourceUrl(value: unknown): value is TrustedResourceUrl {
  return getTrustedTypes()?.isScriptURL(value) ||
      value instanceof ResourceUrlImpl;
}

/**
 * Returns the value of the passed `TrustedResourceUrl` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedScriptURL` or a string if Trusted Types are
 * disabled.
 */
export function unwrapResourceUrl(value: TrustedResourceUrl): TrustedScriptURL|
    string {
  if (getTrustedTypes()?.isScriptURL(value)) {
    return value;
  } else if (value instanceof ResourceUrlImpl) {
    return value.privateDoNotAccessOrElseWrappedResourceUrl;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedResourceUrl';
    }
    throw new Error(message);
  }
}
