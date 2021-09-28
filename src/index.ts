/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Export for main builders of the library.
 *
 * Only used in open source version for now.
 */

export {concatHtmls, createScriptSrc, htmlEscape} from './builders/html_builders';
export {concatScripts, script, scriptFromJson, scriptWithArgs} from './builders/script_builders';
export {appendParams, blobUrlFromScript, replaceFragment, scriptUrl} from './builders/script_url_builders';
/** Reexport the public type (but not the Impl). */
export {EMPTY_HTML, unwrapHtmlForSink} from './implementation/html_impl';
export {EMPTY_SCRIPT, unwrapScriptForSink} from './implementation/script_impl';
export {unwrapScriptUrlForSink} from './implementation/script_url_impl';
