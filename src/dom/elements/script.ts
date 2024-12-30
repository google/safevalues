/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';
import {SafeScript, unwrapScript} from '../../internals/script_impl.js';
import {getScriptNonce} from '../globals/window.js';

/** Propagates CSP nonce to dynamically created scripts. */
function setNonceForScriptElement(script: HTMLScriptElement) {
  const nonce = getScriptNonce(script.ownerDocument);
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
}

/** Sets textContent from the given SafeScript. */
export function setScriptTextContent(
  script: HTMLScriptElement,
  v: SafeScript,
  options?: {omitNonce?: boolean},
): void {
  script.textContent = unwrapScript(v) as string;
  if (options?.omitNonce) return;
  setNonceForScriptElement(script);
}

/** Sets the Src attribute using a TrustedResourceUrl */
export function setScriptSrc(
  script: HTMLScriptElement,
  v: TrustedResourceUrl,
  options?: {omitNonce?: boolean},
): void {
  script.src = unwrapResourceUrl(v) as string;
  if (options?.omitNonce) return;
  setNonceForScriptElement(script);
}
