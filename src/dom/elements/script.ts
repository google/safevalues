/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl';
import {SafeScript, unwrapScript} from '../../internals/script_impl';
import {getScriptNonce} from '../globals/window';

/** Propagates CSP nonce to dynamically created scripts. */
function setNonceForScriptElement(script: HTMLScriptElement) {
  const win = script.ownerDocument && script.ownerDocument.defaultView;
  const nonce = getScriptNonce(win || window);
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
}

/** Sets textContent from the given SafeScript. */
export function setTextContent(
  script: HTMLScriptElement,
  v: SafeScript,
  options?: {omitNonce?: boolean},
) {
  script.textContent = unwrapScript(v) as string;
  if (options?.omitNonce) return;
  setNonceForScriptElement(script);
}

/** Sets the Src attribute using a TrustedResourceUrl */
export function setSrc(
  script: HTMLScriptElement,
  v: TrustedResourceUrl,
  options?: {omitNonce?: boolean},
) {
  script.src = unwrapResourceUrl(v) as string;
  if (options?.omitNonce) return;
  setNonceForScriptElement(script);
}
