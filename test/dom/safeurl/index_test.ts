/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {URL_TEST_VECTORS} from '../../testvectors/javascript_url_sanitizer_test_vectors';

import {INNOCUOUS_URL, sanitizeJavascriptUrl} from './index';

describe('safeurl', () => {
  describe('sanitizeJavascriptUrl', () => {
    for (const v of URL_TEST_VECTORS) {
      it(`sanitizes javascript: URLs correctly`, () => {
        expect(sanitizeJavascriptUrl(v.input))
            .toEqual(replaceLegacyInnocuousUrlValue(v.expected));
      });
    }
  });
});

function replaceLegacyInnocuousUrlValue(currentValue: string): string {
  // TODO(gweg): make the innoucous URL value customizable with a template param
  return currentValue === 'about:invalid#zClosurez' ? INNOCUOUS_URL :
                                                      currentValue;
}