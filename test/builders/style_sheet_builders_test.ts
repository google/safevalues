/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {concatStyleSheets, safeStyleSheet} from './style_sheet_builders';


describe('style_sheet_builders', () => {
  describe('concatStyleSheets', () => {
    it('concatenates `SafeStyleSheet` values', () => {
      const style1 = safeStyleSheet`a { color: navy; }`;
      const style2 = safeStyleSheet`b { color: red; }`;
      expect(concatStyleSheets([style1, style2]).toString())
          .toEqual('a { color: navy; }b { color: red; }');
    });
  });
});
