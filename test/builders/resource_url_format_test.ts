/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {validateResourceUrlPrefix} from '../../src/builders/resource_url_format';

describe('validateResourceUrlPrefix', () => {
  it('returns undefined for valid prefixes', () => {
    expect(validateResourceUrlPrefix('https://example.com/')).toBeUndefined();
    expect(validateResourceUrlPrefix('//example.com:8080/')).toBeUndefined();
    expect(validateResourceUrlPrefix('/')).toBeUndefined();
    expect(validateResourceUrlPrefix('/path/')).toBeUndefined();
    expect(validateResourceUrlPrefix('path/')).toBeUndefined();
    expect(validateResourceUrlPrefix('about:blank')).toBeUndefined();
    expect(validateResourceUrlPrefix('about:blank#')).toBeUndefined();
  });

  it('returns an error message for invalid prefixes', () => {
    expect(validateResourceUrlPrefix('')).toMatch(
      /Trying to interpolate expressions in an unsupported url format\./,
    );
    expect(validateResourceUrlPrefix('data:text/javascript,')).toBe(
      'Data URLs cannot have expressions in the template literal input.',
    );
    expect(validateResourceUrlPrefix('https://example.com')).toMatch(
      /Can't interpolate data in a url's origin/,
    );
    expect(validateResourceUrlPrefix('/\\')).toBe(
      'The path start in the url is invalid.',
    );
    expect(validateResourceUrlPrefix('about:blankX')).toBe(
      'The about url is invalid.',
    );
  });
});
