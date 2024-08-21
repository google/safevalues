/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl} from '../../src/internals/resource_url_impl';

import {
  appendParams,
  appendPathSegment,
  objectUrlFromScript,
  replaceFragment,
  toAbsoluteResourceUrl,
  trustedResourceUrl,
} from '../../src/builders/resource_url_builders';
import {safeScript} from '../../src/builders/script_builders';

describe('resource_url_builders', () => {
  describe('trustedResourceUrl', () => {
    it('can create constants with no contraints', () => {
      expect(trustedResourceUrl`a/b/c`.toString()).toEqual('a/b/c');
      expect(trustedResourceUrl`about:blank`.toString()).toEqual('about:blank');
    });

    it('supports the right formats', () => {
      const foo = 'foo';
      expect(trustedResourceUrl`httpS://www.gOOgle.com/${foo}`.toString()).toBe(
        'httpS://www.gOOgle.com/foo',
      );
      // Scheme-relative.
      expect(trustedResourceUrl`//www.google.com/${foo}`.toString()).toBe(
        '//www.google.com/foo',
      );
      // Origin with hyphen and port.
      expect(
        trustedResourceUrl`//ww-w.google.com:1000/path/${foo}`.toString(),
      ).toBe('//ww-w.google.com:1000/path/foo');
      expect(trustedResourceUrl`//localhost:1000/path/${foo}`.toString()).toBe(
        '//localhost:1000/path/foo',
      );
      // Path-absolute.
      expect(trustedResourceUrl`/${foo}`.toString()).toBe('/foo');
      expect(trustedResourceUrl`/path/${foo}`.toString()).toBe('/path/foo');
      expect(trustedResourceUrl`/path#${foo}`.toString()).toBe('/path#foo');
      expect(trustedResourceUrl`/path?${foo}`.toString()).toBe('/path?foo');
      // Path-relative.
      expect(trustedResourceUrl`path/${foo}`.toString()).toBe('path/foo');
      expect(trustedResourceUrl`path/to/${foo}`.toString()).toBe('path/to/foo');
      // Mixed case.
      expect(
        trustedResourceUrl`httpS://www.google.cOm/pAth/${foo}`.toString(),
      ).toBe('httpS://www.google.cOm/pAth/foo');
      expect(trustedResourceUrl`about:blank#${foo}`.toString()).toBe(
        'about:blank#foo',
      );
      // Numeric and international domains.
      expect(trustedResourceUrl`https://9.xn--3ds443g/${foo}`.toString()).toBe(
        'https://9.xn--3ds443g/foo',
      );
    });

    it('rejects invalid formats', () => {
      const foo = 'foo';
      expect(() => {
        return trustedResourceUrl`ftp://${foo}`;
      }).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      // Missing origin.
      expect(() => {
        return trustedResourceUrl`https://${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedResourceUrl`https:///${foo}`; // NOTYPO
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedResourceUrl`//${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      expect(() => {
        return trustedResourceUrl`///${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Missing / after origin.
      expect(() => {
        return trustedResourceUrl`https://google.com${foo}`;
      }).toThrowError(/Can't interpolate data in a url's origin/);
      // Invalid char in origin.
      expect(() => {
        return trustedResourceUrl`https://www.google%.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return trustedResourceUrl`https://www.google\\.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return trustedResourceUrl`https://user:password@www.google.com/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      // Invalid port number.
      expect(() => {
        return trustedResourceUrl`//ww-w.google.com:1x00/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      expect(() => {
        return trustedResourceUrl`//ww-w.google.com:/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      expect(() => {
        return trustedResourceUrl`//ww-w.google.com::1000/path/${foo}`;
      }).toThrowError(/Invalid port number./);
      // IP addresses.
      expect(() => {
        return trustedResourceUrl`//[2001:db8::8a2e:370:7334]/${foo}`;
      }).toThrowError(/The origin contains unsupported characters./);
      expect(() => {
        return trustedResourceUrl`//127.0.0.1/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return trustedResourceUrl`//1.1/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return trustedResourceUrl`//1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return trustedResourceUrl`//0x1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return trustedResourceUrl`//1.0x1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => {
        return trustedResourceUrl`//127.0.0.1:1337/${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      // Constant origin bypass attempt
      const bypassAttempt = '/evil.com';
      expect(() => trustedResourceUrl`https:/${bypassAttempt}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      // Odd cases.
      expect(() => {
        return trustedResourceUrl`//./${foo}`;
      }).toThrowError(/The top-level domain must start with a letter./);
      expect(() => trustedResourceUrl`something:/${foo}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      expect(() => trustedResourceUrl`something:${foo}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      // Relative URL with a backslash in the first segment
      expect(() => trustedResourceUrl`abc\\def/${foo}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      // Relative URL with a space in the first segment
      expect(() => trustedResourceUrl` abc/${foo}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      // Two slashes. IE allowed (allows?) '\' instead of '/'.
      expect(() => {
        return trustedResourceUrl`/\\${foo}`;
      }).toThrowError(/The path start in the url is invalid./);
      // Relative path with interpolation in the first segment
      expect(() => trustedResourceUrl`abc${foo}`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      expect(() => trustedResourceUrl`${foo}bar`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      expect(() => trustedResourceUrl`${foo}bar/`).toThrowError(
        /Trying to interpolate expressions in an unsupported url format./,
      );
      expect(() => trustedResourceUrl`about:blankX${foo}`).toThrowError(
        /The about url is invalid./,
      );
    });

    it('calls encodeURIComponent on interpolated values', () => {
      const dir1 = 'd%/?#=';
      const dir2 = '2';
      expect(
        trustedResourceUrl`/path/${dir1}/${dir2}?n1=v1`.toString(),
      ).toEqual('/path/d%25%2F%3F%23%3D/2?n1=v1');
    });

    it('allows empty strings', () => {
      const arg1 = '';
      expect(
        trustedResourceUrl`https://www.google.com/path/${arg1}`.toString(),
      ).toEqual('https://www.google.com/path/');
    });

    it('can interpolate numbers and booleans', () => {
      const url = trustedResourceUrl`https://www.google.com/path?foo=${3}&bar=${true}`;
      expect(url.toString()).toEqual(
        'https://www.google.com/path?foo=3&bar=true',
      );
    });

    it('rejects embedded expressions with data URL', () => {
      const arg1 = 'foo';
      expect(() => {
        return trustedResourceUrl`data:text/html,<marquee>${arg1}</marquee>`;
      }).toThrowError(/Data URLs cannot have expressions/);
    });
  });

  describe('appendParams', () => {
    const urlWithoutSearch = trustedResourceUrl`https://google.com/`;
    const urlWithSearch = trustedResourceUrl`https://google.com/?abc`;
    const urlWithFragment = trustedResourceUrl`https://google.com/#foo`;
    const urlWithSearchAndFragment = trustedResourceUrl`https://google.com/?abc#foo`;

    it('appends simple cases as expected', () => {
      expect(
        appendParams(urlWithoutSearch, new Map([['x', 'y']])).toString(),
      ).toBe('https://google.com/?x=y');
      expect(
        appendParams(urlWithSearch, new Map([['x', 'y']])).toString(),
      ).toBe('https://google.com/?abc&x=y');
    });

    it('can be called with an array', () => {
      expect(appendParams(urlWithoutSearch, [['x', 'y']]).toString()).toBe(
        'https://google.com/?x=y',
      );
    });

    it('can be called with a URLSearchParams object', () => {
      const params = new URLSearchParams();
      params.set('x', 'y');
      expect(appendParams(urlWithoutSearch, params).toString()).toBe(
        'https://google.com/?x=y',
      );
    });

    it('alls encodeURIComponent on all param names and values', () => {
      expect(
        appendParams(urlWithoutSearch, new Map([['&x/', '&y/']])).toString(),
      ).toBe('https://google.com/?%26x%2F=%26y%2F');
      expect(
        appendParams(urlWithSearch, new Map([['&x/', '&y/']])).toString(),
      ).toBe('https://google.com/?abc&%26x%2F=%26y%2F');
    });

    it('supports urls with fragments', () => {
      expect(
        appendParams(urlWithFragment, new Map([['x', 'y']])).toString(),
      ).toBe('https://google.com/?x=y#foo');
      expect(
        appendParams(
          urlWithSearchAndFragment,
          new Map([['x', 'y']]),
        ).toString(),
      ).toBe('https://google.com/?abc&x=y#foo');
    });

    it('can interpolate params with multiple values', () => {
      const params1 = new Map<string, string | string[]>([
        ['fruit', ['apple', 'tomato']],
        ['non-fruit', 'potato'],
      ]);
      expect(appendParams(urlWithoutSearch, params1).toString()).toBe(
        'https://google.com/?fruit=apple&fruit=tomato&non-fruit=potato',
      );

      const params2 = new Map<string, string | string[]>([
        ['&', 'ampersand'],
        ['#', ['hash', 'mesh']],
      ]);
      expect(appendParams(urlWithoutSearch, params2).toString()).toBe(
        'https://google.com/?%26=ampersand&%23=hash&%23=mesh',
      );
    });
  });

  describe('replaceFragment', () => {
    it('appends when there is no existing fragment', () => {
      expect(
        replaceFragment(
          trustedResourceUrl`https://google.com/`,
          'def',
        ).toString(),
      ).toBe('https://google.com/#def');
    });

    it('overwrites an existing fragment', () => {
      expect(
        replaceFragment(
          trustedResourceUrl`https://google.com/#abc`,
          'def',
        ).toString(),
      ).toBe('https://google.com/#def');
    });

    it('removes fragment when passed an emtpy string', () => {
      expect(
        replaceFragment(
          trustedResourceUrl`https://google.com/#abc`,
          '',
        ).toString(),
      ).toBe('https://google.com/');
    });
  });

  describe('appendPathSegment', () => {
    it('appends with trailing slash', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com/`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test');
    });

    it('appends without trailing slash', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test');
    });

    it('encodes path before appending', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com/`,
          'test/path',
        ).toString(),
      ).toBe('https://google.com/test%2Fpath');
    });

    it('handles empty strings', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com?`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test?');

      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com#`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test#');
    });

    it('appends path while retaining param(s)', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com/?abc`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test?abc');
    });

    it('appends path while retaining fragment', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com/#xyz`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test#xyz');
    });

    it('appends path while retaining both param(s) and fragment', () => {
      expect(
        appendPathSegment(
          trustedResourceUrl`https://google.com/?abc#xyz`,
          'test',
        ).toString(),
      ).toBe('https://google.com/test?abc#xyz');
    });
  });

  describe('objectUrlFromScript', () => {
    it('wraps a blob url', () => {
      const url = objectUrlFromScript(safeScript`console.log('hello world');`);
      expect(url.toString().slice(0, 5)).toEqual('blob:');
    });

    it('returns the expected contents when fetched', async () => {
      const url = objectUrlFromScript(safeScript`console.log('hello world');`);
      const fetchedContent = await fetchScriptContent(url);
      expect(fetchedContent).toEqual(`console.log('hello world');`);
    });

    it('can be revoked using revokeObjectURL', async () => {
      const url = objectUrlFromScript(safeScript`console.log('hello world');`);
      URL.revokeObjectURL(url.toString());
      await expectAsync(fetchScriptContent(url)).toBeRejected();
    });
  });

  describe('toAbsoluteTrustedResourceUrl', () => {
    let oldBaseURI: PropertyDescriptor;
    beforeEach(() => {
      oldBaseURI = Object.getOwnPropertyDescriptor(Node.prototype, 'baseURI')!;
    });

    afterEach(() => {
      Object.defineProperty(Node.prototype, 'baseURI', oldBaseURI);
    });

    const tests = [
      // Positive transformations.  baseURI + trusted === expected
      {
        trusted: trustedResourceUrl``,
        baseURI: `https://www.google.com/`,
        expected: trustedResourceUrl`https://www.google.com/`,
      },
      {
        trusted: trustedResourceUrl`/`,
        baseURI: `https://www.google.com/`,
        expected: trustedResourceUrl`https://www.google.com/`,
      },
      {
        trusted: trustedResourceUrl`/foo/bar/baz?a=b#c`,
        baseURI: `https://localhost.corp.google.com:9443/`,
        expected: trustedResourceUrl`https://localhost.corp.google.com:9443/foo/bar/baz?a=b#c`,
      },
      {
        trusted: trustedResourceUrl`/after/base`,
        baseURI: `https://www.google.com/based`,
        expected: trustedResourceUrl`https://www.google.com/after/base`,
      },
      {
        trusted: trustedResourceUrl`//foo/bar/baz?a=b#c`,
        baseURI: `https://localhost.corp.google.com:9443/`,
        expected: trustedResourceUrl`https://foo/bar/baz?a=b#c`,
      },
      {
        trusted: trustedResourceUrl`foo/bar/baz?a=b#c`,
        baseURI: `https://www.google.com/based`,
        expected: trustedResourceUrl`https://www.google.com/foo/bar/baz?a=b#c`,
      },
      {
        trusted: trustedResourceUrl` foo/bar/baz?a=b#c`,
        baseURI: `https://www.google.com/based`,
        expected: trustedResourceUrl`https://www.google.com/foo/bar/baz?a=b#c`,
      },
      // Ignored.  Expected to be equal to the input.
      {
        trusted: trustedResourceUrl`https://google.com/`,
        baseURI: `https://www.google.com/based`,
      },
    ];
    for (const test of tests) {
      it(`appropriately prefixes the document base URI for ${test.trusted.toString()}`, () => {
        Object.defineProperty(Node.prototype, 'baseURI', {value: test.baseURI});
        expect(toAbsoluteResourceUrl(test.trusted)).toEqual(
          test.expected ?? test.trusted,
        );
      });
    }
  });
});

/**
 * Fetches asynchronously the content at `url` and returns a `Promise`.
 *
 * The content is fetched using the fetch API. If the browser does not support
 * the `fetch` API, it falls back to using XMLHttpRequest.
 */
async function fetchScriptContent(url: TrustedResourceUrl): Promise<string> {
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
