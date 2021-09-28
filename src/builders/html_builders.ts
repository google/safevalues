/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {createHtml, unwrapHtmlAsString} from '../implementation/html_impl';
import {unwrapScriptUrlAsString} from '../implementation/script_url_impl';

/**
 * Returns HTML-escaped text as a `TrustedHTML` object.
 *
 * Available options:
 * - `preserveSpaces` turns every second consecutive space character into its
 * HTML entity representation (`&#160;`).
 * - `preserveNewlines` turns newline characters into breaks (`<br />`).
 */
export function htmlEscape(
    text: string,
    options: {preserveNewlines?: boolean, preserveSpaces?: boolean} = {}):
    TrustedHTML {
  let htmlEscapedString = htmlEscapeToString(text);
  if (options.preserveSpaces) {
    htmlEscapedString = htmlEscapedString.replace(/  /g, ' &#160;');
  }
  if (options.preserveNewlines) {
    htmlEscapedString = htmlEscapedString.replace(/(\r\n|\n|\r)/g, '<br />');
  }
  return createHtml(htmlEscapedString);
}

/**
 * Creates a `TrustedHTML` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 */
export function createScriptSrc(
    src: TrustedScriptURL, async?: boolean, nonce?: string): TrustedHTML {
  const unwrappedSrc = unwrapScriptUrlAsString(src);
  let stringTag = `<script src="${htmlEscapeToString(unwrappedSrc)}"`;
  if (async) {
    stringTag += ' async';
  }
  if (nonce) {
    stringTag += ` nonce="${htmlEscapeToString(nonce)}"`;
  }
  stringTag += '></script>';
  return createHtml(stringTag);
}

/**
 * HTML-escapes the given text (`&`, `<`, `>`, `"` and `'`).
 */
function htmlEscapeToString(text: string): string {
  const escaped = text.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
  return escaped;
}

/** Creates a `TrustedHTML` value by concatenating multiple `TrustedHTML`s. */
export function concatHtmls(htmls: readonly TrustedHTML[]): TrustedHTML {
  return createHtml(htmls.map(unwrapHtmlAsString).join(''));
}
