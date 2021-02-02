/*
 * @license
 * Copyright 2020 Google LLC

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
 * @fileoverview Adapter module for use of safevalues from closure
 *
 * This has two advantages:
 *  - Shorter & path independent module names (allowing us to move the code more
 * easily)
 *  - Can be used from files that still use `goog.provide` without having to
 * modify these files
 */

goog.module('safevalues');
goog.module.declareLegacyNamespace();

const trusted_html = goog.require('google3.javascript.typescript.safevalues.trusted_html');
const trusted_html_builders = goog.require('google3.javascript.typescript.safevalues.trusted_html_builders');
const trusted_script = goog.require('google3.javascript.typescript.safevalues.trusted_script');
const trusted_script_builders = goog.require('google3.javascript.typescript.safevalues.trusted_script_builders');
const safe_style = goog.require('google3.javascript.typescript.safevalues.safe_style');
const safe_style_builders = goog.require('google3.javascript.typescript.safevalues.safe_style_builders');
const safe_style_sheet = goog.require('google3.javascript.typescript.safevalues.safe_style_sheet');
const safe_style_sheet_builders = goog.require('google3.javascript.typescript.safevalues.safe_style_sheet_builders');
const safe_url = goog.require('google3.javascript.typescript.safevalues.safe_url');
const safe_url_builders = goog.require('google3.javascript.typescript.safevalues.safe_url_builders');
const trusted_script_url = goog.require('google3.javascript.typescript.safevalues.trusted_script_url');
const trusted_script_url_builders = goog.require('google3.javascript.typescript.safevalues.trusted_script_url_builders');

// TrustedHTML
exports.TrustedHTML = trusted_html.TrustedHTML;
exports.EMPTY_HTML = trusted_html.EMPTY_HTML;
exports.concatHtmls = trusted_html_builders.concatHtmls;
exports.createScriptSrc = trusted_html_builders.createScriptSrc;
exports.htmlEscape = trusted_html_builders.htmlEscape;

// TrustedScript
exports.TrustedScript = trusted_script.TrustedScript;
exports.EMPTY_SCRIPT = trusted_script.EMPTY_SCRIPT;
exports.concatScripts = trusted_script_builders.concatScripts;
exports.trustedScript = trusted_script_builders.trustedScript;

// SafeStyle
exports.SafeStyle = safe_style.SafeStyle;
exports.concatStyles = safe_style_builders.concatStyles;
exports.safeStyle = safe_style_builders.safeStyle;

// SafeStyleSheet
exports.SafeStyleSheet = safe_style_sheet.SafeStyleSheet;
exports.concatStyleSheets = safe_style_sheet_builders.concatStyleSheets;
exports.safeStyleSheet = safe_style_sheet_builders.safeStyleSheet;

// SafeUrl
exports.SafeUrl = safe_url.SafeUrl;
exports.ABOUT_BLANK = safe_url.ABOUT_BLANK;
exports.INNOCUOUS_URL = safe_url.INNOCUOUS_URL;
exports.fromBlob = safe_url_builders.fromBlob;
exports.fromMediaSource = safe_url_builders.fromMediaSource;
exports.fromTrustedScriptURL = safe_url_builders.fromTrustedScriptURL;
exports.safeUrl = safe_url_builders.safeUrl;
exports.SanitizableUrlScheme = safe_url_builders.SanitizableUrlScheme;
exports.sanitizeUrl = safe_url_builders.sanitizeUrl;
exports.trySanitizeUrl = safe_url_builders.trySanitizeUrl;

// TrustedScriptURL
exports.TrustedScriptURL = trusted_script_url.TrustedScriptURL;
exports.appendParams = trusted_script_url_builders.appendParams;
exports.blobUrlFromScript = trusted_script_url_builders.blobUrlFromScript;
exports.trustedScriptURL = trusted_script_url_builders.trustedScriptURL;
