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
 * @fileoverview Defines build level visibility restricted unwrappers that
 * support both Closure and TS safe types.
 */

import * as googUnchecked from 'goog:goog.html.reviewed';  // from //third_party/javascript/closure/html:reviewed
import GoogSafeStyle from 'goog:goog.html.SafeStyle'; // from //third_party/javascript/closure/html:safestyle
import GoogSafeStyleSheet from 'goog:goog.html.SafeStyleSheet'; // from //third_party/javascript/closure/html:safestylesheet
import GoogSafeUrl from 'goog:goog.html.SafeUrl'; // from //third_party/javascript/closure/html:safeurl
import GoogHtml from 'goog:goog.html.TrustedHTML'; // from //third_party/javascript/closure/html:safehtml
import GoogScript from 'goog:goog.html.TrustedScript'; // from //third_party/javascript/closure/html:safescript
import GoogScriptUrl from 'goog:goog.html.TrustedScriptURL'; // from //third_party/javascript/closure/html:trustedresourceurl
import Const from 'goog:goog.string.Const'; // from //third_party/javascript/closure/string:const
import {TrustedHTML as TSTrustedHTML} from 'google3/javascript/typescript/safevalues/html';
import * as unchecked from 'google3/javascript/typescript/safevalues/reviewed';
import {SafeStyle as TSSafeStyle} from 'google3/javascript/typescript/safevalues/safe_style';
import {SafeStyleSheet as TSSafeStyleSheet} from 'google3/javascript/typescript/safevalues/safe_style_sheet';
import {unwrapHtmlForSink as tsUnwrapTrustedHTML, unwrapSafeStyle as tsUnwrapSafeStyle, unwrapSafeStyleSheet as tsUnwrapSafeStyleSheet, unwrapSafeUrl as tsUnwrapSafeUrl, unwrapScriptForSink as tsUnwrapTrustedScript, unwrapScriptUrl as tsUnwrapScriptUrl, unwrapScriptUrlForSink as tsUnwrapTrustedScriptURL} from 'google3/javascript/typescript/safevalues/safe_unwrappers';
import {SafeUrl as TSSafeUrl} from 'google3/javascript/typescript/safevalues/safe_url';
import {TrustedScript as TSTrustedScript} from 'google3/javascript/typescript/safevalues/script';
import {TrustedScriptURL as TSTrustedScriptURL} from 'google3/javascript/typescript/safevalues/script_url';

/** Compat type for Closure and TS SafeTypes. */
export type TrustedHTML = GoogHtml|TSTrustedHTML;
/** Compat type for Closure and TS SafeTypes. */
export type TrustedScript = GoogScript|TSTrustedScript;
/** Compat type for Closure and TS SafeTypes. */
export type SafeStyle = GoogSafeStyle|TSSafeStyle;
/** Compat type for Closure and TS SafeTypes. */
export type SafeStyleSheet = GoogSafeStyleSheet|TSSafeStyleSheet;
/** Compat type for Closure and TS SafeTypes. */
export type SafeUrl = GoogSafeUrl|TSSafeUrl;
/** Compat type for Closure and TS SafeTypes. */
export type TrustedScriptURL = GoogScriptUrl|TSTrustedScriptURL;

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapHtmlForSink(html: TrustedHTML): string {
  if (html instanceof TSTrustedHTML) {
    return tsUnwrapTrustedHTML(html);
  }
  return GoogHtml.unwrapHtmlForSink(html) as string;
}

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapScriptUrlForSink(url: TrustedScriptURL): string {
  if (url instanceof TSTrustedScriptURL) {
    return tsUnwrapTrustedScriptURL(url);
  }
  return GoogScriptUrl.unwrapScriptUrlForSink(url) as string;
}

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapSafeStyle(style: SafeStyle): string {
  if (style instanceof TSSafeStyle) {
    return tsUnwrapSafeStyle(style);
  }
  return GoogSafeStyle.unwrap(style);
}

/**
 * Safe unwrapper that support both Closure and TS safe types.
 * @noinline due to b/182875660. This prevents a Closure optimization that
 * breaks IE11 with the location object.
 */
