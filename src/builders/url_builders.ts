/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {TrustedResourceUrl, unwrapResourceUrlAsString} from '../internals/resource_url_impl';
import {assertIsTemplateObject} from '../internals/string_literal';
import {createUrl, INNOCUOUS_URL, SafeUrl} from '../internals/url_impl';

/**
 * A pattern that matches safe MIME types. Only matches image, video and audio
 * types, with some parameter support (most notably, we haven't implemented the
 * more complex parts like %-encoded characters or non-alphanumerical ones for
 * simplicity's sake). Also, the specs are fairly complex, and they don't
 * necessarily agree with Chrome on some aspects, and so we settled on a subset
 * where the behavior makes sense to all parties involved.
 *
 * The spec is available at https://mimesniff.spec.whatwg.org/ (and see
 * https://tools.ietf.org/html/rfc2397 for data: urls, which override some of
 * it).
 */
function isSafeMimeType(mimeType: string): boolean {
  const match = mimeType.match(/^([^;]+)(?:;\w+=(?:\w+|"[\w;,= ]+"))*$/i);
  return match?.length === 2 &&
      (isSafeImageMimeType(match[1]) || isSafeVideoMimeType(match[1]) ||
       isSafeAudioMimeType(match[1]));
}

function isSafeImageMimeType(mimeType: string): boolean {
  return /^image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon|heic|heif)$/i.test(
      mimeType);
}

function isSafeVideoMimeType(mimeType: string): boolean {
  return /^video\/(?:mpeg|mp4|ogg|webm|x-matroska|quicktime|x-ms-wmv)$/i.test(
      mimeType);
}

function isSafeAudioMimeType(mimeType: string): boolean {
  return /^audio\/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-matroska|x-wav|wav|webm)$/i
      .test(mimeType);
}

/**
 * Interface representing a scheme that sanitizeUrl can optionally accommodate.
 * Even though this interface could be implemented by user code, the code will
 * ignore any implementation that doesn't come from this file.
 */
export interface Scheme {
  isValid(url: string): boolean;
}

class SchemeImpl implements Scheme {
  constructor(readonly isValid: (url: string) => boolean) {}
}

function isValidScheme(scheme: Scheme): boolean {
  return scheme instanceof SchemeImpl;
}

function simpleScheme(scheme: string): Scheme {
  return new SchemeImpl((url: string) => {
    return url.substr(0, scheme.length + 1).toLowerCase() === (scheme + ':');
  });
}

