/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';

import {setBaseHref} from '../../../src/dom/elements/base';

describe('base API wrappers', () => {
  let baseEl: HTMLBaseElement;
  beforeEach(() => {
    baseEl = document.createElement('base');
  });

  it('setBaseHref sets `href` attribute as expected', () => {
    const url = trustedResourceUrl`http://google.com/some/path`;
    setBaseHref(baseEl, url);
    expect(baseEl.href).toBe('http://google.com/some/path');
  });
});
