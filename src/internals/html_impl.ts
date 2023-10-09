/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

/* g3_import_pure from './pure' */
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';


/**
 * String that is safe to use in HTML contexts in DOM APIs and HTML documents.
 * See
 * https://github.com/google/safevalues/blob/main/src/README.md#trustedresourceurl
 */
export abstract class SafeHtml {
  // tslint:disable-next-line:no-unused-variable
  // @ts-ignore
  private readonly brand!: never;  // To prevent structural typing.
}

/** Implementation for `SafeHtml` */
class HtmlImpl extends SafeHtml {
  readonly privateDoNotAccessOrElseWrappedHtml: TrustedHTML|string;

  constructor(html: TrustedHTML|string, token: object) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedHtml = html;
  }

  override toString(): string {
    return this.privateDoNotAccessOrElseWrappedHtml.toString();
  }
}

function createHtmlInstance(html: string, trusted?: TrustedHTML): SafeHtml {
  return new HtmlImpl(trusted ?? html, secretToken);
}

/**
 * Builds a new `SafeHtml` from the given string, without enforcing safety
 * guarantees. It may cause side effects by creating a Trusted Types policy.
 * This shouldn't be exposed to application developers, and must only be used as
 * a step towards safe builders or safe constants.
 */
export function createHtmlInternal(html: string): SafeHtml {
  /** @noinline */
  const noinlineHtml = html;
  return createHtmlInstance(
      noinlineHtml, getTrustedTypesPolicy()?.createHTML(noinlineHtml));
}

/**
 * An empty `SafeHtml` constant.
 * Unlike the function above, using this will not create a policy.
 */
export const EMPTY_HTML: SafeHtml =
    /* #__PURE__ */ (
        () => createHtmlInstance('', getTrustedTypes()?.emptyHTML))();

/**
 * Checks if the given value is a `SafeHtml` instance.
 */
export function isHtml(value: unknown): value is SafeHtml {
  return value instanceof HtmlImpl;
}

/**
 * Returns the value of the passed `SafeHtml` object while ensuring it
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
export function unwrapHtml(value: SafeHtml): TrustedHTML&string {
  if (value instanceof HtmlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedHtml;
    return unwrapped as TrustedHTML & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeHtml';
    }
    throw new Error(message);
  }
}