export function unwrapSafeUrl(url: SafeUrl): string {
  if (url instanceof TSSafeUrl) {
    return tsUnwrapSafeUrl(url);
  }
  return GoogSafeUrl.unwrap(url);
}

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapScriptUrl(url: TrustedScriptURL) {
  if (url instanceof TSTrustedScriptURL) {
    return tsUnwrapScriptUrl(url);
  }
  return GoogScriptUrl.unwrap(url);
}

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapScriptForSink(script: TrustedScript): string {
  if (script instanceof TSTrustedScript) {
    return tsUnwrapTrustedScript(script);
  }
  return GoogScript.unwrapScriptForSink(script) as string;
}

/** Safe unwrapper that support both Closure and TS safe types. */
export function unwrapSafeStyleSheet(styleSheet: SafeStyleSheet): string {
  if (styleSheet instanceof TSSafeStyleSheet) {
    return tsUnwrapSafeStyleSheet(styleSheet);
  }
  return GoogSafeStyleSheet.unwrap(styleSheet);
}

/** Converts a goog.html.TrustedHTML into a TypeScript TrustedHTML */
export function toTsHtml(html: TrustedHTML): TSTrustedHTML {
  return unchecked.htmlFromStringKnownToSatisfyTypeContract(
      unwrapHtmlForSink(html).toString(), 'Conversion from closure');
}

/** Converts a TypeScript TrustedHTML into a goog.html.TrustedHTML */
export function fromTsHtml(html: TrustedHTML): GoogHtml {
  return googUnchecked.htmlFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapHtmlForSink(html).toString());
}

/** Converts a goog.html.TrustedScript into a TypeScript TrustedScript */
export function toTsScript(script: TrustedScript): TSTrustedScript {
  return unchecked.scriptFromStringKnownToSatisfyTypeContract(
      unwrapScriptForSink(script).toString(), 'Conversion from closure');
}

/** Converts a TypeScript TrustedScript into a goog.html.TrustedScript */
export function fromTsScript(script: TrustedScript): GoogScript {
  return googUnchecked.scriptFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapScriptForSink(script).toString());
}

/** Converts a goog.html.SafeUrl into a TypeScript SafeUrl */
export function toTsSafeUrl(url: SafeUrl): TSSafeUrl {
  return unchecked.safeUrlFromStringKnownToSatisfyTypeContract(
      unwrapSafeUrl(url), 'Conversion from closure');
}

/** Converts a TypeScript SafeUrl into a goog.html.SafeUrl */
export function fromTsSafeUrl(url: SafeUrl): GoogSafeUrl {
  return googUnchecked.safeUrlFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapSafeUrl(url));
}

/**
 * Converts a goog.html.TrustedScriptURL into a TypeScript TrustedScriptURL
 */
export function toTsScriptUrl(url: TrustedScriptURL): TSTrustedScriptURL {
  return unchecked.scriptUrlFromStringKnownToSatisfyTypeContract(
      unwrapScriptUrlForSink(url).toString(), 'Conversion from closure');
}

/**
 * Converts a TypeScript TrustedScriptURL into a goog.html.TrustedScriptURL
 */
export function fromTsScriptUrl(url: TrustedScriptURL): GoogScriptUrl {
  return googUnchecked.scriptUrlFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapScriptUrlForSink(url).toString());
}

/** Converts a goog.html.SafeStyle into a TypeScript SafeStyle */
export function toTsSafeStyle(style: SafeStyle): TSSafeStyle {
  return unchecked.safeStyleFromStringKnownToSatisfyTypeContract(
      unwrapSafeStyle(style), 'Conversion from closure');
}

/** Converts a TypeScript SafeStyle into a goog.html.SafeStyle */
export function fromTsSafeStyle(style: SafeStyle): GoogSafeStyle {
  return googUnchecked.safeStyleFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapSafeStyle(style));
}

/** Converts a goog.html.SafeStyleSheet into a TypeScript SafeStyleSheet */
export function toTsSafeStyleSheet(sheet: SafeStyleSheet): TSSafeStyleSheet {
  return unchecked.safeStyleSheetFromStringKnownToSatisfyTypeContract(
      unwrapSafeStyleSheet(sheet), 'Conversion from closure');
}

/** Converts a TypeScript SafeStyleSheet into a goog.html.SafeStyleSheet */
export function fromTsSafeStyleSheet(sheet: SafeStyleSheet):
    GoogSafeStyleSheet {
  return googUnchecked.safeStyleSheetFromStringKnownToSatisfyTypeContract(
      Const.from('TS-Closure conversions of the same types'),
      unwrapSafeStyleSheet(sheet));
}
