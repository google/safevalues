/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Safe builders */
export {safeAttrPrefix} from './builders/attribute_builders.js';
export {
  htmlFragment,
  htmlToNode,
  svgFragment,
} from './builders/document_fragment_builders.js';
export {
  concatHtmls,
  doctypeHtml,
  htmlEscape,
  joinHtmls,
  nodeToHtml,
  scriptToHtml,
  scriptUrlToHtml,
} from './builders/html_builders.js';

export {sanitizeHtmlWithCss} from './builders/html_sanitizer/default_css_sanitizer.js';
export {
  sanitizeHtml,
  sanitizeHtmlAssertUnchanged,
  sanitizeHtmlToFragment,
  type CssSanitizer,
  type HtmlSanitizer,
} from './builders/html_sanitizer/html_sanitizer.js';
export {
  CssSanitizerBuilder,
  HtmlSanitizerBuilder,
} from './builders/html_sanitizer/html_sanitizer_builder.js';
export {
  UrlPolicyHintsType,
  // Legacy aliases for the ResourceUrlPolicy. All usages should be migrated to
  // the new names.
  // UrlPolicyHintsType as ResourceUrlPolicyHintsType,
  type UrlPolicy as ResourceUrlPolicy,
  type UrlPolicyHints as ResourceUrlPolicyHints,
  type UrlPolicy,
  type UrlPolicyHints,
} from './builders/html_sanitizer/url_policy.js';
export {
  appendParams,
  appendPathSegment,
  objectUrlFromScript,
  replaceFragment,
  replaceParams,
  toAbsoluteResourceUrl,
  trustedResourceUrl,
} from './builders/resource_url_builders.js';
export {
  concatScripts,
  safeScript,
  safeScriptWithArgs,
  valueAsScript,
} from './builders/script_builders.js';
export {
  concatStyleSheets,
  safeStyleSheet,
} from './builders/style_sheet_builders.js';
/** Types, constants and unwrappers */
export {
  SafeAttributePrefix,
  unwrapAttributePrefix,
} from './internals/attribute_impl.js';
export {
  EMPTY_HTML,
  SafeHtml,
  isHtml,
  unwrapHtml,
} from './internals/html_impl.js';
export {
  TrustedResourceUrl,
  isResourceUrl,
  unwrapResourceUrl,
} from './internals/resource_url_impl.js';
export {
  EMPTY_SCRIPT,
  SafeScript,
  isScript,
  unwrapScript,
} from './internals/script_impl.js';
export {
  SafeStyleSheet,
  isStyleSheet,
  unwrapStyleSheet,
} from './internals/style_sheet_impl.js';
