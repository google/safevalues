/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

/* g3_import_pure from './pure' */
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';


/**
 * Runtime implementation of `TrustedScript` in browswers that don't support it.
 * script element.
 */
class ScriptImpl {
  readonly privateDoNotAccessOrElseWrappedScript: string;

  constructor(script: string, token: object) {
    ensureTokenIsValid(token);
    this.privateDoNotAccessOrElseWrappedScript = script;
  }

  toString(): string {
    return this.privateDoNotAccessOrElseWrappedScript.toString();
  }
}

function createScriptInternal(
    script: string, trusted?: TrustedScript): SafeScript {
  return (trusted ?? new ScriptImpl(script, secretToken)) as SafeScript;
}

const GlobalTrustedScript =
    (typeof window !== undefined) ? window.TrustedScript : undefined;

/**
 * JavaScript code that is safe to evaluate and use as the content of an HTML
 * script element.
 */
export type SafeScript = TrustedScript;

/**
 * Also exports the constructor so that instanceof checks work.
 */
export const SafeScript =
    (GlobalTrustedScript ?? ScriptImpl) as unknown as TrustedScript;

/**
 * Builds a new `SafeScript` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createScript(script: string): SafeScript {
  /** @noinline */
  const noinlineScript = script;
  return createScriptInternal(
      noinlineScript, getTrustedTypesPolicy()?.createScript(noinlineScript));
}

/**
 * An empty `SafeScript` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_SCRIPT: SafeScript =
    /* #__PURE__ */ (
        () => createScriptInternal('', getTrustedTypes()?.emptyScript))();

/**
 * Checks if the given value is a `SafeScript` instance.
 */
export function isScript(value: unknown): value is SafeScript {
  return getTrustedTypes()?.isScript(value) || value instanceof ScriptImpl;
}

/**
 * Returns the value of the passed `SafeScript` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedScript` or a string if Trusted Types are disabled.
 */
export function unwrapScript(value: SafeScript): TrustedScript|string {
  if (getTrustedTypes()?.isScript(value)) {
    return value;
  } else if (value instanceof ScriptImpl) {
    return value.privateDoNotAccessOrElseWrappedScript;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeScript';
    }
    throw new Error(message);
  }
}
