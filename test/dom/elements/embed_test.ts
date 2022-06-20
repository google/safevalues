/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';
import * as safeEmbedEl from '../../../src/dom/elements/embed';

describe('safeEmbedEl', () => {
  let embedEl: HTMLEmbedElement;
  beforeEach(() => {
    embedEl = document.createElement('embed');
  });

  it('sets `src` attribute as expected', () => {
    const url = trustedResourceUrl`https://google.com/content`;
    safeEmbedEl.setSrc(embedEl, url);
    expect(embedEl.src).toBe('https://google.com/content');
  });
});
