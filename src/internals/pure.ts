/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mark an expression as being free of side effects.
 *
 * This function exists to support Google compiler functionality. Most
 * compilers / bundlers will optimize it away.
 */
export function pure<T>(valueOf: () => T): T {
  // This odd looking expression is a workaround specific to the Closure
  // compiler to mark an expression as pure.

  // BEGIN-INTERNAL
  return ({valueOf}).valueOf();
  // MOE:end_strip_and_replace
  // END-INTERNAL-AND-REPLACE
  // return valueOf()
  // END-EXTERNAL-REPLACEMENT
}
