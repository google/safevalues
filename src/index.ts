/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Safe builders */
export {safeAttrPrefix} from './builders/attribute_builders';
export {concatHtmls, htmlEscape, scriptToHtml, scriptUrlToHtml} from './builders/html_builders';
export {HtmlSanitizer, sanitizeHtml, sanitizeHtmlAssertUnchanged, sanitizeHtmlToFragment} from './builders/html_sanitizer/html_sanitizer';
export {HtmlSanitizerBuilder} from './builders/html_sanitizer/html_sanitizer_builder';
export {appendParams, appendPathSegment, objectUrlFromScript, replaceFragment, trustedResourceUrl} from './builders/resource_url_builders';
export {concatScripts, safeScript, safeScriptWithArgs, valueAsScript} from './builders/script_builders';
export {concatStyleSheets, safeStyleSheet} from './builders/style_sheet_builders';
/** Types, constants and unwrappers */
export {SafeAttributePrefix, unwrapAttributePrefix} from './internals/attribute_impl';
export {EMPTY_HTML, isHtml, SafeHtml, unwrapHtml} from './internals/html_impl';
export {isResourceUrl, TrustedResourceUrl, unwrapResourceUrl} from './internals/resource_url_impl';
export {EMPTY_SCRIPT, isScript, SafeScript, unwrapScript} from './internals/script_impl';
export {isStyleSheet, SafeStyleSheet, unwrapStyleSheet} from './internals/style_sheet_impl';

// BEGIN-INTERNAL
goog.tsMigrationNamedExportsShim('safevalues');
goog.tsMigrationExportsShimDeclareLegacyNamespace();
// END-INTERNAL