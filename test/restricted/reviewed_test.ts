/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlSafeByReview} from '../../src/restricted/reviewed';

describe('reviewed conversions', () => {
  it('require a justification', () => {
    expect(() => {
      htmlSafeByReview('aaa', null as unknown as string);
    }).toThrowError(/A justification must be provided/);

    expect(() => {
      htmlSafeByReview('aaa', '   ');
    }).toThrowError(/A justification must be provided/);

    expect(htmlSafeByReview('aaa', 'This is just a test').toString())
        .toEqual('aaa');
  });
});
