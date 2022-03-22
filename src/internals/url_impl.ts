/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

/* g3_import_pure */
import {ensureTokenIsValid, secretToken} from './secrets';

/**
 * String that is safe to use in URL navigation contexts (`document.location`,
 * `a.href`) and as a reference to resources that do not load in the current
 * origin (`img.src`)
 */
export abstract class SafeUrl {
  // @ts-ignore: error TS6133: 'brand' is declared but its value is never read.
  private readonly brand!: never;  // To prevent structural typing.
}

/** Implementation for `SafeUrl` */
class UrlImpl extends SafeUrl {
  readonly privateDoNotAccessOrElseWrappedUrl: string;

  constructor(url: string, token: object) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedUrl = url;
  }

  override toString(): string {
    return this.privateDoNotAccessOrElseWrappedUrl;
  }
}

/**
 * Builds a new `SafeUrl` from the given string, without enforcing safety
 * guarantees. This shouldn't be exposed to application developers, and must
 * only be used as a step towards safe builders or safe constants.
 */
export function createUrl(url: string): SafeUrl {
  return new UrlImpl(url, secretToken);
}

/** A SafeUrl containing 'about:blank'. */
export const ABOUT_BLANK: SafeUrl =
    /* #__PURE__ */ (() => createUrl('about:blank'))();

/**
 * A SafeUrl containing an inert URL, used as an inert return value when
 * an unsafe input was sanitized.
 */
export const INNOCUOUS_URL: SafeUrl =
    /* #__PURE__ */ (() => createUrl('about:invalid#zTSz'))();

/**
 * Checks if the given value is a `SafeUrl` instance.
 */
export function isUrl(value: unknown): value is SafeUrl {
  return value instanceof UrlImpl;
}

/**
 * Returns the string value of the passed `SafeUrl` object while ensuring it
 * has the correct type.
 */
export function unwrapUrl(value: SafeUrl): string {
  if (value instanceof UrlImpl) {
    return value.privateDoNotAccessOrElseWrappedUrl;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeUrl';
    }
    throw new Error(message);
  }
}