const RELATIVE_SCHEME: Scheme =
    new SchemeImpl((url: string) => /^[^:]*([/?#]|$)/.test(url));

const CALLTO_SCHEME: Scheme =
    new SchemeImpl((url: string) => /^callto:\+?\d*$/i.test(url));

const SSH_SCHEME: Scheme =
    new SchemeImpl((url: string) => (url.indexOf('ssh://') === 0));

const EXTENSION_SCHEME: Scheme = new SchemeImpl((url: string) => {
  return url.indexOf('chrome-extension://') === 0 ||
      url.indexOf('moz-extension://') === 0 ||
      url.indexOf('ms-browser-extension://') === 0;
});

// This used to be an enum, we preserved the name avoid changing the API.
// tslint:disable:enforce-name-casing
/** The list of schemes sanitizeUrl can optionally accommodate. */
export const SanitizableUrlScheme = {
  TEL: simpleScheme('tel'),
  CALLTO: CALLTO_SCHEME,
  SSH: SSH_SCHEME,
  RTSP: simpleScheme('rtsp'),
  DATA: simpleScheme('data'),
  HTTP: simpleScheme('http'),
  HTTPS: simpleScheme('https'),
  EXTENSION: EXTENSION_SCHEME,
  FTP: simpleScheme('ftp'),
  RELATIVE: RELATIVE_SCHEME,
  MAILTO: simpleScheme('mailto'),
  INTENT: simpleScheme('intent'),
  MARKET: simpleScheme('market'),
  ITMS: simpleScheme('itms'),
  ITMS_APPSS: simpleScheme('itms-appss'),
  ITMS_SERVICES: simpleScheme('itms-services'),
};
// tslint:enable:enforce-name-casing

/** List of schemes used by default. */
const DEFAULT_SCHEMES = [
  SanitizableUrlScheme.DATA,
  SanitizableUrlScheme.HTTP,
  SanitizableUrlScheme.HTTPS,
  SanitizableUrlScheme.MAILTO,
  SanitizableUrlScheme.FTP,
  SanitizableUrlScheme.RELATIVE,
];

/**
 * Creates a SafeUrl object from a string `url` by sanitizing it.
 *
 * Note: If your url is partially known statically, you should prefer using the
 * `safeUrl` function directly.
 *
 * The input string is validated against the set of `allowedSchemes`, which
 * defaults to a set of commonly used safe URL schemes. If validation fails,
 * `undefined` is returned.
 *
 * If no `allowedSchemes` are passed, the `url` may use the http, https, mailto,
 * ftp or data schemes, or a relative URL (i.e., a URL without a scheme;
 * specifically, a scheme-relative, absolute-path-relative, or path-relative
 * URL).
 *
 * Other supported schemes don't have direct security issues (i.e. no JS
 * execution), but their inherent capabilities are not touched: for instance, if
 * you allow TEL only, you won't get javascript execution, but the resulting
 * link could still potentially be used to call toll numbers.
 */
export function trySanitizeUrl(
    url: string, allowedSchemes: readonly Scheme[] = DEFAULT_SCHEMES): SafeUrl|
    undefined {
  // Using simple iteration because the compiler doesn't optimize this well for
  // es5.
  for (let i = 0; i < allowedSchemes.length; ++i) {
    const scheme = allowedSchemes[i];
    if (isValidScheme(scheme) && scheme.isValid(url)) {
      return createUrl(url);
    }
  }
  return undefined;
}

/**
 * Creates a SafeUrl object from a string `url` by sanitizing it.
 *
 * Works the same way as `trySanitizeUrl`, but returns an innocuous url instead
 * of `undefined`.
 */
export function sanitizeUrl(
    url: string, allowedSchemes: readonly Scheme[] = DEFAULT_SCHEMES): SafeUrl {
  return trySanitizeUrl(url, allowedSchemes) || INNOCUOUS_URL;
}

/**
 * Creates a SafeUrl object from a Blob. This function validates that the
 * Blob's type is amongst the safe MIME types, and throws if that's not the
 * case.
 */
export function fromBlob(blob: Blob): SafeUrl {
  if (!isSafeMimeType(blob.type)) {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = `unsafe blob MIME type: ${blob.type}`;
    }
    throw new Error(message);
  }

  return createUrl(URL.createObjectURL(blob));
}

/** Creates a SafeUrl object from a MediaSource. */
export function fromMediaSource(media: MediaSource): SafeUrl {
  return createUrl(URL.createObjectURL(media));
}

/**
 * Builds SafeUrl object from a TrustedResourceUrl. This is safe because
 * TrustedResourceUrl is more tightly restricted than SafeUrl.
 */
export function fromTrustedResourceUrl(url: TrustedResourceUrl) {
  return createUrl(unwrapResourceUrlAsString(url));
}

/**
 * Checks whether this url prefix contains:
 *  - a fully specified and valid scheme
 *  - a character forcing it to be a relative url
 *
 * Since this function is only called with compile-time constants, we don't need
 * to be as careful as in `sanitizeUrl` and we can just check that the scheme is
 * valid and non-'javascript:'. If we discover other dangerous schemes we want
 * to prevent, we can statically find all instances and refactor them. See
 * https://url.spec.whatwg.org/#url-scheme-string for scheme validation.
 */
function isSafeUrlPrefix(prefix: string, isWholeUrl: boolean): boolean {
  const markerIdx = prefix.search(/[:/?#]/);
  if (markerIdx < 0) {
    // If we don't find a marker, but there is no interpolation, the url is
    // relative
    return isWholeUrl;
  }
  if (prefix.charAt(markerIdx) !== ':') {
    // Relative URL
    return true;
  }

  const scheme = prefix.substring(0, markerIdx).toLowerCase();
  return /^[a-z][a-z\d+.-]*$/.test(scheme) && scheme !== 'javascript';
}

/**
 * Builds a SafeUrl from a template literal.
 *
 * Use this function if your url has a static prefix containing the whole scheme
 * of the url.
 *
 * This factory is a template literal tag function. It should be called with
 * a template literal, with or without embedded expressions. For example,
 *               safeUrl`./somepath.html`;
 * or
 *               safeUrl`data:text/html;base64,${btoa('<div></div>')}`;
 *
 * To be successfully built, we must ensure that the scheme is correctly defined
 * and not dangerous. In practice this means the first chunk of the template
 * must satisfy one of the following conditions:
 * - Start with an explicit scheme that is valid and is not `javascript`
 *    (e.g. safeUrl`https:${...}`)
 * - Start with a prefix that ensures the url is relative
 *    (e.g. safeUrl`./${...}` or safeUrl`#${...}`)
 * Embedded expressions are interpolated as-is and no URL encoding is applied.
 */
export function safeUrl(templateObj: TemplateStringsArray, ...rest: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(
        templateObj, true,
        'safeUrl is a template literal tag function and ' +
            'can only be called as such (e.g. safeUrl`./somepath.html`)');
  }

  const prefix = templateObj[0];
  if (process.env.NODE_ENV !== 'production') {
    if (!isSafeUrlPrefix(prefix, rest.length === 0)) {
      throw new Error(
          `Trying to interpolate with unsupported prefix: ${prefix}`);
    }
  }

  const urlParts = [prefix];
  for (let i = 0; i < rest.length; i++) {
    urlParts.push(String(rest[i]));
    urlParts.push(templateObj[i + 1]);
  }
  return createUrl(urlParts.join(''));
}
