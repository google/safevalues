/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createHtml, SafeHtml, unwrapHtmlAsString} from '../internals/html_impl';
import {TrustedResourceUrl, unwrapResourceUrlAsString} from '../internals/resource_url_impl';
import {SafeScript, unwrapScriptAsString} from '../internals/script_impl';

/**
 * Returns HTML-escaped text as a `SafeHtml` object.
 *
 * Available options:
 * - `preserveSpaces` turns every second consecutive space character into its
 * HTML entity representation (`&#160;`).
 * - `preserveNewlines` turns newline characters into breaks (`<br>`).
 * - `preserveTabs` wraps tab characters in a span with style=white-space:pre.
 */
export function htmlEscape(text: string, options: {
  preserveNewlines?: boolean,
  preserveSpaces?: boolean,
  preserveTabs?: boolean
} = {}): SafeHtml {
  let htmlEscapedString = htmlEscapeToString(text);
  if (options.preserveSpaces) {
    // Do this first to ensure we preserve spaces after newlines and tabs.
    htmlEscapedString =
        htmlEscapedString.replace(/(^|[\r\n\t ]) /g, '$1&#160;');
  }
  if (options.preserveNewlines) {
    htmlEscapedString = htmlEscapedString.replace(/(\r\n|\n|\r)/g, '<br>');
  }
  if (options.preserveTabs) {
    htmlEscapedString = htmlEscapedString.replace(
        /(\t+)/g, '<span style="white-space:pre">$1</span>');
  }
  return createHtml(htmlEscapedString);
}

/**
 * Creates a `SafeHtml` representing a script tag with inline script content.
 */
export function createScript(script: SafeScript, options: {
  id?: string,
  nonce?: string,
  type?: string,
} = {}): SafeHtml {
  const unwrappedScript = unwrapScriptAsString(script);
  let stringTag = `<script`;
  if (options.id) {
    stringTag += ` id="${htmlEscapeToString(options.id)}"`;
  }
  if (options.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  if (options.type) {
    stringTag += ` type="${htmlEscapeToString(options.type)}"`;
  }
  stringTag += `>${unwrappedScript}\x3c/script>`;
  return createHtml(stringTag);
}

/**
 * Creates a `SafeHtml` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 */
export function createScriptSrc(
    src: TrustedResourceUrl, async?: boolean, nonce?: string): SafeHtml {
  const unwrappedSrc = unwrapResourceUrlAsString(src);
  let stringTag = `<script src="${htmlEscapeToString(unwrappedSrc)}"`;
  if (async) {
    stringTag += ' async';
  }
  if (nonce) {
    stringTag += ` nonce="${htmlEscapeToString(nonce)}"`;
  }
  stringTag += '>\x3c/script>';
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

/** Creates a `SafeHtml` value by concatenating multiple `SafeHtml`s. */
export function concatHtmls(htmls: readonly SafeHtml[]): SafeHtml {
  return createHtml(htmls.map(unwrapHtmlAsString).join(''));
}
