/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';
import * as safeBaseEl from '../../../src/dom/elements/base';

describe('safeBaseEl', () => {
  let baseEl: HTMLBaseElement;
  beforeEach(() => {
    baseEl = document.createElement('base');
  });

  it('sets `href` attribute as expected', () => {
    const url = trustedResourceUrl`http://google.com/some/path`;
    safeBaseEl.setHref(baseEl, url);
    expect(baseEl.href).toBe('http://google.com/some/path');
  });
});
