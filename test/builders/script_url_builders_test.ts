/*
 * @license
 * Copyright 2021 Google LLC

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

import {script} from '../../src/builders/script_builders';
import {appendParams, blobUrlFromScript, scriptUrl} from '../../src/builders/script_url_builders';

describe('script_url_builders', () => {
  describe('scriptUrl', () => {
    it('can create constants with no contraints', () => {
      expect(scriptUrl`a/b/c`.toString()).toEqual('a/b/c');
      expect(scriptUrl`about:blank`.toString()).toEqual('about:blank');
    });

    it('supports the right formats', () => {
      const foo = 'foo';
      expect(scriptUrl`httpS://www.gOOgle.com/${foo}`.toString())
          .toBe('httpS://www.gOOgle.com/foo');
      // Scheme-relative.
      expect(scriptUrl`//www.google.com/${foo}`.toString())
          .toBe('//www.google.com/foo');
      // Origin with hyphen and port.
      expect(scriptUrl`//ww-w.google.com:1000/path/${foo}`.toString())
          .toBe('//ww-w.google.com:1000/path/foo');
      expect(scriptUrl`//localhost:1000/path/${foo}`.toString())
          .toBe('//localhost:1000/path/foo');
      // Path-absolute.
      expect(scriptUrl`/${foo}`.toString()).toBe('/foo');
      expect(scriptUrl`/path/${foo}`.toString()).toBe('/path/foo');
      expect(scriptUrl`/path#${foo}`.toString()).toBe('/path#foo');
      expect(scriptUrl`/path?${foo}`.toString()).toBe('/path?foo');
      // Mixed case.
      expect(scriptUrl`httpS://www.google.cOm/pAth/${foo}`.toString())
          .toBe('httpS://www.google.cOm/pAth/foo');
      expect(scriptUrl`about:blank#${foo}`.toString()).toBe('about:blank#foo');
      // Numeric and international domains.
      expect(scriptUrl`https://9.xn--3ds443g/${foo}`.toString())
          .toBe('https://9.xn--3ds443g/foo');
    });

    it('rejects invalid formats', () => {
      const foo = 'foo';
      expect(() => {
        return scriptUrl`ftp://${foo}`;
      })
          .toThrowError(
              /Trying to interpolate expressions in an unsupported url format./);
      // Missing origin.
      expect(() => {
        return scriptUrl`https://${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return scriptUrl`https:///${foo}`;  // NOTYPO
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return scriptUrl`//${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return scriptUrl`///${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Missing / after origin.
      expect(() => {
        return scriptUrl`https://google.com${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Invalid char in origin.
      expect(() => {
        return scriptUrl`https://www.google%.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return scriptUrl`https://www.google\\.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return scriptUrl`https://user:password@www.google.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      // Invalid port number.
      expect(() => {
        return scriptUrl`//ww-w.google.com:1x00/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      expect(() => {
        return scriptUrl`//ww-w.google.com:/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      expect(() => {
        return scriptUrl`//ww-w.google.com::1000/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      // IP addresses.
      expect(() => {
        return scriptUrl`//[2001:db8::8a2e:370:7334]/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return scriptUrl`//127.0.0.1/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return scriptUrl`//1.1/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return scriptUrl`//1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return scriptUrl`//0x1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return scriptUrl`//1.0x1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return scriptUrl`//127.0.0.1:1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      // Odd cases.
      expect(() => {
        return scriptUrl`//./${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      // Two slashes. IE allowed (allows?) '\' instead of '/'.
      expect(() => {
        return scriptUrl`/\\${foo}`;
      }).toThrowError(/The path start in the url is invalid./);
      // Relative path.
      expect(() => {
        return scriptUrl`abc${foo}`;
      })
          .toThrowError(
              /Trying to interpolate expressions in an unsupported url format./);
      expect(() => {
        return scriptUrl`about:blankX${foo}`;
      }).toThrowError(/The about url is invalid./);
    });

    it('calls encodeURIComponent on interpolated values', () => {
      const dir1 = 'd%/?#=';
      const dir2 = '2';
      expect(scriptUrl`/path/${dir1}/${dir2}?n1=v1`.toString())
          .toEqual('/path/d%25%2F%3F%23%3D/2?n1=v1');
    });

    it('allows empty strings', () => {
      const arg1 = '';
      expect(scriptUrl`https://www.google.com/path/${arg1}`.toString())
          .toEqual('https://www.google.com/path/');
    });

    it('can interpolate numbers and booleans', () => {
      const url = scriptUrl`https://www.google.com/path?foo=${3}&bar=${true}`;
      expect(url.toString())
          .toEqual('https://www.google.com/path?foo=3&bar=true');
    });

    it('rejects embedded expressions with data URL', () => {
      const arg1 = 'foo';
      expect(() => {
        return scriptUrl`data:text/html,<marquee>${arg1}</marquee>`;
      }).toThrowError(/Data URLs cannot have expressions/);
    });
  });

  describe('appendParams', () => {
    const urlWithoutSearch = scriptUrl`https://google.com/`;
    const urlWithSearch = scriptUrl`https://google.com/?abc`;

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
            scriptUrl`https://google.com/#`, new Map([['&x/', '&y/']]));
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
      const url = blobUrlFromScript(script`console.log('hello world');`);
      expect(url.toString().slice(0, 5)).toEqual('blob:');
    });

    it('returns the expected contents when fetched', async () => {
      const url = blobUrlFromScript(script`console.log('hello world');`);
      const fetchedContent = await fetchScriptContent(url);
      expect(fetchedContent).toEqual(`console.log('hello world');`);
    });

    it('can be revoked using revokeObjectURL', async () => {
      const url = blobUrlFromScript(script`console.log('hello world');`);
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
