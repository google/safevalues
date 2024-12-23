/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {rangeCreateContextualFragment} from '../../dom/globals/range.js';
import '../../environment/dev.js';
import {createHtmlInternal} from '../../internals/html_impl.js';

/**
 * Returns a fragment that contains the parsed HTML for `dirtyHtml` without
 * executing any of the potential payload.
 */
export function createInertFragment(
  dirtyHtml: string,
  inertDocument: Document,
): DocumentFragment {
  if (process.env.NODE_ENV !== 'production') {
    // We are checking if the function was accidentally called with non-inert
    // document. One observable difference between live and inert documents
    // is that live document has a `defaultView` equal to `window`, while
    // inert document has a `defaultView` equal to `null`.
    if (inertDocument.defaultView) {
      throw new Error('createInertFragment called with non-inert document');
    }
  }
  const range = inertDocument.createRange();
  range.selectNode(inertDocument.body);

  // This call is only used to create an inert tree for the sanitizer to
  // further process and is never returned directly to the caller. We can't use
  // a reviewed conversion in order to avoid an import loop.
  const temporarySafeHtml = createHtmlInternal(dirtyHtml);
  return rangeCreateContextualFragment(range, temporarySafeHtml);
}
