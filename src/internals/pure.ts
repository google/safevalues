/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Mark an expression as being free of side effects. */
export function pure<T>(valueOf: () => T): T {
  // This odd looking expression is a workaround specific to the Closure
  // compiler to mark an expression as pure.
  return {valueOf}.valueOf();
}
