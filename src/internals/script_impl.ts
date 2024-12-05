/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Internal implementations of SafeScript. */

import {getPolicy, trustedTypes, UnwrapType} from './trusted_types.js';
import {TrustedScript} from './trusted_types_typings.js';

import '../environment/dev.js';

import {pure} from './pure.js';
import {ensureTokenIsValid, secretToken} from './secrets.js';

/**
 * JavaScript code that is safe to evaluate and use as the content of an HTML
 * script element.
 *
 * @final
 */
export class SafeScript {
  private readonly privateDoNotAccessOrElseWrappedScript:
    | TrustedScript
    | string;

  private constructor(token: object, value: TrustedScript | string) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }

    this.privateDoNotAccessOrElseWrappedScript = value;
  }

  toString(): string {
    // String coercion minimizes code size.
    // tslint:disable-next-line:restrict-plus-operands
    return this.privateDoNotAccessOrElseWrappedScript + '';
  }
}

/**
 * Internal interface for `SafeScript`.
 *
 * `SafeScript` should remain an opaque type to users & they should never be able
 * to instantiate it directly, but we still need to create values.
 *
 * There are multiple ways to do this, but the following is the one that
 * minimizes code size.
 */
interface ScriptImpl {
  privateDoNotAccessOrElseWrappedScript: TrustedScript | string;
}
const ScriptImpl = SafeScript as {
  new (token: object, value: TrustedScript | string): SafeScript;
};

function constructScript(value: TrustedScript | string): SafeScript {
  return new ScriptImpl(secretToken, value);
}

/**
 * Builds a new `SafeScript` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createScriptInternal(value: string): SafeScript {
  // Inlining this variable can cause large codesize increases when it is a
  // large constant string. See sizetests/examples/constants for an example.
  /** @noinline */
  const noinlineValue = value;
  const policy = getPolicy();
  return constructScript(
    policy ? policy.createScript(noinlineValue) : noinlineValue,
  );
}

/**
 * An empty `SafeScript` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_SCRIPT: SafeScript = /* #__PURE__ */ pure(() =>
  constructScript(trustedTypes ? trustedTypes.emptyScript : ''),
);

/** Checks if the given value is a `SafeScript` instance */
export function isScript(value: unknown): value is SafeScript {
  return value instanceof SafeScript;
}

/**
 * Returns the value of the passed `SafeScript` object while ensuring it
 * has the correct type.
 * Using this function directly is not common. Safe types are not meant to be
 * unwrapped, but rather passed to other APIs that consume them, like the DOM
 * wrappers in safevalues/dom.
 *
 * Returns a native `TrustedScript` instance typed as {toString(): string} or a string if Trusted Types are disabled.
 */
export function unwrapScript(
  value: SafeScript,
): UnwrapType<TrustedScript> | string {
  if (isScript(value)) {
    return (value as unknown as ScriptImpl)
      .privateDoNotAccessOrElseWrappedScript;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeScript';
    }
    throw new Error(message);
  }
}
