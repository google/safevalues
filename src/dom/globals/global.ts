/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeScript, unwrapScript} from '../../internals/script_impl.js';

export {fetchResourceUrl, type SafeResponse} from './fetch.js';

/**
 * Evaluates a SafeScript value in the given scope using eval.
 *
 * Strongly consider avoiding this, as eval blocks CSP adoption and does not
 * benefit from compiler optimizations.
 */
export function globalEval(
  win: Window | typeof globalThis,
  script: SafeScript,
): unknown {
  const trustedScript = unwrapScript(script);
  let result = (win as typeof globalThis).eval(trustedScript as string);
  if (result === trustedScript) {
    // https://crbug.com/1024786 manifesting in workers.
    result = (win as typeof globalThis).eval(trustedScript.toString());
  }
  return result;
}
