/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {restrictivelySanitizeUrl, sanitizeJavaScriptUrl,} from '../../src/builders/url_builders';
import {URL_TEST_VECTORS as JAVASCRIPT_URL_TEST_VECTORS} from '../testing/testvectors/javascript_url_sanitizer_test_vectors';
import {URL_TEST_VECTORS} from '../testing/testvectors/url_test_vectors';

describe('url_sanitizer', () => {
  describe('sanitizeJavaScriptUrl', () => {
    for (const v of JAVASCRIPT_URL_TEST_VECTORS) {
      it(`sanitizes javascript: URLs correctly`, () => {
        if (v.expected === 'about:invalid#zClosurez') {
          expect(sanitizeJavaScriptUrl(v.input)).toEqual(undefined);
        } else {
          expect(sanitizeJavaScriptUrl(v.input)).toEqual(v.expected);
        }
      });
    }
  });

  describe('restrictivelySanitizeUrl', () => {
    for (const v of URL_TEST_VECTORS) {
      it(`sanitizes URLs correctly`, () => {
        expect(restrictivelySanitizeUrl(v.input)).toEqual(v.expected);
      });
    }
  });
});
