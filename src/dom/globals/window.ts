/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * Opens the given {@link Url} in a new top-level browsing context (tab) using
 * `target='_blank'` and `'noopener,noreferrer'` (or `'noopener'` when
 * `referrer` is `true`).
 *
 * Always returns `null` (matching browser behavior when `'noopener'` is
 * specified) and never creates an auxiliary browsing context, allowing the
 * navigation to be captured by installed PWAs
 * (see https://developer.chrome.com/docs/capabilities/pwa-navigation-management).
 */
export function openWindowInNewTab(
  win: Window,
  url: Url,
  referrer = false,
): null {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    // Note: In the HTML spec and Blink (GetWindowFeaturesFromString),
    // 'noreferrer' implies 'noopener', whereas 'noopener' alone leaves
    // noreferrer=false (sending the Referer header). Do not pass 'referrer' as
    // a feature token, as unrecognized tokens disable UI bars in Blink and
    // force a popup window (is_popup=true).
    win.open(
      sanitizedUrl,
      '_blank',
      referrer ? 'noopener' : 'noopener,noreferrer',
    );
  }
  return null;
}

/**
 * windowOpen calls {@link Window.open} on the given {@link Window}, given a
 * target {@link Url}, `target`, and explicit `features`.
 *
 * Prefer {@link openWindowInNewTab} or passing `'noopener,noreferrer'` as
 * `features` when opening a new tab (`target='_blank'`) so a new top-level
 * browsing context is created instead of an auxiliary browsing context
 * (see https://developer.chrome.com/docs/capabilities/pwa-navigation-management).
 */
export function windowOpen(
  win: Window,
  url: Url,
  target: string | undefined,
  features: string,
): Window | null;

/**
 * windowOpen calls {@link Window.open} on the given {@link Window}, given a
 * target {@link Url}.
 *
 * @deprecated Use {@link openWindowInNewTab} to open a URL in a new tab, or
 * pass an explicit `features` string as the 4th argument to {@link windowOpen}
 * (primarily `'noopener,noreferrer'`, or `'noopener'` if the referrer header is
 * required, or `'opener'` if the returned {@link Window} reference is needed).
 * Calling `windowOpen` without `'noopener'` or `'noreferrer'` creates an
 * auxiliary browsing context, which prevents PWA link capturing
 * (see https://developer.chrome.com/docs/capabilities/pwa-navigation-management).
 */
export function windowOpen(
  win: Window,
  url: Url,
  target?: string,
): Window | null;

export function windowOpen(
  win: Window,
  url: Url,
  target?: string,
  features?: string,
): Window | null {
  const sanitizedUrl = unwrapUrlOrSanitize(url);
  if (sanitizedUrl !== undefined) {
    return win.open(sanitizedUrl, target, features);
  }
  return null;
}

/**
 * Returns CSP nonce, if set for any script tag.
 */
export function getScriptNonce(doc?: Document): string {
  return getNonceFor('script', doc);
}

/**
 * Returns CSP nonce, if set for any style tag.
 */
export function getStyleNonce(doc?: Document): string {
  return getNonceFor('style', doc);
}

function getNonceFor(
  elementName: 'script' | 'style',
  doc: Document = document,
): string {
  // document.querySelector can be undefined in non-browser environments.
  const el = doc.querySelector?.<HTMLScriptElement | HTMLStyleElement>(
    `${elementName}[nonce]`,
  );

  if (el == null) {
    return '';
  }

  // Try to get the nonce from the IDL property first, because browsers that
  // implement additional nonce protection features (currently only Chrome) to
  // prevent nonce stealing via CSS do not expose the nonce via attributes.
  // See https://github.com/whatwg/html/issues/2369
  return el['nonce'] || el.getAttribute('nonce') || '';
}
