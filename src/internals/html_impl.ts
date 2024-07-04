/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev.js';

import {ensureTokenIsValid, secretToken} from './secrets.js';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types.js';

/**
 * Runtime implementation of `TrustedHTML` in browsers that don't support it.
 */
class HtmlImpl {
  readonly privateDoNotAccessOrElseWrappedHtml: string;

  constructor(html: string, token: object) {
    ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedHtml = html;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedHtml.toString();
  }
}

function createTrustedHtmlOrPolyfill(
  html: string,
  trusted?: TrustedHTML,
): SafeHtml {
  return (trusted ?? new HtmlImpl(html, secretToken)) as SafeHtml;
}

const GlobalTrustedHTML =
  typeof window !== 'undefined' ? window.TrustedHTML : undefined;

/**
 * String that is safe to use in HTML contexts in DOM APIs and HTML
 documents.
 */
export type SafeHtml = TrustedHTML;

/**
 * Also exports the constructor so that instanceof checks work.
 */
export const SafeHtml = (GlobalTrustedHTML ??
  HtmlImpl) as unknown as TrustedHTML;

/**
 * Builds a new `SafeHtml` from the given string, without enforcing safety
 * guarantees. It may cause side effects by creating a Trusted Types policy.
 * This shouldn't be exposed to application developers, and must only be used as
 * a step towards safe builders or safe constants.
 */
export function createHtmlInternal(html: string): SafeHtml {
  /** @noinline */
  const noinlineHtml = html;
  return createTrustedHtmlOrPolyfill(
    noinlineHtml,
    getTrustedTypesPolicy()?.createHTML(noinlineHtml),
  );
}

/**
 * An empty `SafeHtml` constant.
 * Unlike the function above, using this will not create a policy.
 */
export const EMPTY_HTML: SafeHtml = /* #__PURE__ */ (() =>
  createTrustedHtmlOrPolyfill('', getTrustedTypes()?.emptyHTML))();

/**
 * Checks if the given value is a `SafeHtml` instance.
 */
export function isHtml(value: unknown): value is SafeHtml {
  return getTrustedTypes()?.isHTML(value) || value instanceof HtmlImpl;
}

/**
 * Returns the value of the passed `SafeHtml` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedHTML` or a string if Trusted Types are disabled.
 */
export function unwrapHtml(value: SafeHtml): TrustedHTML | string {
  if (getTrustedTypes()?.isHTML(value)) {
    return value;
  } else if (value instanceof HtmlImpl) {
    return value.privateDoNotAccessOrElseWrappedHtml;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeHtml';
    }
    throw new Error(message);
  }
}
