/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {htmlSafeByReview} from '../../src/restricted/reviewed';

describe('reviewed conversions', () => {
  it('require a justification', () => {
    expect(() => {
      htmlSafeByReview('aaa', null as unknown as {justification: string});
    }).toThrowError();

    expect(() => {
      htmlSafeByReview('aaa', {justification: '   '});
    }).toThrowError(/A justification must be provided/);

    expect(() => {
      htmlSafeByReview('aaa', {justification: undefined as unknown as string});
    }).toThrowError(/A justification must be provided/);

    expect(htmlSafeByReview('aaa', {
             justification: 'This is just a test'
           }).toString())
        .toEqual('aaa');
  });
});
