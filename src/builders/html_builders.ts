/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createHtmlInternal,
  isHtml,
  SafeHtml,
  unwrapHtml,
} from '../internals/html_impl.js';
import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../internals/resource_url_impl.js';
import {SafeScript, unwrapScript} from '../internals/script_impl.js';

/**
 * Returns HTML-escaped text as a `SafeHtml` object. No-op if value is already a
 * SafeHtml instance.
 *
 * Available options:
 * - `preserveSpaces` turns every second consecutive space character into its
 * HTML entity representation (`&#160;`).
 * - `preserveNewlines` turns newline characters into breaks (`<br>`).
 * - `preserveTabs` wraps tab characters in a span with style=white-space:pre.
 */
export function htmlEscape(
  value: SafeHtml | string,
  options?: {
    preserveNewlines?: boolean;
    preserveSpaces?: boolean;
    preserveTabs?: boolean;
  },
): SafeHtml {
  if (isHtml(value)) {
    return value;
  }
  let htmlEscapedString = htmlEscapeToString(String(value));
  if (options?.preserveSpaces) {
    // Do this first to ensure we preserve spaces after newlines and tabs.
    htmlEscapedString = htmlEscapedString.replace(
      /(^|[\r\n\t ]) /g,
      '$1&#160;',
    );
  }
  if (options?.preserveNewlines) {
    htmlEscapedString = htmlEscapedString.replace(/(\r\n|\n|\r)/g, '<br>');
  }
  if (options?.preserveTabs) {
    htmlEscapedString = htmlEscapedString.replace(
      /(\t+)/g,
      '<span style="white-space:pre">$1</span>',
    );
  }
  return createHtmlInternal(htmlEscapedString);
}

/**
 * Creates a `SafeHtml` representing a script tag with inline script content.
 */
export function scriptToHtml(
  script: SafeScript,
  options?: {
    defer?: boolean;
    id?: string;
    nonce?: string;
    type?: string;
  },
): SafeHtml {
  const unwrappedScript = unwrapScript(script).toString();
  let stringTag = `<script`;
  if (options?.id) {
    stringTag += ` id="${htmlEscapeToString(options.id)}"`;
  }
  if (options?.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  if (options?.type) {
    stringTag += ` type="${htmlEscapeToString(options.type)}"`;
  }
  if (options?.defer) {
    stringTag += ` defer`;
  }
  stringTag += `>${unwrappedScript}\u003C/script>`;
  return createHtmlInternal(stringTag);
}

/**
 * Creates a `SafeHtml` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 */
export function scriptUrlToHtml(
  src: TrustedResourceUrl,
  options?: {
    async?: boolean;
    attributionSrc?: string;
    customElement?: string;
    defer?: boolean;
    id?: string;
    nonce?: string;
    type?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
  },
): SafeHtml {
  const unwrappedSrc = unwrapResourceUrl(src).toString();
  let stringTag = `<script src="${htmlEscapeToString(unwrappedSrc)}"`;
  if (options?.async) {
    stringTag += ' async';
  }
  if (options?.attributionSrc !== undefined) {
    stringTag += ` attributionsrc="${htmlEscapeToString(options.attributionSrc)}"`;
  }
  if (options?.customElement) {
    stringTag += ` custom-element="${htmlEscapeToString(
      options.customElement,
    )}"`;
  }
  if (options?.defer) {
    stringTag += ` defer`;
  }
  if (options?.id) {
    stringTag += ` id="${htmlEscapeToString(options.id)}"`;
  }
  if (options?.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  if (options?.type) {
    stringTag += ` type="${htmlEscapeToString(options.type)}"`;
  }
  if (options?.crossorigin) {
    stringTag += ` crossorigin="${htmlEscapeToString(options.crossorigin)}"`;
  }
  stringTag += '>\u003C/script>';
  return createHtmlInternal(stringTag);
}

/**
 * HTML-escapes the given text (`&`, `<`, `>`, `"` and `'`).
 */
function htmlEscapeToString(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  return escaped;
}

/** Creates a `SafeHtml` value by concatenating multiple `SafeHtml`s. */
export function concatHtmls(htmls: ReadonlyArray<SafeHtml | string>): SafeHtml {
  return joinHtmls('', htmls);
}

/**
 * Creates a `SafeHtml` value by concatenating multiple `SafeHtml`s interleaved
 * with a separator.
 */
export function joinHtmls(
  separator: SafeHtml | string,
  htmls: ReadonlyArray<SafeHtml | string>,
): SafeHtml {
  const separatorHtml = htmlEscape(separator);
  return createHtmlInternal(
    htmls
      .map((value) => unwrapHtml(htmlEscape(value)))
      .join(unwrapHtml(separatorHtml).toString()),
  );
}

/**
 * Returns a `SafeHtml` that contains `<!DOCTYPE html>`.
 * This is defined as a function to prevent the definition of a Trusted Type
 * policy when simply importing safevalues.
 */
export function doctypeHtml(): SafeHtml {
  return createHtmlInternal('<!DOCTYPE html>');
}

/**
 * Non-exported version of `nodeToHtml`, with an explicit temporary root to
 * accommodate for the sanitizer's user case.
 */
export function nodeToHtmlInternal(
  node: Node,
  temporaryRoot: Element,
): SafeHtml {
  temporaryRoot.appendChild(node);

  // XML serialization is preferred over HTML serialization as it is
  // stricter and makes sure all attributes are properly escaped, avoiding
  // cases where the tree might mutate when parsed again later due to the
  // complexities of the HTML parsing algorithm
  let serializedNewTree = new XMLSerializer().serializeToString(temporaryRoot);
  // We remove the outer most element as this is the span node created as
  // the root for the sanitized tree and contains a spurious xmlns attribute
  // from the XML serialization step.
  serializedNewTree = serializedNewTree.slice(
    serializedNewTree.indexOf('>') + 1,
    serializedNewTree.lastIndexOf('</'),
  );
  return createHtmlInternal(serializedNewTree);
}

/**
 * Serializes a Node into it's HTML representation.
 *
 * Note: this method uses strict XML serialization to mitigate mutation issues
 * when the html is then re-parsed by the browser.
 */
export function nodeToHtml(node: Node): SafeHtml {
  const tempRoot = document.createElement('span');
  return nodeToHtmlInternal(node, tempRoot);
}
