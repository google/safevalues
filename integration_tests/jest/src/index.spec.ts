/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {foo} from './index';

describe('#Foo', () => {
  it('Bar', () => {
    expect(foo().toString()).toEqual('');
  });
});
