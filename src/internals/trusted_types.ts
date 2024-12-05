/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for interacting with Trusted Types, create and/or
 * retrieve the policy for the library.
 */

import '../environment/dev.js';
import {
  GlobalWithTrustedTypes,
  TrustedTypePolicy,
  TrustedTypePolicyFactory,
} from './trusted_types_typings.js';

type ExposeTrustedTypes = false;

/**
 * Controls whether to expose Trusted Types to the user through unwrapper
 * functions.
 */
export type UnwrapType<T> = ExposeTrustedTypes extends true
  ? T
  : {toString(): string};

/**
 * The name of the Trusted Types policy used by the library, or empty
 * to disable Trusted Types.
 */
const configuredPolicyName = 'google#safe';

/** Mutable version of the policy name so it is testable. */
let policyName = configuredPolicyName;

/** Re-exports the global trustedTypes object for convenience. */
export const trustedTypes: TrustedTypePolicyFactory | undefined = (
  globalThis as GlobalWithTrustedTypes
).trustedTypes;

/**
 * Mutable version of trustedTypes object so it is testable
 *
 * Note: we need to mark this as not inlineable to prevent the compiler from
 * inlining it and causing soy conformance tests to fail.
 * @noinline
 */
let trustedTypesInternal = trustedTypes;

/**
 * Cached Trusted Types policy:
 *  - `null` if Trusted Types are not enabled/supported
 *  - `undefined` if the policy has not been created yet.
 */
let policy: TrustedTypePolicy | null | undefined;

function createPolicy(): TrustedTypePolicy | null {
  let policy: TrustedTypePolicy | null = null;
  if (policyName === '') {
    // Binary is not configured to use Trusted Types.
    return policy;
  }

  if (!trustedTypesInternal) {
    return policy;
  }
  // trustedTypes.createPolicy throws in some older versions of chrome if
  // called with a name that is already registered, even in report-only mode.
  // Until the API changes, catch the error not to break the applications
  // functionally. In such case, the code will fall back to using strings.
  try {
    const identity = (x: string) => x;
    policy = trustedTypesInternal.createPolicy(policyName, {
      createHTML: identity,
      createScript: identity,
      createScriptURL: identity,
    });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      throw e as Error;
    }
  }
  return policy;
}

/**
 * Returns the Trusted Types policy used by safevalues, or null if Trusted
 * Types are not enabled/supported.
 *
 * The first call to this function will create the policy, and all subsequent
 * calls will return the same policy.
 */
export function getPolicy(): TrustedTypePolicy | null {
  if (policy === undefined) {
    policy = createPolicy();
  }
  return policy;
}

/** Helpers for tests. */
export const TEST_ONLY = {
  setPolicyName(name: string): void {
    policyName = name;
  },
  setTrustedTypes(
    mockTrustedTypes: TrustedTypePolicyFactory | undefined,
  ): void {
    trustedTypesInternal = mockTrustedTypes;
  },
  resetDefaults(): void {
    policy = undefined;
    policyName = configuredPolicyName;
    trustedTypesInternal = trustedTypes;
  },
};
