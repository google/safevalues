/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Exports a stylesheet that isolates the sanitized content from
 * the rest of the page.
 *
 * One of the design goals of the CSS sanitizer is to ensure that the sanitized
 * content cannot affect the rest of the page. For example, the sanitized
 * content should not be able to cover other elements on the page, or to show up
 * outside of the sanitized container.
 *
 * This file exports a stylesheet that makes this design goal a reality. Check
 * out css_isolation_test.ts to see specific examples of what this stylesheet
 * attempts to prevent.
 */

/**
 * A set of CSS properties that isolate the sanitized content from the rest of
 * the page.
 */
export const CSS_ISOLATION_PROPERTIES =
  'display:block;clip-path:inset(0);overflow:hidden';

/**
 * A stylesheet that isolates the sanitized content from the rest of the page.
 */
export const CSS_ISOLATION_STYLESHEET = `:host{${CSS_ISOLATION_PROPERTIES}}`;
