/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Internal implementations of SafeHtml. */

import {getPolicy, trustedTypes, UnwrapType} from './trusted_types.js';
import {TrustedHTML} from './trusted_types_typings.js';

import '../environment/dev.js';

import {pure} from './pure.js';
import {ensureTokenIsValid, secretToken} from './secrets.js';

/**
 * String that is safe to use in HTML contexts in DOM APIs and HTML documents.
 *
 * @final
 */
export class SafeHtml {
  private readonly privateDoNotAccessOrElseWrappedHtml: TrustedHTML | string;

  private constructor(token: object, value: TrustedHTML | string) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }

    this.privateDoNotAccessOrElseWrappedHtml = value;
  }

  toString(): string {
    // String coercion minimizes code size.
    // tslint:disable-next-line:restrict-plus-operands
    return this.privateDoNotAccessOrElseWrappedHtml + '';
  }
}

/**
 * Internal interface for `SafeHtml`.
 *
 * `SafeHtml` should remain an opaque type to users & they should never be able
 * to instantiate it directly, but we still need to create values.
 *
 * There are multiple ways to do this, but the following is the one that
 * minimizes code size.
 */
interface HtmlImpl {
  privateDoNotAccessOrElseWrappedHtml: TrustedHTML | string;
}
const HtmlImpl = SafeHtml as {
  new (token: object, value: TrustedHTML | string): SafeHtml;
};

function constructHtml(value: TrustedHTML | string): SafeHtml {
  return new HtmlImpl(secretToken, value);
}

/**
 * Builds a new `SafeHtml` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createHtmlInternal(value: string): SafeHtml {
  // Inlining this variable can cause large codesize increases when it is a
  // large constant string. See sizetests/examples/constants for an example.
  /** @noinline */
  const noinlineValue = value;
  const policy = getPolicy();
  return constructHtml(
    policy ? policy.createHTML(noinlineValue) : noinlineValue,
  );
}

/**
 * An empty `SafeHtml` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_HTML: SafeHtml = /* #__PURE__ */ pure(() =>
  constructHtml(trustedTypes ? trustedTypes.emptyHTML : ''),
);

/** Checks if the given value is a `SafeHtml` instance */
export function isHtml(value: unknown): value is SafeHtml {
  return value instanceof SafeHtml;
}

/**
 * Returns the value of the passed `SafeHtml` object while ensuring it
 * has the correct type.
 * Using this function directly is not common. Safe types are not meant to be
 * unwrapped, but rather passed to other APIs that consume them, like the DOM
 * wrappers in safevalues/dom.
 *
 * Returns a native `TrustedHTML` instance typed as {toString(): string} or a string if Trusted Types are disabled.
 */
export function unwrapHtml(value: SafeHtml): UnwrapType<TrustedHTML> | string {
  if (isHtml(value)) {
    return (value as unknown as HtmlImpl).privateDoNotAccessOrElseWrappedHtml;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeHtml';
    }
    throw new Error(message);
  }
}
