/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Internal implementations of SafeAttributePrefix. */

import '../environment/dev.js';

import {ensureTokenIsValid, secretToken} from './secrets.js';

/**
 * A prefix with which an attribute is safe to set using plain strings.
 */
export class SafeAttributePrefix {
  private readonly privateDoNotAccessOrElseWrappedAttributePrefix: string;

  private constructor(token: object, value: string) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }

    this.privateDoNotAccessOrElseWrappedAttributePrefix = value;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedAttributePrefix;
  }
}

interface AttributePrefixImpl {
  privateDoNotAccessOrElseWrappedAttributePrefix: string;
}
const AttributePrefixImpl = SafeAttributePrefix as {
  new (token: object, value: string): SafeAttributePrefix;
};

/**
 * Builds a new `SafeAttributePrefix` from the given string, without enforcing
 * safety guarantees. This shouldn't be exposed to application developers, and
 * must only be used as a step towards safe builders or safe constants.
 */
export function createAttributePrefixInternal(
  value: string,
): SafeAttributePrefix {
  return new AttributePrefixImpl(secretToken, value);
}

/**
 * Checks if the given value is a `SafeAttributePrefix` instance.
 */
export function isAttributePrefix(
  value: unknown,
): value is SafeAttributePrefix {
  return value instanceof SafeAttributePrefix;
}

/**
 * Returns the string value of the passed `SafeAttributePrefix` object while
 * ensuring it has the correct type.
 */
export function unwrapAttributePrefix(value: SafeAttributePrefix): string {
  if (isAttributePrefix(value)) {
    return (value as unknown as AttributePrefixImpl)
      .privateDoNotAccessOrElseWrappedAttributePrefix;
  }
  let message = '';
  if (process.env.NODE_ENV !== 'production') {
    message = `Unexpected type when unwrapping SafeAttributePrefix, got '${value}' of type '${typeof value}'`;
  }
  throw new Error(message);
}
