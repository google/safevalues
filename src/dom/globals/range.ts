/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import {SafeHtml, unwrapHtml} from '../../internals/html_impl';

/** Safely creates a contextualFragment. */
export function createContextualFragment(
    range: Range, html: SafeHtml): DocumentFragment {
  return range.createContextualFragment(unwrapHtml(html) as string);
}
