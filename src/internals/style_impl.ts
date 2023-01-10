/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {ensureTokenIsValid, secretToken} from './secrets';

/**
 * Sequence of CSS declarations safe to use in style contexts in an HTML
 * document or in DOM APIs.
 */
export abstract class SafeStyle {
  // @ts-ignore: error TS6133: 'brand' is declared but its value is never read.
  private readonly brand!: never;  // To prevent structural typing.
}

/** Implementation for `SafeStyle` */
class StyleImpl extends SafeStyle {
  readonly privateDoNotAccessOrElseWrappedStyle: string;

  constructor(style: string, token: object) {
    super();
    ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedStyle = style;
  }

  override toString(): string {
    return this.privateDoNotAccessOrElseWrappedStyle;
  }
}

/**
 * Builds a new `SafeStyle` from the given string, without enforcing
 * safety guarantees. This shouldn't be exposed to application developers, and
 * must only be used as a step towards safe builders or safe constants.
 */
export function createStyle(style: string): SafeStyle {
  return new StyleImpl(style, secretToken);
}

/**
 * Checks if the given value is a `SafeStyle` instance.
 */
export function isStyle(value: unknown): value is SafeStyle {
  return value instanceof StyleImpl;
}

/**
 * Returns the string value of the passed `SafeStyle` object while ensuring it
 * has the correct type.
 */
export function unwrapStyle(value: SafeStyle): string {
  if (value instanceof StyleImpl) {
    return value.privateDoNotAccessOrElseWrappedStyle;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeStyle';
    }
    throw new Error(message);
  }
}
