/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

/* g3_import_pure from './pure' */
import {ensureTokenIsValid, secretToken} from './secrets';
import {getTrustedTypes, getTrustedTypesPolicy} from './trusted_types';



/**
 * JavaScript code that is safe to evaluate and use as the content of an HTML
 * script element.
 *
 * See https://github.com/google/safevalues/blob/main/src/README.md#safescript
 */
export abstract class SafeScript {
  // tslint:disable-next-line:no-unused-variable
  // @ts-ignore
  private readonly brand!: never;  // To prevent structural typing.
}

/** Implementation for `SafeScript` */
class ScriptImpl extends SafeScript {
  readonly privateDoNotAccessOrElseWrappedScript: TrustedScript|string;

  constructor(script: TrustedScript|string, token: object) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      ensureTokenIsValid(token);
    }
    this.privateDoNotAccessOrElseWrappedScript = script;
  }

  override toString(): string {
    return this.privateDoNotAccessOrElseWrappedScript.toString();
  }
}

function createScriptInstance(
    script: string, trusted?: TrustedScript): SafeScript {
  return new ScriptImpl(trusted ?? script, secretToken);
}

/**
 * Builds a new `SafeScript` from the given string, without enforcing
 * safety guarantees. It may cause side effects by creating a Trusted Types
 * policy. This shouldn't be exposed to application developers, and must only be
 * used as a step towards safe builders or safe constants.
 */
export function createScriptInternal(script: string): SafeScript {
  /** @noinline */
  const noinlineScript = script;
  return createScriptInstance(
      noinlineScript, getTrustedTypesPolicy()?.createScript(noinlineScript));
}

/**
 * An empty `SafeScript` constant.
 * Unlike the functions above, using this will not create a policy.
 */
export const EMPTY_SCRIPT: SafeScript =
    /* #__PURE__ */ (
        () => createScriptInstance('', getTrustedTypes()?.emptyScript))();

/**
 * Checks if the given value is a `SafeScript` instance.
 */
export function isScript(value: unknown): value is SafeScript {
  return value instanceof ScriptImpl;
}

/**
 * Returns the value of the passed `SafeScript` object while ensuring it
 * has the correct type.
 *
 * Returns a native `TrustedScript` or a string if Trusted Types are disabled.
 *
 * The strange return type is to ensure the value can be used at sinks without a
 * cast despite the TypeScript DOM lib not supporting Trusted Types.
 * (https://github.com/microsoft/TypeScript/issues/30024)
 *
 * Note that while the return type is compatible with `string`, you shouldn't
 * use any string functions on the result as that will fail in browsers
 * supporting Trusted Types.
 */
export function unwrapScript(value: SafeScript): TrustedScript&string {
  if (value instanceof ScriptImpl) {
    const unwrapped = value.privateDoNotAccessOrElseWrappedScript;
    return unwrapped as TrustedScript & string;
  } else {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'Unexpected type when unwrapping SafeScript';
    }
    throw new Error(message);
  }
}
