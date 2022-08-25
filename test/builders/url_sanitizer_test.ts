/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as urls from '../../src/builders/url_sanitizer';
import {URL_TEST_VECTORS as JAVASCRIPT_URL_TEST_VECTORS} from '../testvectors/javascript_url_sanitizer_test_vectors';
import {URL_TEST_VECTORS} from '../testvectors/url_test_vectors';

describe('url_sanitizer', () => {
  describe('sanitizeJavascriptUrl', () => {
    for (const v of JAVASCRIPT_URL_TEST_VECTORS) {
      it(`sanitizes javascript: URLs correctly`, () => {
        if (v.expected === 'about:invalid#zClosurez') {
          expect(urls.sanitizeJavascriptUrl(v.input)).toEqual(undefined);
        } else {
          expect(urls.sanitizeJavascriptUrl(v.input)).toEqual(v.expected);
        }
      });
    }
  });

  describe('restrictivelySanitizeUrl', () => {
    for (const v of URL_TEST_VECTORS) {
      it(`sanitizes URLs correctly`, () => {
        expect(urls.restrictivelySanitizeUrl(v.input)).toEqual(v.expected);
      });
    }
  });
});
