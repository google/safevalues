/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

/* g3_import_pure */
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';

/** Implementation for `TrustedHTML` */
class HtmlImpl {
  readonly privateDoNotAccessOrElseWrappedHtml: string;

  constructor(html: string, token: object) {
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedHtml = html;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedHtml.toString();
  }
}

function createHtmlInternal(html: string, trusted?: TrustedHTML): TrustedHTML {
  return (trusted ?? new HtmlImpl(html, secretToken)) as TrustedHTML;
}

/**
 * Builds a new `TrustedHTML` from the given string, without enforcing safety
 * guarantees. It may cause side effects by creating a Trusted Types policy.
 * This shouldn't be exposed to application developers, and must only be used as
 * a step towards safe builders or safe constants.
 */
export function createHtml(html: string): TrustedHTML {
  /** @noinline */
  const noinlineHtml = html;
  return createHtmlInternal(
      noinlineHtml, getTrustedTypesPolicy()?.createHTML(noinlineHtml));
}

/**
 * An empty `TrustedHTML` constant.
 * Unlike the function above, using this will not create a policy.
 */
export const EMPTY_HTML: TrustedHTML =
    /* #__PURE__ */ (
        () => createHtmlInternal('', getTrustedTypes()?.emptyHTML))();

/**
 * Checks if the given value is a `TrustedHTML` instance.
 */
export function isHtml(value: unknown): value is TrustedHTML {
  if (getTrustedTypes()?.isHTML(value)) {
    return true;
  }
  return value instanceof HtmlImpl;
}

/**
 * Returns the value of the passed `TrustedHTML` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedHTML` or a string if Trusted Types are disabled.
 *
 * The strange return type is to ensure the value can be used at sinks without a
 * cast despite the TypeScript DOM lib not supporting Trusted Types.
 * (https://github.com/microsoft/TypeScript/issues/30024)
 *
 * Note that while the return type is compatible with `string`, you shouldn't
 * use any string functions on the result as that will fail in browsers
 * supporting Trusted Types.
 */
export function unwrapHtml(value: TrustedHTML): TrustedHTML&string {
  if (getTrustedTypes()?.isHTML(value)) {
    return value as TrustedHTML & string;
  }
  if (value instanceof HtmlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedHtml;
    return unwrapped as TrustedHTML & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping TrustedHTML';
    }
    throw new Error(message);
  }
}

/**
 * Same as `unwrapHtml`, but returns an actual string.
 *
 * Also ensures to return the right string value for `TrustedHTML` objects if
 * the `toString` function has been overwritten on the object.
 */
export function unwrapHtmlAsString(value: TrustedHTML): string {
  const unwrapped = unwrapHtml(value);
  if (getTrustedTypes()?.isHTML(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedHTML`.
    return TrustedHTML.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
