/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeGlobal from '../../../src/dom/globals/global';
import {testonlyScript} from '../../conversions';

describe('safeGlobal', () => {
  describe('with TS safe types', () => {
    it('can eval simple expressions', () => {
      expect(safeGlobal.globalEval(window, testonlyScript('1+2'))).toEqual(3);
    });

    it('evals expressions in the global scope', () => {
      safeGlobal.globalEval(window, testonlyScript('var bar = 2;'));
      expect((globalThis as unknown as {bar: number})['bar']).toEqual(2);
    });
  });
});
