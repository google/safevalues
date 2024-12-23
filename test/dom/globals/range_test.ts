/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {testonlyHtml} from '../../testing/conversions';

import {rangeCreateContextualFragment} from '../../../src/dom/globals/range';

describe('rangeCreateContextualFragment', () => {
  it('can create contextual fragment', () => {
    const html = testonlyHtml('<div id="test-html"></div>');
    const fragment = rangeCreateContextualFragment(
      document.createRange(),
      html,
    );
    expect((fragment.childNodes[0] as HTMLElement).id).toEqual('test-html');
  });
});
