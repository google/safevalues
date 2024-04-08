/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {ensureTokenIsValid, secretToken} from '../../src/internals/secrets';

describe('ensureTokenIsValid', () => {
  it('accepts the secret token', () => {
    expect(() => void ensureTokenIsValid(secretToken)).not.toThrowError();
  });

  it('throws for any other object', () => {
    expect(() => void ensureTokenIsValid({})).toThrowError();
  });
});
