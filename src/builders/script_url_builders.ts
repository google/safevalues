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

import {assertIsTemplateObject} from '../implementation/safe_string_literal';
import {unwrapScriptAsString} from '../implementation/script_impl';
import {createScriptUrl, unwrapScriptUrlAsString} from '../implementation/script_url_impl';

/** Type that we know how to interpolate */
type Primitive = string|number|boolean;

/**
 * Check whether the base url contains a valid origin,
 *
 * A string for an origin must contain only alphanumeric or any of the
 * following: `-.:`. Remember that, as per the documentation for
 * TrustedScriptURL, the origin must be trustworthy.
 *
 * IPv6 origins (e.g. `https://[2001:db8::8a2e:370:7334]/`) are considered
 * invalid. IPv4 origins (e.g. `https://192.0.2.235/`) should not be used, but
 * currently pass validation (b/184051990).
 *
 * @param base The base url that contains an origin.
 */
function hasValidOrigin(base: string): boolean {
  if (!(base.startsWith('https://') || base.startsWith('//'))) {
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
  if (!base.startsWith('about:blank')) {
    return false;
  }
  if (base !== 'about:blank' && !base.startsWith('about:blank#')) {
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
  if (!base.startsWith('/')) {
    return false;
  }
  if ((base === '/') ||
      (base.length > 1 && base[1] !== '/' && base[1] !== '\\')) {
    return true;
  }
  throw new Error('The path start in the url is invalid.');
}

/**
 * Builds TrustedScriptURL from a template literal.
 *
 * This factory is a template literal tag function. It should be called with
 * a template literal, with or without embedded expressions. For example,
 *               scriptUrl`//example.com/${bar}`;
 * or
 *               scriptUrl`//example.com`;
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
 * Remember that, as per the documentation for TrustedScriptURL, the origin
 * must be trustworthy. An origin of "example.com" could be set with this
 * method, but would tie the security of your site to the security of
 * example.com. Similarly, formats that potentially cover redirects hosted
 * on a trusted origin are problematic, since that could lead to untrusted
 * origins.
 *
 * `<pathStart>` is either a '/' or a '/' followed by at least one
 * character that is not '/' or '\'.
 *
 * `data:` (data URL) does not allow embedded expressions in the template
 * literal input.
 *
 * @param templateObj This contains the literal part of the template literal.
 * @param rest This represents the template's embedded expressions.
 */
export function scriptUrl(
    templateObj: TemplateStringsArray, ...rest: Primitive[]): TrustedScriptURL {
  // Check if templateObj is actually from a template literal.
  assertIsTemplateObject(
      templateObj, true,
      'scriptUrl is a template literal tag function and ' +
          'can only be called as such (e.g. scriptUrl`/somepath.js`)');

  if (rest.length === 0) {
    return createScriptUrl(templateObj[0]);
  }

  const base = templateObj[0].toLowerCase();

  if (base.startsWith('data:')) {
    throw new Error(
        'Data URLs cannot have expressions in the template literal input.');
  }

  if (!hasValidOrigin(base) && !isValidPathStart(base) &&
      !isValidAboutUrl(base)) {
    throw new Error(
        'Trying to interpolate expressions in an unsupported url format.');
  }

  const urlParts = [templateObj[0]];
  for (let i = 0; i < rest.length; i++) {
    urlParts.push(encodeURIComponent(rest[i]));
    urlParts.push(templateObj[i + 1]);
  }
  return createScriptUrl(urlParts.join(''));
}

/**
 * Creates a new TrustedScriptURL with params added to the URL's search
 * parameters.
 * @param params What to add to the URL. Parameters with value `null` or
 * `undefined` are skipped. Both keys and values are encoded. If the value is
 * an array then the same parameter is added for every element in the array.
 */
export function appendParams(
    trustedUrl: TrustedScriptURL,
    params: Map<string, Primitive|null|Array<Primitive|null>>):
    TrustedScriptURL {
  let url = unwrapScriptUrlAsString(trustedUrl);
  if (/#/.test(url)) {
    throw new Error(`Found a hash in url (${url}), appending not supported`);
  }
  let separator = /\?/.test(url) ? '&' : '?';
  for (const [key, value] of params.entries()) {
    const values = (value instanceof Array) ? value : [value];
    for (const v of values) {
      if (v === null || v === undefined) {
        continue;
      }
      url += separator + encodeURIComponent(key) + '=' +
          encodeURIComponent(String(v));
      separator = '&';
    }
  }
  return createScriptUrl(url);
}

/**
 * Creates a `TrustedScriptURL` by generating a `Blob` from a
 * `TrustedScript` and then calling `URL.createObjectURL` with that `Blob`.
 *
 * Caller must call `URL.revokeObjectUrl()` on the stringified url to
 * release the underlying `Blob`.
 */
export function blobUrlFromScript(script: TrustedScript): TrustedScriptURL {
  const scriptContent = unwrapScriptAsString(script);
  const blob = new Blob([scriptContent], {type: 'text/javascript'});
  return createScriptUrl(URL.createObjectURL(blob));
}
