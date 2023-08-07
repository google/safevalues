/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * An object of type TemplateStringsArray represents the literal part(s) of a
 * template literal. This function checks if a TemplateStringsArray object is
 * actually from a template literal.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param numExprs The number of embedded expressions
 */
export function assertIsTemplateObject(
    templateObj: TemplateStringsArray, numExprs: number): void {
  if (!isTemplateObject(templateObj) || (numExprs + 1) !== templateObj.length) {
    throw new TypeError(`
    ############################## ERROR ##############################

    It looks like you are trying to call a template tag function (fn\`...\`)
    using the normal function syntax (fn(...)), which is not supported.

    The functions in the safevalues library are not designed to be called
    like normal functions, and doing so invalidates the security guarantees
    that safevalues provides.

    If you are stuck and not sure how to proceed, please reach out to us
    instead through:
     - https://github.com/google/safevalues/issues

    ############################## ERROR ##############################`);
  }
}

/** Checks if `templateObj` and its raw property are frozen. */
function checkFrozen(templateObj: TemplateStringsArray): boolean {
  return Object.isFrozen(templateObj) && Object.isFrozen(templateObj.raw);
}

/**
 * Examples of code that uses tagged template literals. We use this function
 * below to both check if these examples are frozen and if the code is getting
 * transpiled.
 *
 * We use multiple examples here in case the compiler transpiles sometimes but
 * not all.
 */
function checkFrozenExamples() {
  return checkFrozen`` && checkFrozen`\0` && checkFrozen`\n` &&
      checkFrozen`\u0000`;
}

/**
 * This value tells us if the code is transpiled, in which case we don't
 * check certain things that transpilers typically don't support.
 */
const isTranspiled = checkFrozenExamples.toString().indexOf('[') !== -1;

/**
 * This value tells us if `TemplateStringsArray` are typically frozen in the
 * current environment.
 */
const frozenTSA = checkFrozenExamples();

/** Polyfill of https://github.com/tc39/proposal-array-is-template-object */
function isTemplateObject(templateObj: TemplateStringsArray): boolean {
  /*
   * ############################## WARNING ##############################
   *
   * If you are reading this code to understand how to create a value
   * that satifsies this check, STOP and read this paragraph.
   *
   * This function is there to ensure that our tagged template functions are
   * always called using the tag syntax fn`...`, rather than the normal
   * function syntax fn(...). Bypassing this check invalidates the guarantees
   * that safevalues provides and will result in security issues in your code.
   *
   * If you are stuck and not sure how to proceed, please reach out to us
   * instead through:
   *  - https://github.com/google/safevalues/issues
   *
   * ############################## WARNING ##############################
   */

  if (!Array.isArray(templateObj) || !Array.isArray(templateObj.raw)) {
    return false;
  }

  if (templateObj.length !== templateObj.raw.length) {
    return false;
  }

  if (!isTranspiled && templateObj === templateObj.raw) {
    // Sometimes transpilers use the same array to save on codesize if the
    // template has no special characters that would cause the values in each
    // array to be different.
    return false;
  }

  if ((!isTranspiled || frozenTSA) && !checkFrozen(templateObj)) {
    // Transpilers typically don't freeze `TemplateStringsArray` objects, but we
    // expect that if they did, they would do it consistently, so we also
    // dynamically check if they do.
    return false;
  }

  return true;
}
