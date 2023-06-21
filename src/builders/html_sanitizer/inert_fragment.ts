/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createContextualFragment} from '../../dom/globals/range';
import {createHtmlInternal} from '../../internals/html_impl';

/**
 * Returns a fragment that contains the parsed HTML for `dirtyHtml` without
 * executing any of the potential payload.
 */
export function createInertFragment(dirtyHtml: string): DocumentFragment {
  // We create a new document to ensure the nodes stay detached
  const range = document.implementation.createHTMLDocument('').createRange();

  // This call is only used to create an inert tree for the sanitizer to
  // further process and is never returned directly to the caller. We can't use
  // a reviewed conversion in order to avoid an import loop.
  const temporarySafeHtml = createHtmlInternal(dirtyHtml);
  return createContextualFragment(range, temporarySafeHtml);
}