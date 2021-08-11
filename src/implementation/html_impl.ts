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

import {devMode} from '../environment';

import {pure} from './pure';
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';

/** Implementation for `TrustedHTML` */
class HtmlImpl {
  readonly privateDoNotAccessOrElseWrappedHtml: string;

  constructor(html: string, token: object) {
    devMode && ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedHtml = html;
  }

  /** @override */
  toString(): string {
    return this.privateDoNotAccessOrElseWrappedHtml.toString();
  }
}

function createHtmlInternal(html: string, trusted?: TrustedHTML): TrustedHTML {
  // BEGIN-EXTERNAL
  // return (trusted ?? new HtmlImpl(html, devMode ? secretToken : {})) as
  // TrustedHTML; END-EXTERNAL
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
    pure(() => createHtmlInternal('', getTrustedTypes()?.emptyHTML));

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
export function unwrapHtmlForSink(value: TrustedHTML): TrustedHTML&string {
  if (getTrustedTypes()?.isHTML(value)) {
    return value as TrustedHTML & string;
  } else if (value instanceof HtmlImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedHtml;
    return unwrapped as TrustedHTML & string;
  } else {
    throw new Error('wrong type');
  }
}

/**
 * Same as `unwrapHtmlForSink`, but returns an actual string.
 *
 * Also ensures to return the right string value for `TrustedHTML` objects if
 * the `toString` function has been overwritten on the object.
 */
export function unwrapHtmlAsString(value: TrustedHTML): string {
  const unwrapped = unwrapHtmlForSink(value);
  if (getTrustedTypes()?.isHTML(unwrapped)) {
    // TODO: Remove once the spec freezes instances of `TrustedHTML`.
    return TrustedHTML.prototype.toString.apply(unwrapped);
  } else {
    return unwrapped;
  }
}
