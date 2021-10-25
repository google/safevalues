/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlFromStringKnownToSatisfyTypeContract} from '../../src/restricted/reviewed';

describe('reviewed conversions', () => {
  it('require a justification', () => {
    expect(() => {
      htmlFromStringKnownToSatisfyTypeContract(
          'aaa', null as unknown as string);
    }).toThrowError(/A justification must be provided/);

    expect(() => {
      htmlFromStringKnownToSatisfyTypeContract('aaa', '   ');
    }).toThrowError(/A justification must be provided/);

    expect(
        htmlFromStringKnownToSatisfyTypeContract('aaa', 'This is just a test')
            .toString())
        .toEqual('aaa');
  });
});
