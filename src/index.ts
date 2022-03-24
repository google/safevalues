/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Safe builders */
export {concatHtmls, createScript, createScriptSrc, htmlEscape} from './builders/html_builders';
export {appendParams, blobUrlFromScript, replaceFragment, trustedResourceUrl} from './builders/resource_url_builders';
export {concatScripts, safeScript, safeScriptWithArgs, scriptFromJson} from './builders/script_builders';
/** Types, constants and unwrappers */
export {EMPTY_HTML, isHtml, SafeHtml, unwrapHtml, unwrapHtmlAsString} from './internals/html_impl';
export {isResourceUrl, TrustedResourceUrl, unwrapResourceUrl, unwrapResourceUrlAsString} from './internals/resource_url_impl';
export {EMPTY_SCRIPT, isScript, SafeScript, unwrapScript, unwrapScriptAsString} from './internals/script_impl';
