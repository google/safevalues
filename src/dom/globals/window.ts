/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';

/**
 * open calls {@link Window.open} on the given {@link Window}, given a
 * target {@link Url}.
 */
export function open(
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
export function getScriptNonce(documentOrWindow?: Document | Window): string {
  return getNonceFor('script', documentOrWindow);
}

/**
 * Returns CSP nonce, if set for any style tag.
 */
export function getStyleNonce(documentOrWindow?: Document | Window): string {
  return getNonceFor('style', documentOrWindow);
}

function getNonceFor(
  elementName: 'script' | 'style',
  documentOrWindow: Document | Window = document,
): string {
  // Note: We can't use `instanceof` here because `documentOrWindow` likely
  // comes from a different realm.
  const doc =
    'document' in documentOrWindow
      ? documentOrWindow.document
      : documentOrWindow;

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
