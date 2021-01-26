/*
 * @license
 * Copyright 2020 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {trustedScript} from '../../src/builders/trusted_script_builders';
import {appendParams, blobUrlFromScript, trustedScriptURL} from '../../src/builders/trusted_script_url_builders';

describe('trusted_script_url_builders', () => {
  describe('trustedScriptURL', () => {
    it('can create constants with no contraints', () => {
      expect(trustedScriptURL`a/b/c`.toString()).toEqual('a/b/c');
      expect(trustedScriptURL`about:blank`.toString()).toEqual('about:blank');
    });

    it('supports the right formats', () => {
      const foo = 'foo';
      expect(trustedScriptURL`httpS://www.gOOgle.com/${foo}`.toString())
          .toBe('httpS://www.gOOgle.com/foo');
      // Scheme-relative.
      expect(trustedScriptURL`//www.google.com/${foo}`.toString())
          .toBe('//www.google.com/foo');
      // Origin with hyphen and port.
      expect(trustedScriptURL`//ww-w.google.com:1000/path/${foo}`.toString())
          .toBe('//ww-w.google.com:1000/path/foo');
      // Path-absolute.
      expect(trustedScriptURL`/${foo}`.toString()).toBe('/foo');
      expect(trustedScriptURL`/path/${foo}`.toString()).toBe('/path/foo');
      expect(trustedScriptURL`/path#${foo}`.toString()).toBe('/path#foo');
      expect(trustedScriptURL`/path?${foo}`.toString()).toBe('/path?foo');
      // Mixed case.
      expect(trustedScriptURL`httpS://www.google.cOm/pAth/${foo}`.toString())
          .toBe('httpS://www.google.cOm/pAth/foo');
      expect(trustedScriptURL`about:blank#${foo}`.toString())
          .toBe('about:blank#foo');
    });

    it('rejects invalid formats', () => {
      const foo = 'foo';
      expect(() => {
        return trustedScriptURL`ftp://${foo}`;
      })
          .toThrowError(
              /Trying to interpolate expressions in an unsupported url format./);
      // Missing origin.
      expect(() => {
        return trustedScriptURL`https://${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedScriptURL`https:///${foo}`;  // NOTYPO
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedScriptURL`//${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedScriptURL`///${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Missing / after origin.
      expect(() => {
        return trustedScriptURL`https://google.com${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Invalid char in origin.
      expect(() => {
        return trustedScriptURL`https://www.google%.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return trustedScriptURL`https://www.google\\.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return trustedScriptURL`https://user:password@www.google.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      // Two slashes. IE allowed (allows?) '\' instead of '/'.
      expect(() => {
        return trustedScriptURL`/\\${foo}`;
      }).toThrowError(/The path start in the url is invalid./);
      // Relative path.
      expect(() => {
        return trustedScriptURL`abc${foo}`;
      })
          .toThrowError(
              /Trying to interpolate expressions in an unsupported url format./);
      expect(() => {
        return trustedScriptURL`about:blankX${foo}`;
      }).toThrowError(/The about url is invalid./);
    });

    it('calls encodeURIComponent on interpolated values', () => {
      const dir1 = 'd%/?#=';
      const dir2 = '2';
      expect(trustedScriptURL`/path/${dir1}/${dir2}?n1=v1`.toString())
          .toEqual('/path/d%25%2F%3F%23%3D/2?n1=v1');
    });

    it('allows empty strings', () => {
      const arg1 = '';
      expect(trustedScriptURL`https://www.google.com/path/${arg1}`.toString())
          .toEqual('https://www.google.com/path/');
    });

    it('can interpolate numbers and booleans', () => {
      const url =
          trustedScriptURL`https://www.google.com/path?foo=${3}&bar=${true}`;
      expect(url.toString())
          .toEqual('https://www.google.com/path?foo=3&bar=true');
    });

    it('rejects embedded expressions with data URL', () => {
      const arg1 = 'foo';
      expect(() => {
        return trustedScriptURL`data:text/html,<marquee>${arg1}</marquee>`;
      }).toThrowError(/Data URLs cannot have expressions/);
    });
  });

  describe('appendParams', () => {
    const urlWithoutSearch = trustedScriptURL`https://google.com/`;
    const urlWithSearch = trustedScriptURL`https://google.com/?abc`;

    it('appends simple cases as expected', () => {
      expect(appendParams(urlWithoutSearch, new Map([['x', 'y']])).toString())
          .toBe('https://google.com/?x=y');
      expect(appendParams(urlWithSearch, new Map([['x', 'y']])).toString())
          .toBe('https://google.com/?abc&x=y');
    });

    it('alls encodeURIComponent on all param names and values', () => {
      expect(
          appendParams(urlWithoutSearch, new Map([['&x/', '&y/']])).toString())
          .toBe('https://google.com/?%26x%2F=%26y%2F');
      expect(appendParams(urlWithSearch, new Map([['&x/', '&y/']])).toString())
          .toBe('https://google.com/?abc&%26x%2F=%26y%2F');
    });

    it('does not support urls with fragments', () => {
      expect(() => {
        appendParams(
            trustedScriptURL`https://google.com/#`,
            new Map([['&x/', '&y/']]));
      }).toThrowError(/Found a hash/);
    });

    it('can interpolate params with multiple values', () => {
      const params1 = new Map<string, string|string[]>([
        ['fruit', ['apple', 'tomato']],
        ['non-fruit', 'potato'],
      ]);
      expect(appendParams(urlWithoutSearch, params1).toString())
          .toBe(
              'https://google.com/?fruit=apple&fruit=tomato&non-fruit=potato');

      const params2 = new Map<string, string|string[]>([
        ['&', 'ampersand'],
        ['#', ['hash', 'mesh']],
      ]);
      expect(appendParams(urlWithoutSearch, params2).toString())
          .toBe('https://google.com/?%26=ampersand&%23=hash&%23=mesh');
    });
  });

  describe('blobUrlFromScript', () => {
    it('wraps a blob url', () => {
      const url = blobUrlFromScript(trustedScript`console.log('hello world');`);
      expect(url.toString().slice(0, 5)).toEqual('blob:');
    });

    it('returns the expected contents when fetched', async () => {
      const url = blobUrlFromScript(trustedScript`console.log('hello world');`);
      const fetchedContent = await fetchScriptContent(url);
      expect(fetchedContent).toEqual(`console.log('hello world');`);
    });

    it('can be revoked using revokeObjectURL', async () => {
      const url = blobUrlFromScript(trustedScript`console.log('hello world');`);
      URL.revokeObjectURL(url.toString());
      await expectAsync(fetchScriptContent(url)).toBeRejected();
    });
  });
});

/**
 * Fetches asynchronously the content at `url` and returns a `Promise`.
 *
 * The content is fetched using the fetch API. If the browser does not support
 * the `fetch` API, it falls back to using XMLHttpRequest.
 */
async function fetchScriptContent(url: TrustedScriptURL): Promise<string> {
  if (typeof fetch !== 'undefined') {
    const response = await fetch(url.toString());
    return response.text();
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url.toString());
    xhr.send(null);

    return new Promise((resolve, reject) => {
      xhr.onerror = reject;
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject();
        }
      };
    });
  }
}
