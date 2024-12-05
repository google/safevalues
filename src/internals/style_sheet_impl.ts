/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Internal implementations of SafeStyleSheet. */

import '../environment/dev.js';

import {ensureTokenIsValid, secretToken} from './secrets.js';

/**
 * A complete CSS style sheet, safe to use in style contexts in an HTML
 * document or DOM APIs.
 *
 * @final
 */
export class SafeStyleSheet {
  private readonly privateDoNotAccessOrElseWrappedStyleSheet: string;

  private constructor(token: object, value: string) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }

    this.privateDoNotAccessOrElseWrappedStyleSheet = value;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedStyleSheet;
  }
}

/**
 * Internal interface for `SafeStyleSheet`.
 *
 * `SafeStyleSheet` should remain an opaque type to users & they should never be able
 * to instantiate it directly, but we still need to create values.
 *
 * There are multiple ways to do this, but the following is the one that
 * minimizes code size.
 */
interface StyleSheetImpl {
  privateDoNotAccessOrElseWrappedStyleSheet: string;
}
const StyleSheetImpl = SafeStyleSheet as {
  new (token: object, value: string): SafeStyleSheet;
};

/**
 * Builds a new `SafeStyleSheet` from the given string, without enforcing
 * safety guarantees. This shouldn't be exposed to application developers, and
 * must only be used as a step towards safe builders or safe constants.
 */
export function createStyleSheetInternal(value: string): SafeStyleSheet {
  return new StyleSheetImpl(secretToken, value);
}

/**
 * Checks if the given value is a `SafeStyleSheet` instance.
 */
export function isStyleSheet(value: unknown): value is SafeStyleSheet {
  return value instanceof SafeStyleSheet;
}

/**
 * Returns the string value of the passed `SafeStyleSheet` object while ensuring it
 * has the correct type.
 */
export function unwrapStyleSheet(value: SafeStyleSheet): string {
  if (isStyleSheet(value)) {
    return (value as unknown as StyleSheetImpl)
      .privateDoNotAccessOrElseWrappedStyleSheet;
  }
  let message = '';
  if (process.env.NODE_ENV !== 'production') {
    message = `Unexpected type when unwrapping SafeStyleSheet, got '${value}' of type '${typeof value}'`;
  }
  throw new Error(message);
}
