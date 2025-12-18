/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Internal implementations of TrustedResourceUrl. */

import {getPolicy, UnwrapType} from './trusted_types.js';
import {TrustedScriptURL} from './trusted_types_typings.js';

import '../environment/dev.js';

import {ensureTokenIsValid, secretToken} from './secrets.js';

/**
 * String that is safe to use in all URL contexts in DOM APIs and HTML
 * documents; even as a reference to resources that may load in the current
 * origin (e.g. scripts and stylesheets).
 *
 * @final
 */
export class TrustedResourceUrl {
  private readonly privateDoNotAccessOrElseWrappedResourceUrl:
    | TrustedScriptURL
    | string;

  private constructor(token: object, value: TrustedScriptURL | string) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }

    this.privateDoNotAccessOrElseWrappedResourceUrl = value;
  }

  toString(): string {
    // String coercion minimizes code size.
    // tslint:disable-next-line:restrict-plus-operands
    return this.privateDoNotAccessOrElseWrappedResourceUrl + '';
  }
}

/**
 * Internal interface for `TrustedResourceUrl`.
 *
 * `TrustedResourceUrl` should remain an opaque type to users & they should never be able
 * to instantiate it directly, but we still need to create values.
 *
 * There are multiple ways to do this, but the following is the one that
 * minimizes code size.
 */
interface ResourceUrlImpl {
  privateDoNotAccessOrElseWrappedResourceUrl: TrustedScriptURL | string;
}
const ResourceUrlImpl = TrustedResourceUrl as {
  new (token: object, value: TrustedScriptURL | string): TrustedResourceUrl;
};

function constructResourceUrl(
  value: TrustedScriptURL | string,
): TrustedResourceUrl {
  return new ResourceUrlImpl(secretToken, value);
}

/**
 * Builds a new `TrustedResourceUrl` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createResourceUrlInternal(value: string): TrustedResourceUrl {
  // Inlining this variable can cause large codesize increases when it is a
  // large constant string. See sizetests/examples/constants for an example.
  /** @noinline */
  const noinlineValue = value;
  const policy = getPolicy();
  return constructResourceUrl(
    policy ? policy.createScriptURL(noinlineValue) : noinlineValue,
  );
}

/**
 * Checks if the given value is a `TrustedResourceUrl` instance
 *
 */
export function isResourceUrl(value: unknown): value is TrustedResourceUrl {
  return value instanceof TrustedResourceUrl;
}

/**
 * Returns the value of the passed `TrustedResourceUrl` object while ensuring it
 * has the correct type.
 * Using this function directly is not common. Safe types are not meant to be
 * unwrapped, but rather passed to other APIs that consume them, like the DOM
 * wrappers in safevalues/dom.
 *
 * Returns a native `TrustedScriptURL` instance typed as {toString(): string} or a string if Trusted Types are disabled.
 */
export function unwrapResourceUrl(
  value: TrustedResourceUrl,
): UnwrapType<TrustedScriptURL> | string {
  if (isResourceUrl(value)) {
    return (value as unknown as ResourceUrlImpl)
      .privateDoNotAccessOrElseWrappedResourceUrl;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedResourceUrl';
    }
    throw new Error(message);
  }
}
