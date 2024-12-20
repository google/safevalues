/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {testonlyScript} from '../../testing/conversions';

import {globalEval} from '../../../src/dom/globals/global';

describe('globalEval', () => {
  it('can eval simple expressions', () => {
    expect(globalEval(window, testonlyScript('1+2'))).toEqual(3);
  });

  it('evals expressions in the global scope', () => {
    globalEval(window, testonlyScript('var bar = 2;'));
    expect((globalThis as unknown as {bar: number})['bar']).toEqual(2);
  });
});
