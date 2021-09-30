/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Adapter module for use of safevalues/compat from closure. This
 * allows use from files that still use `goog.provide` without modification.
 */

goog.module('safevalues.compat');
goog.module.declareLegacyNamespace();

const compat = goog.require('google3.third_party.javascript.safevalues.compat.index');

// Types
exports.TrustedHTML = compat.TrustedHTML;
exports.TrustedScript = compat.TrustedScript;
exports.SafeStyle = compat.SafeStyle;
exports.SafeStyleSheet = compat.SafeStyleSheet;
exports.SafeUrl = compat.SafeUrl;
exports.TrustedScriptURL = compat.TrustedScriptURL;

// Unwrappers
exports.unwrapHtmlForSink = compat.unwrapHtmlForSink;
exports.unwrapScriptUrlForSink = compat.unwrapScriptUrlForSink;
exports.unwrapSafeStyle = compat.unwrapSafeStyle;
exports.unwrapSafeUrl = compat.unwrapSafeUrl;
exports.unwrapScriptUrl = compat.unwrapScriptUrl;
exports.unwrapScriptForSink = compat.unwrapScriptForSink;
exports.unwrapSafeStyleSheet = compat.unwrapSafeStyleSheet;

// Conversions
exports.toTsHtml = compat.toTsHtml;
exports.fromTsHtml = compat.fromTsHtml;
exports.toTsScript = compat.toTsScript;
exports.fromTsScript = compat.fromTsScript;
exports.toTsSafeUrl = compat.toTsSafeUrl;
exports.fromTsSafeUrl = compat.fromTsSafeUrl;
exports.toTsScriptUrl = compat.toTsScriptUrl;
exports.fromTsScriptUrl = compat.fromTsScriptUrl;
exports.toTsSafeStyle = compat.toTsSafeStyle;
exports.fromTsSafeStyle = compat.fromTsSafeStyle;
exports.toTsSafeStyleSheet = compat.toTsSafeStyleSheet;
exports.fromTsSafeStyleSheet = compat.fromTsSafeStyleSheet;
