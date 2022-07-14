/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides functions to enforce the SafeUrl contract at the sink
 * level.
 */

import '../environment/dev';

/**
 * An inert URL, used as an inert return value when an unsafe input was
 * sanitized.
 */
export const INNOCUOUS_URL: string = 'about:invalid';

/**
 * Replaces javascript: URLs with an innocuous URL.
 * The URL parsing relies on the URL API in browsers that support it.
 * @param url The URL to sanitize for a SafeUrl sink.
 */
export function sanitizeJavascriptUrl(url: string): string {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    // According to https://url.spec.whatwg.org/#constructors, the URL
    // constructor with one parameter throws if `url` is not absolute. In this
    // case, we are sure that no explicit scheme (javascript: ) is set.
    return url;
  }
  if (parsedUrl.protocol === 'javascript:') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`A URL with content '${
          url}' was sanitized away. javascript: URLs can lead to XSS and is a CSP rollout blocker.`);
    }
    return INNOCUOUS_URL;
  }
  return url;
}

/**
 * Type alias for URLs passed to DOM sink wrappers.
 */
export type Url = string;

/**
 * Adapter to sanitize string URLs in DOM sink wrappers.
 */
export function unwrapUrlOrSanitize(url: Url): string {
  return sanitizeJavascriptUrl(url);
}