/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import * as safeRange from '../../../src/dom/globals/range';
import {testonlyHtml} from '../../testing/conversions';

describe('safeRange', () => {
  describe('with TS safe types', () => {
    it('can create contextual fragment', () => {
      const html = testonlyHtml('<div id="test-html"></div>');
      const fragment =
          safeRange.createContextualFragment(document.createRange(), html);
      expect((fragment.childNodes[0] as HTMLElement).id).toEqual('test-html');
    });
  });
});
