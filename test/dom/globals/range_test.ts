/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {testonlyHtml} from '../../testing/conversions';

import * as safeRange from '../../../src/dom/globals/range';

describe('safeRange', () => {
  describe('with TS safe types', () => {
    it('can create contextual fragment', () => {
      const html = testonlyHtml('<div id="test-html"></div>');
      const fragment = safeRange.createContextualFragment(
        document.createRange(),
        html,
      );
      expect((fragment.childNodes[0] as HTMLElement).id).toEqual('test-html');
    });
  });
});
