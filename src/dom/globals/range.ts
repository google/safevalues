/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl.js';

/** Safely creates a contextualFragment. */
export function rangeCreateContextualFragment(
  range: Range,
  html: SafeHtml,
): DocumentFragment {
  return range.createContextualFragment(unwrapHtml(html) as string);
}
