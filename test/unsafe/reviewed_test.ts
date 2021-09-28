/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlFromStringKnownToSatisfyTypeContract} from '../../src/unsafe/reviewed';

describe('unchecked conversions', () => {
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
