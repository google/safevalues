/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeScript, TrustedResourceUrl, unwrapResourceUrl, unwrapScript} from '../../index';

/** Returns CSP nonce, if set for any script tag. */
function getScriptNonceFromWindow(win: Window): string {
  const doc = win.document;
  // document.querySelector can be undefined in non-browser environments.
  const script = doc.querySelector?.<HTMLScriptElement>('script[nonce]');
  if (script) {
    // Try to get the nonce from the IDL property first, because browsers that
    // implement additional nonce protection features (currently only Chrome) to
    // prevent nonce stealing via CSS do not expose the nonce via attributes.
    // See https://github.com/whatwg/html/issues/2369
    return script['nonce'] || script.getAttribute('nonce') || '';
  }
  return '';
}

/** Propagates CSP nonce to dynamically created scripts. */
function setNonceForScriptElement(script: HTMLScriptElement) {
  const win = script.ownerDocument && script.ownerDocument.defaultView;
  const nonce = getScriptNonceFromWindow(win || window);
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
}

/** Sets textContent from the given SafeScript. */
export function setTextContent(script: HTMLScriptElement, v: SafeScript) {
  script.textContent = unwrapScript(v);
  setNonceForScriptElement(script);
}

/** Sets the Src attribute using a TrustedResourceUrl */
export function setSrc(script: HTMLScriptElement, v: TrustedResourceUrl) {
  script.src = unwrapResourceUrl(v);
  setNonceForScriptElement(script);
}
