/*
 * @license
 * Copyright 2021 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The name of the Trusted Types policy used by TS safevalues, or empty
 * to disable Trusted Types. This duplicates the 'google#safe', but
 * can be overridden in tests.
 */
let trustedTypesPolicyName = 'google#safe';

/** Helper to retrieve the value of `window.trustedTypes`. */
function trustedTypes() {
  if (typeof window !== 'undefined') {
    return window.trustedTypes;
  }
  return undefined;
}

/**
 * Returns window.trustedTypes if Trusted Types are enabled and supported, or
 * null otherwise.
 */
export function getTrustedTypes(): TrustedTypePolicyFactory|null {
  return (trustedTypesPolicyName !== '') ? (trustedTypes() ?? null) : null;
}

/**
 * The Trusted Types policy used by TS safevalues, or null if Trusted Types
 * are not enabled/supported, or undefined if the policy has not been created
 * yet.
 */
let trustedTypesPolicy: TrustedTypePolicy|null|undefined;

/**
 * Returns the Trusted Types policy used by TS safevalues, or null if Trusted
 * Types are not enabled/supported. The first call to this function will
 * create the policy.
 */
export function getTrustedTypesPolicy(): TrustedTypePolicy|null {
  if (trustedTypesPolicy === undefined) {
    trustedTypesPolicy =
        getTrustedTypes()?.createPolicy(trustedTypesPolicyName, {
          createHTML: (s: string) => s,
          createScript: (s: string) => s,
          createScriptURL: (s: string) => s
        }) ??
        null;
  }
  return trustedTypesPolicy;
}

/** Helpers for tests. */
export const TEST_ONLY = {
  resetDefaults() {
    trustedTypesPolicy = undefined;
    trustedTypesPolicyName = 'google#safe';
  },
  setTrustedTypesPolicyName(name: string) {
    trustedTypesPolicyName = name;
  },
};
