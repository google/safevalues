/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {INNOCUOUS_URL, sanitizeJavascriptUrl} from '../../src/builders/url_sanitizer';
import {URL_TEST_VECTORS} from '../testvectors/javascript_url_sanitizer_test_vectors';

describe('url_sanitizer', () => {
  describe('sanitizeJavascriptUrl', () => {
    for (const v of URL_TEST_VECTORS) {
      it(`sanitizes javascript: URLs correctly`, () => {
        // TODO(gweg): also test that the sanitization silently return an
        // INNOCUOUS_URL when run in non process.env.NODE_ENV !== 'production'.
        if (v.expected === 'about:invalid#zClosurez') {
          expect(() => sanitizeJavascriptUrl(v.input))
              .toThrowError(
                  /was sanitized away[.] javascript: URLs can lead to XSS and is a CSP rollout blocker[.]/);
        } else {
          expect(sanitizeJavascriptUrl(v.input))
              .toEqual(replaceLegacyInnocuousUrlValue(v.expected));
        }
      });
    }
  });
});

function replaceLegacyInnocuousUrlValue(currentValue: string): string {
  return currentValue === 'about:invalid#zClosurez' ? INNOCUOUS_URL :
                                                      currentValue;
}