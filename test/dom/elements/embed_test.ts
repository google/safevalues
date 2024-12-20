/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';

import {setEmbedSrc} from '../../../src/dom/elements/embed';

describe('embed API wrappers', () => {
  let embedEl: HTMLEmbedElement;
  beforeEach(() => {
    embedEl = document.createElement('embed');
  });

  it('sets `src` attribute as expected', () => {
    const url = trustedResourceUrl`https://google.com/content`;
    setEmbedSrc(embedEl, url);
    expect(embedEl.src).toBe('https://google.com/content');
  });
});
