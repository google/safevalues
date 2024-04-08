/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import '../environment/dev';

/**
 * Extracts the scheme from the given URL. If the URL is relative, https: is
 * assumed.
 * @param url The URL to extract the scheme from.
 * @return the URL scheme.
 */
export function extractScheme(url: string): string|undefined {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    // According to https://url.spec.whatwg.org/#constructors, the URL
    // constructor with one parameter throws if `url` is not absolute. In this
    // case, we are sure that no explicit scheme (javascript: ) is set.
    // This can also be a URL parsing error, but in this case the URL won't be
    // run anyway.
    return 'https:';
  }
  return parsedUrl.protocol;
}

// We can't use an ES6 Set here because gws somehow depends on this code and
// doesn't want to pay the cost of a polyfill.
const ALLOWED_SCHEMES = ['data:', 'http:', 'https:', 'mailto:', 'ftp:'];

/**
 * A pattern that blocks javascript: URLs. Matches
 * (a) Urls with an explicit scheme that is not javascript and that only has
 *     alphanumeric or [.-+_] characters; or
 * (b) Urls with no explicit scheme. The pattern allows the first colon
 *     (`:`) character to appear after one of  the `/` `?` or `#` characters,
 *     which means the colon appears in path, query or fragment part of the URL.
 */
export const IS_NOT_JAVASCRIPT_URL_PATTERN =
    /^\s*(?!javascript:)(?:[\w+.-]+:|[^:/?#]*(?:[/?#]|$))/i;

function hasJavascriptUrlScheme(url: string): boolean {
  return !IS_NOT_JAVASCRIPT_URL_PATTERN.test(url);
}

/**
 * Checks that the URL scheme is not javascript.
 * The URL parsing relies on the URL API in browsers that support it.
 * @param url The URL to sanitize for a SafeUrl sink.
 * @return undefined if url has a javascript: scheme, the original URL
 *     otherwise.
 */
export function sanitizeJavaScriptUrl(url: string): string|undefined {
  if (hasJavascriptUrlScheme(url)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`A URL with content '${url}' was sanitized away.`);
    }
    return undefined;
  }
  return url;
}

/**
 * Type alias for URLs passed to DOM sink wrappers.
 */
export type Url = string;

/**
 * Adapter to sanitize string URLs in DOM sink wrappers.
 * @return undefined if the URL was sanitized.
 */
export function unwrapUrlOrSanitize(url: Url): string|undefined {
  return sanitizeJavaScriptUrl(url);
}

/**
 * Sanitizes a URL restrictively.
 * This sanitizer protects against XSS and potentially other uncommon and
 * undesirable schemes that an attacker could use e.g. phishing (tel:, callto:
 * ssh: etc schemes). This sanitizer is primarily meant to be used by the HTML
 * sanitizer.
 */
export function restrictivelySanitizeUrl(url: string): string {
  const parsedScheme = extractScheme(url);
  if (parsedScheme !== undefined &&
      ALLOWED_SCHEMES.indexOf(parsedScheme.toLowerCase()) !== -1) {
    return url;
  }
  return 'about:invalid#zClosurez';
}
