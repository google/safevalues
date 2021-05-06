/*
 * @license
 * Copyright 2021 Google LLC

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

import {ensureTokenIsValid, secretToken} from './secrets';

/** A prefix with which an attribute is safe to set using plain strings. */
export abstract class SafeAttributePrefix {
  // tslint:disable-next-line:no-unused-variable
  private readonly brand?: never;  // To prevent structural typing.
}

/** Implementation for `SafeAttributePrefix` */
class SafeAttributePrefixImpl extends SafeAttributePrefix {
  readonly privateDoNotAccessOrElseWrappedAttrPrefix: string;

  constructor(attrPrefix: string, token: object) {
    super();
    ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedAttrPrefix = attrPrefix;
  }

  /** @override */
  toString(): string {
    return this.privateDoNotAccessOrElseWrappedAttrPrefix;
  }
}

/**
 * Builds a new `SafeAttribute` from the given string, without enforcing
 * safety guarantees. This shouldn't be exposed to application developers, and
 * must only be used as a step towards safe builders or safe constants.
 */
export function createSafeAttributePrefix(attrPrefix: string):
    SafeAttributePrefix {
  return new SafeAttributePrefixImpl(attrPrefix, secretToken);
}

/**
 * Returns the string value of the passed `SafeAttributePrefix` object while
 * ensuring it has the correct type.
 */
export function unwrapSafeAttributePrefix(value: SafeAttributePrefix): string {
  if (value instanceof SafeAttributePrefixImpl) {
    return value.privateDoNotAccessOrElseWrappedAttrPrefix;
  } else {
    throw new Error('wrong type');
  }
}
