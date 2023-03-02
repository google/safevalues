/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {createResourceUrl, TrustedResourceUrl, unwrapResourceUrl} from '../internals/resource_url_impl';
import {SafeScript, unwrapScript} from '../internals/script_impl';
import {assertIsTemplateObject} from '../internals/string_literal';

/** Type that we know how to interpolate */
type Primitive = string|number|boolean;

/**
 * Check whether the base url contains a valid origin,
 *
 * A string for an origin must contain only alphanumeric or any of the
 * following: `-.:`, and must not be an IP address. Remember that, as per the
 * documentation for TrustedResourceUrl, the origin must be trustworthy.
 *
 * @param base The base url that contains an origin.
 */
function hasValidOrigin(base: string): boolean {
  if (!(/^https:\/\//.test(base) || /^\/\//.test(base))) {
    return false;
  }

  const originStart = base.indexOf('//') + 2;
  const originEnd = base.indexOf('/', originStart);
  // If the base url only contains the prefix (e.g. //), or the slash
  // for the origin is right after the prefix (e.g. ///), the origin is
  // missing.
  if (originEnd <= originStart) {
    throw new Error(
        `Can't interpolate data in a url's origin, ` +
        `Please make sure to fully specify the origin, terminated with '/'.`);
  }

  const origin = base.substring(originStart, originEnd);
  if (!/^[0-9a-z.:-]+$/i.test(origin)) {
    throw new Error('The origin contains unsupported characters.');
  }
  if (!/^[^:]*(:[0-9]+)?$/i.test(origin)) {
    throw new Error('Invalid port number.');
  }
  if (!/(^|\.)[a-z][^.]*$/i.test(origin)) {
    throw new Error('The top-level domain must start with a letter.');
  }
  return true;
}

/**
 * Check whether the base url contains a valid about url at its beginning.
 *
 * An about url is either exactly 'about:blank' or 'about:blank#<str>' where
 * <str> can be an arbitrary string.
 *
 * @param base The base url.
 */
function isValidAboutUrl(base: string): boolean {
  if (!/^about:blank/.test(base)) {
    return false;
  }
  if (base !== 'about:blank' && !/^about:blank#/.test(base)) {
    throw new Error('The about url is invalid.');
  }
  return true;
}

/**
 * Check whether the base url contains a valid path start at its beginning.
 *
 * A valid path start is either a '/' or a '/' followed by at least one
 * character that is not '/' or '\'.
 *
 * @param base The base url.
 */
function isValidPathStart(base: string): boolean {
  if (!/^\//.test(base)) {
    return false;
  }
  if ((base === '/') ||
      (base.length > 1 && base[1] !== '/' && base[1] !== '\\')) {
    return true;
  }
  throw new Error('The path start in the url is invalid.');
}

/**
 * Builds TrustedResourceUrl from a template literal.
 *
 * This factory is a template literal tag function. It should be called with
 * a template literal, with or without embedded expressions. For example,
 *               trustedResourceUrl`//example.com/${bar}`;
 * or
 *               trustedResourceUrl`//example.com`;
 *
 * When this function is called with a template literal without any embedded
 * expressions, the template string may contain anything as the whole URL is
 * a compile-time string constant.
 *
 * When this function is called with a template literal that contains embedded
 * expressions, the template must start with one of the following:
 * - `https://<origin>/`
 * - `//<origin>/`
 * - `/<pathStart>`
 * - `about:blank`
 * - `data:`
 *
 * `<origin>` must contain only alphanumeric or any of the following: `-.:`.
 * Remember that, as per the documentation for TrustedResourceUrl, the origin
 * must be trustworthy. An origin of "example.com" could be set with this
 * method, but would tie the security of your site to the security of
 * example.com. Similarly, formats that potentially cover redirects hosted
 * on a trusted origin are problematic, since that could lead to untrusted
 * origins.
 *
 * `<pathStart>` is either an empty string, or a non empty string that does not
 * start with '/' or '\'.
 * In other words, `/<pathStart>` is either a '/' or a
 * '/' followed by at least one character that is not '/' or '\'.
 *
 * `data:` (data URL) does not allow embedded expressions in the template
 * literal input.
 *
 * All embedded expressions are URL encoded when they are interpolated. Do not
 * embed expressions that are already URL encoded as they will be double encoded
 * by the builder.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param rest This represents the template's embedded expressions.
 */
export function trustedResourceUrl(
    templateObj: TemplateStringsArray,
    ...rest: Primitive[]): TrustedResourceUrl {
  // Check if templateObj is actually from a template literal.
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(
        templateObj, true,
        'trustedResourceUrl is a template literal tag function and ' +
            'can only be called as such (e.g. trustedResourceUrl`/somepath.js`)');
  }

  if (rest.length === 0) {
    return createResourceUrl(templateObj[0]);
  }

  const base = templateObj[0].toLowerCase();

  if (process.env.NODE_ENV !== 'production') {
    if (/^data:/.test(base)) {
      throw new Error(
          'Data URLs cannot have expressions in the template literal input.');
    }

    if (!hasValidOrigin(base) && !isValidPathStart(base) &&
        !isValidAboutUrl(base)) {
      throw new Error(
          'Trying to interpolate expressions in an unsupported url format.');
    }
  }

  const urlParts = [templateObj[0]];
  for (let i = 0; i < rest.length; i++) {
    urlParts.push(encodeURIComponent(rest[i]));
    urlParts.push(templateObj[i + 1]);
  }
  return createResourceUrl(urlParts.join(''));
}

