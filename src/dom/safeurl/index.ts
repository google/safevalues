/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides functions to enforce the SafeUrl contract at the sink
 * level.
 */

/**
 * An inert URL, used as an inert return value when an unsafe input was
 * sanitized.
 */
export const INNOCUOUS_URL: string = 'about:invalid';
/**
 * @define
 */
const ASSUME_IMPLEMENTS_URL_API = goog.define(
    'ASSUME_IMPLEMENTS_URL_API',
    // TODO(b/154845327) narrow this down if earlier featureset years allow,
    // if they get defined. FY2020 does NOT include Edge (EdgeHTML), which is
    // good as workarounds are needed for spec compliance and a searchParams
    // polyfill.
    goog.FEATURESET_YEAR >= 2020);

// Tests for URL browser API support. e.g. IE doesn't support it.
const supportsURLAPI = {
  // TODO(b/155106210) Does this work without JSCompiler?
  valueOf() {
    if (ASSUME_IMPLEMENTS_URL_API) {
      return true;
    }
    try {
      new URL('s://g');
      return true;
    } catch (e) {
      return false;
    }
  }
}.valueOf();

/**
 * Implements a javascript URL sanitization for browsers that don't implement
 * for the URL API. The sanitizer looks for an explicit scheme, strips
 * characters that could be used to evade the filter and tests for javascript.
 * No reasonable URL should be a false positive as the scheme sanitization
 * preserves the scheme charset ([-a-zA-Z0-9+.] and the `/` character.)
 */
function legacySanitizeJavascriptUrl(url: string): string {
  const aTag = document.createElement('a');
  try {
    // We don't use the safe wrapper here because we don't want to sanitize the
    // URL (which would lead to a dependency loop anyway). This is safe because
    // this node is NEVER attached to the DOM.
    aTag.href = url;
    return aTag.protocol === 'javascript:' ? INNOCUOUS_URL : url;
  } catch (e) {
    return url;
  }
}

/**
 * Replaces javascript: URLs with an innocuous URL.
 * The URL parsing relies on the URL API in browsers that support it.
 * @param url The URL to sanitize for a SafeUrl sink.
 */
export function sanitizeJavascriptUrl(url: string): string {
  // We defer to the browser URL parsing as much as possible to detect
  // javascript: schemes. However, old browsers like IE don't support it.
  if (!supportsURLAPI) {
    return legacySanitizeJavascriptUrl(url);
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'javascript:' ? INNOCUOUS_URL : url;
  } catch (e) {
    // According to https://url.spec.whatwg.org/#constructors, the URL
    // constructor with one parameter throws if `url` is not absolute. In this
    // case, we are sure that no explicit scheme (javascript: ) is set.
    return url;
  }
}