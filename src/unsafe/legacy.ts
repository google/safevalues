/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createHtml} from '../internals/html_impl';
import {createScript} from '../internals/script_impl';
import {createScriptUrl} from '../internals/script_url_impl';

/*
 * Transitional utilities to unsafely trust random strings as
 * safe values. Intended for temporary use when upgrading a library that
 * used to accept plain strings to use safe values, but where it's not
 * practical to transitively update callers.
 *
 * IMPORTANT: No new code should use the conversion functions in this file,
 * they are intended for refactoring old code to use safe values. New code
 * should construct safe values via their APIs, template systems or
 * sanitizers. If that’s not possible it should use a reviewed conversion and
 * undergo security review.
 *
 * The semantics of the conversions in legacyconversions are very
 * different from the ones provided by reviewed conversions. The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code will always
 * satisfy the TrustedHTML contract (e.g., the output of a secure HTML
 * sanitizer). In uses of legacyconversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the TrustedHTML contract.
 *
 * There are only three valid uses of legacy conversions:
 *
 * 1. Introducing a safe values version of a function which currently consumes
 * string and passes that string to a DOM API which can execute script - and
 * hence cause XSS - like innerHTML. For example, Dialog might expose a
 * setContent method which takes a string and sets the innerHTML property of
 * an element with it. In this case a setHtmlContent function could be
 * added, consuming TrustedHTML instead of string. setContent could then
 * internally use legacyconversions to create a TrustedHTML from string and pass
 * the TrustedHTML to a safe values consumer down the line. In this scenario
 * remember to document the use of legacyconversions in the modified setContent
 * and consider deprecating it as well.
 *
 * 2. Automated refactoring of application code which handles HTML as string
 * but needs to call a function which only takes safe values types. For example,
 * in the Dialog scenario from (1) an alternative option would be to refactor
 * setContent to accept TrustedHTML instead of string and then refactor
 * all current callers to use legacyconversions to pass TrustedHTML. This is
 * generally preferable to (1) because it keeps the library clean of
 * legacyconversions, and makes code sites in application code that are
 * potentially vulnerable to XSS more apparent.
 *
 * 3. Old code which needs to call APIs which consume safe values types and for
 * which it is prohibitively expensive to refactor to use these types.
 * Generally, this is code where safety from XSS is either hopeless or
 * unimportant.
 */

/**
 * Turns a string into TrustedHTML for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyConversionToHtml(s: string): TrustedHTML {
  return createHtml(s);
}

/**
 * Turns a string into TrustedScript for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyConversionToScript(s: string): TrustedScript {
  return createScript(s);
}

/**
 * Turns a string into TrustedScriptURL for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyConversionToScriptUrl(s: string): TrustedScriptURL {
  return createScriptUrl(s);
}
