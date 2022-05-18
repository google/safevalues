/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {fromBlob, safeUrl, SanitizableUrlScheme as Schemes, sanitizeUrl, Scheme, trySanitizeUrl} from '../../src/builders/url_builders';
import {INNOCUOUS_URL} from '../../src/internals/url_impl';
import {URL_TEST_VECTORS, URL_TEST_VECTORS_WITH_SCHEME} from '../testvectors/url_test_vectors';

describe('url_builders', () => {
  describe('trySanitizeUrl', () => {
    const goodUrl = 'https://google.com';

    it('works on basic examples', () => {
      const sanitizedUrl = trySanitizeUrl(goodUrl);
      expect(sanitizedUrl).toBeDefined();
      expect(sanitizedUrl!.toString()).toEqual(goodUrl);
    });

    it('works on basic examples with an explicit allowed scheme', () => {
      const sanitizedUrl = trySanitizeUrl(goodUrl, [Schemes.HTTPS]);
      expect(sanitizedUrl).toBeDefined();
      expect(sanitizedUrl!.toString()).toEqual(goodUrl);
    });

    it('sanitizes away a url with an unexpected scheme', () => {
      expect(trySanitizeUrl(goodUrl, [Schemes.TEL])).toBeUndefined();
    });

    it('sanitizes away javascript: schemes', () => {
      expect(trySanitizeUrl('javascript:evil()')).toBeUndefined();
    });
  });

  describe('sanitizeUrl', () => {
    it('works on basic examples', () => {
      const goodUrl = 'https://google.com';
      expect(sanitizeUrl(goodUrl).toString()).toEqual(goodUrl);
      expect(sanitizeUrl('javascript:evil()')).toEqual(INNOCUOUS_URL);
    });

    it('sanitizes URLs correctly', () => {
      for (const v of URL_TEST_VECTORS) {
        expect(sanitizeUrl(v.input).toString()).toEqual(v.expected);
      }
    });
  });

  describe('sanitizeUrl with explicit schemes', () => {
    const schemeNames = Object.keys(Schemes) as Array<keyof typeof Schemes>;
    function toSchemes(s: string): Scheme {
      for (const name of schemeNames) {
        if (name.toLowerCase() === s.toLowerCase()) {
          return Schemes[name];
        }
      }
      throw new Error(`Unknown scheme: ${s}`);
    }

    it('lets you specify what you want', () => {
      expect(sanitizeUrl('tel:+1234567890', [Schemes.TEL, Schemes.CALLTO])
                 .toString())
          .toEqual('tel:+1234567890');
      expect(sanitizeUrl('javascript:alert()', [
        Schemes.TEL, Schemes.CALLTO
      ])).toEqual(INNOCUOUS_URL);
      expect(sanitizeUrl('#anchor', [
        Schemes.TEL, Schemes.CALLTO
      ])).toEqual(INNOCUOUS_URL);
      expect(sanitizeUrl('//google.com/test/', [
        Schemes.TEL, Schemes.CALLTO
      ])).toEqual(INNOCUOUS_URL);
    });

    it('can sanitize extension resource urls', () => {
      expect(sanitizeUrl('chrome-extension://hello', [Schemes.EXTENSION])
                 .toString())
          .toEqual('chrome-extension://hello');
    });

    it('is not fooled by bad schemes', () => {
      expect(sanitizeUrl('javascript://', [{isValid: (_url: string) => true}]))
          .toEqual(INNOCUOUS_URL);
    });

    it('passes the test vectors', () => {
      for (const v of URL_TEST_VECTORS_WITH_SCHEME) {
        expect(sanitizeUrl(v.input, v.schemes.map(toSchemes)).toString())
            .toEqual(v.expected);
      }
    });

    it('is equivalent to sanitizeUrl for the sum of its conceptual parts',
       () => {
         const DEFAULT_SCHEMES = [
           Schemes.HTTP, Schemes.HTTPS, Schemes.FTP, Schemes.DATA,
           Schemes.MAILTO, Schemes.RELATIVE
         ];
         for (const {input, expected} of URL_TEST_VECTORS) {
           const sanitizedUrls =
               DEFAULT_SCHEMES.map(scheme => trySanitizeUrl(input, [scheme]));
           const successFullySanitized =
               sanitizedUrls.filter(url => url !== undefined);
           if (expected.startsWith('about:invalid')) {
             expect(successFullySanitized).toHaveSize(0);
           } else {
             expect(successFullySanitized).toHaveSize(1);
             expect(successFullySanitized.toString()).toBe(expected);
           }
         }
       });
  });

  describe('fromBlob', () => {
    function buildBlobWithType(type: string) {
      return fromBlob(new Blob(['test'], {type})).toString();
    }

    it('validates types as expected', () => {
      const badType = /unsafe blob MIME type/;
      const goodBlob = /blob:(?:https?:\/\/.+\/)?[\w\d\-]+/;

      expect(buildBlobWithType('image/jpg')).toMatch(goodBlob);
      expect(buildBlobWithType('image/png')).toMatch(goodBlob);
      expect(buildBlobWithType('image/heic')).toMatch(goodBlob);
      expect(buildBlobWithType('image/heif')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3')).toMatch(goodBlob);

      expect(buildBlobWithType('audio/mp3;foo=bar')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3;foo="bar"')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3;1="2";3=4')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3;1="2;3=4"')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3;1="2;3=";4=5')).toMatch(goodBlob);
      expect(buildBlobWithType('audio/mp3;1="2;";3=5')).toMatch(goodBlob);

      expect(() => buildBlobWithType('image/jpg x')).toThrowError(badType);
      expect(() => buildBlobWithType('x image/jpg')).toThrowError(badType);
      expect(() => buildBlobWithType('image/jpg;x')).toThrowError(badType);
      expect(() => buildBlobWithType('image/jpg;x=')).toThrowError(badType);
      expect(() => buildBlobWithType('image/jpg;x="')).toThrowError(badType);

      expect(() => buildBlobWithType('text/html')).toThrowError(badType);
      expect(() => buildBlobWithType('application/javascript'))
          .toThrowError(badType);
      expect(() => buildBlobWithType('text')).toThrowError(badType);
      expect(() => buildBlobWithType('')).toThrowError(badType);
      expect(() => buildBlobWithType('¯\\_(ツ)_/¯')).toThrowError(badType);
    });
  });

  describe('safeUrl', () => {
    it('allows interpolation when the url is relative', () => {
      expect(safeUrl`//${'origin'}/${'path'}`.toString()).toBe('//origin/path');
      expect(safeUrl`/${'path'}`.toString()).toBe('/path');
      expect(safeUrl`./${'pathComponent'}`.toString()).toBe('./pathComponent');
      expect(safeUrl`#${'fragment'}`.toString()).toBe('#fragment');
      expect(safeUrl`?${'query'}`.toString()).toBe('?query');
    });

    it('accepts the url if there is no marker and no interpolation', () => {
      expect(safeUrl`relative-url`.toString()).toBe('relative-url');
      expect(safeUrl``.toString()).toBe('');
    });

    it('allows interpolation when the url has an explicit scheme', () => {
      expect(safeUrl`http:${'something'}/`.toString()).toBe('http:something/');
      expect(safeUrl`about:n${'othing'}`.toString()).toBe('about:nothing');
      expect(safeUrl`unknown:th${'ing'}`.toString()).toBe('unknown:thing');
      expect(safeUrl`pop3://${'hi'}`.toString()).toBe('pop3://hi');
      expect(safeUrl`itms-apps:${'app'}`.toString()).toBe('itms-apps:app');
    });

    it('rejects interpolation when scheme is uncertain', () => {
      expect(() => safeUrl`jav${''}`).toThrowError();
      expect(() => safeUrl`htt${''}`).toThrowError();
      expect(() => safeUrl`${''}`).toThrowError();
    });

    it('rejects interpolation when scheme is invalid', () => {
      expect(() => safeUrl`javascript:alert(1)`).toThrowError();
      expect(() => safeUrl`javaScrIpt:${''}`).toThrowError();
      expect(() => safeUrl`http$:${''}`).toThrowError();
      expect(() => safeUrl`-:${''}`).toThrowError();
      expect(() => safeUrl`itms_apps:${''}`).toThrowError();
    });
    it('accepts to interpolate null and undefined variables', () => {
      expect(safeUrl`//${null}/${undefined}`.toString())
          .toBe('//null/undefined');
    });
    it('accepts to interpolate objects', () => {
      const customStringifier = {toString: () => 'hello'};
      expect(safeUrl`//${customStringifier}/`.toString()).toBe('//hello/');
    });
  });
});
