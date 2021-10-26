/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Safe builders */
export {concatHtmls, createScriptSrc, htmlEscape} from './builders/html_builders';
export {appendParams, blobUrlFromScript, replaceFragment, scriptUrl} from './builders/resource_url_builders';
export {concatScripts, script, scriptFromJson, scriptWithArgs} from './builders/script_builders';
/** Types, constants and unwrappers */
export {EMPTY_HTML, unwrapHtmlAsString, unwrapHtmlForSink} from './internals/html_impl';
export {unwrapScriptUrlAsString, unwrapScriptUrlForSink} from './internals/resource_url_impl';
export {EMPTY_SCRIPT, unwrapScriptAsString, unwrapScriptForSink} from './internals/script_impl';