/**
 * Creates a new TrustedResourceUrl with params added to the URL's search
 * parameters.
 *
 * @param params What to add to the URL. Parameters with value `null` or
 * `undefined` are skipped. Both keys and values will be encoded. Do not pass
 * pre-encoded values as this will result them being double encoded. If the
 * value is an array then the same parameter is added for every element in the
 * array.
 */
export function appendParams(
    trustedUrl: TrustedResourceUrl,
    params: Map<string, Primitive|null|Array<Primitive|null>>):
    TrustedResourceUrl {
  let url = unwrapResourceUrl(trustedUrl).toString();
  if (/#/.test(url)) {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = `Found a hash in url (${url}), appending not supported`;
    }
    throw new Error(message);
  }
  let separator = /\?/.test(url) ? '&' : '?';
  // for-of has a big polyfill.
  // tslint:disable-next-line:ban-iterable-foreach
  params.forEach((value: Primitive|null|Array<Primitive|null>, key: string) => {
    const values = (value instanceof Array) ? value : [value];
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v === null || v === undefined) {
        continue;
      }
      url += separator + encodeURIComponent(key) + '=' +
          encodeURIComponent(String(v));
      separator = '&';
    }
  });
  return createResourceUrl(url);
}

const BEFORE_FRAGMENT_REGEXP = /[^#]*/;

/**
 * Creates a new TrustedResourceUrl based on an existing one but with the
 * addition of a fragment (the part after `#`). If the URL already has a
 * fragment, it is replaced with the new one.
 * @param fragment The fragment to add to the URL, verbatim, without the leading
 * `#`. No additional escaping is applied.
 */
export function replaceFragment(
    trustedUrl: TrustedResourceUrl, fragment: string) {
  const urlString = unwrapResourceUrl(trustedUrl).toString();
  return createResourceUrl(
      BEFORE_FRAGMENT_REGEXP.exec(urlString)![0] + '#' + fragment);
}

/**
 * Creates a new TrustedResourceUrl based on an existing one with a single
 * subpath segment added to the end of the existing path and prior to any query
 * parameters and/or fragments that already exist in the URL.
 * @param pathSegment The singular sub path being added to the URL. Do not pass
 *     a pre-encoded value as this will result in it being double encoded.
 */
export function appendPathSegment(
    trustedUrl: TrustedResourceUrl, pathSegment: string): TrustedResourceUrl {
  const originalUrl = unwrapResourceUrl(trustedUrl).toString();
  const urlSegments = originalUrl.split(/\?|#/);

  const basePath = urlSegments[0];
  const paramVals = /\?/.test(originalUrl) ? urlSegments[1] : undefined;
  const fragVal = /#/.test(originalUrl) ?
      (paramVals ? urlSegments[2] : urlSegments[1]) :
      undefined;

  const pathSeparator = basePath.charAt(basePath.length - 1) === '/' ? '' : '/';
  let url = basePath + pathSeparator + encodeURIComponent(pathSegment);

  if (paramVals !== undefined) {
    url += '?' + paramVals;
  }
  if (fragVal !== undefined) {
    url += '#' + fragVal;
  }
  return createResourceUrl(url);
}

/**
 * Creates a `TrustedResourceUrl` by generating a `Blob` from a
 * `SafeScript` and then calling `URL.createObjectURL` with that `Blob`.
 *
 * Caller must call `URL.revokeObjectUrl()` on the stringified url to
 * release the underlying `Blob`.
 */
export function objectUrlFromScript(safeScript: SafeScript):
    TrustedResourceUrl {
  const scriptContent = unwrapScript(safeScript).toString();
  const blob = new Blob([scriptContent], {type: 'text/javascript'});
  return createResourceUrl(URL.createObjectURL(blob));
}
