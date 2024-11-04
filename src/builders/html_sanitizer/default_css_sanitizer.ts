/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview This file exports a default instance of the CSS sanitizer,
 * similarly to how the default instance of the HTML sanitizer is exported.
 *
 * The reason why it's in a separate file is to ensure that html_sanitizer.ts
 * doesn't depend on html_sanitizer_builder.ts, which would cause
 * a circular dependency.
 */

import {pure} from '../../internals/pure.js';
import {CssSanitizerBuilder} from './html_sanitizer_builder.js';
const defaultCssSanitizer = /* #__PURE__ */ pure(() =>
  new CssSanitizerBuilder().build(),
);
/**
 * Sanitizes untrusted CSS using the default sanitizer configuration.
 *
 */
export function sanitizeHtmlWithCss(css: string): DocumentFragment {
  return defaultCssSanitizer.sanitizeToFragment(css);
}
