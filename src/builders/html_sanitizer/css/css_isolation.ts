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
 *
 * * `display:inline-block`, `clip-path:inset(0)` and `overflow:hidden` - ensure
 * that the sanitized content cannot cover other elements on the page.
 * * `vertical-align:top` - fixes a quirk when `overflow:hidden` is used on
 * inline elements and they are not aligned correctly. See
 * https://stackoverflow.com/questions/30182800/css-overflowhidden-with-displayinline-block
 * for details.
 * * `text-decoration:inherit` - ensures that the sanitized content inherits
 * the text decoration from the parent element, which is not the default for
 * `display:inline-block`. See
 * https://www.w3.org/TR/2022/CRD-css-text-decor-3-20220505/#:~:text=Note%20that%20text%20decorations%20are%20not%20propagated%20to%20any%20out%2Dof%2Dflow%20descendants%2C%20nor%20to%20the%20contents%20of%20atomic%20inline%2Dlevel%20descendants%20such%20as%20inline%20blocks
 * for details.
 */
export const CSS_ISOLATION_PROPERTIES =
  'display:inline-block;clip-path:inset(0);overflow:hidden;vertical-align:top;text-decoration:inherit';

/**
 * A stylesheet that isolates the sanitized content from the rest of the page.
 */
export const CSS_ISOLATION_STYLESHEET: ':host{display:inline-block;clip-path:inset(0);overflow:hidden;vertical-align:top;text-decoration:inherit}' = `:host{${CSS_ISOLATION_PROPERTIES}}`;
