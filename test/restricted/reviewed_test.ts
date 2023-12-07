/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlSafeByReview} from '../../src/restricted/reviewed';

describe('reviewed conversions', () => {
  it('require a justification', () => {
    expect(() => {
      htmlSafeByReview('aaa', {justification: null as unknown as string});
    }).toThrowError(/A justification must be provided/);

    expect(() => {
      htmlSafeByReview('aaa', {justification: '   '});
    }).toThrowError(/A justification must be provided/);

    expect(
      htmlSafeByReview('aaa', {
        justification: 'This is just a test',
      }).toString(),
    ).toEqual('aaa');
  });
});
