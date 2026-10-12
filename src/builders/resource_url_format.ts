/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates that the base url contains a valid origin.
 *
 * A string for an origin must contain only alphanumeric or any of the
 * following: `-.:`, and must not be an IP address. Remember that, as per the
 * documentation for TrustedResourceUrl, the origin must be trustworthy.
 *
 * @param base The base url that contains an origin (starts with 'https://' or
 *     '//').
 */
function validateOrigin(base: string): string | undefined {
  const originStart = base.indexOf('//') + 2;
  const originEnd = base.indexOf('/', originStart);
  // If the base url only contains the prefix (e.g. //), or the slash
  // for the origin is right after the prefix (e.g. ///), the origin is
  // missing.
  if (originEnd <= originStart) {
    return (
      `Can't interpolate data in a url's origin, ` +
      `Please make sure to fully specify the origin, terminated with '/'.`
    );
  }

  const origin = base.substring(originStart, originEnd);
  if (!/^[0-9a-z.:-]+$/i.test(origin)) {
    return 'The origin contains unsupported characters.';
  }
  if (!/^[^:]*(:[0-9]+)?$/i.test(origin)) {
    return 'Invalid port number.';
  }
  if (!/(^|\.)[a-z][^.]*$/i.test(origin)) {
    return 'The top-level domain must start with a letter.';
  }
  return undefined;
}

/**
 * Validates that the base url contains a valid about url at its beginning.
 *
 * An about url is either exactly 'about:blank' or 'about:blank#<str>' where
 * <str> can be an arbitrary string.
 *
 * @param base The base url (starts with 'about:blank').
 */
function validateAboutUrl(base: string): string | undefined {
  if (base !== 'about:blank' && !/^about:blank#/.test(base)) {
    return 'The about url is invalid.';
  }
  return undefined;
}

/**
 * Validates that the base url contains a valid path start at its beginning.
 *
 * A valid path start is either a '/' or a '/' followed by at least one
 * character that is not '/' or '\'.
 *
 * @param base The base url (starts with '/').
 */
function validatePathStart(base: string): string | undefined {
  if (
    base === '/' ||
    (base.length > 1 && base[1] !== '/' && base[1] !== '\\')
  ) {
    return undefined;
  }
  return 'The path start in the url is invalid.';
}

/**
 * Checks whether the base url contains a valid relative path start at its
 * beginning.
 *
 * A valid relative path start is a non empty string that has no ':', '/' nor
 * '\', and that is followed by a '/'.
 *
 * @param base The base url.
 */
function isValidRelativePathStart(base: string): boolean {
  // Using the RegExp syntax as the native JS RegExp syntax is not well handled
  // by some downstream bundlers with this regex.
  return new RegExp('^[^:\\s\\\\/]+/').test(base);
}

/**
 * Validates the initial literal prefix of a `trustedResourceUrl` tagged
 * template expression that contains interpolations.
 *
 * Returns an error message if the format is invalid, or `undefined` if valid.
 */
export function validateResourceUrlPrefix(prefix: string): string | undefined {
  const base = prefix.toLowerCase();

  if (/^data:/.test(base)) {
    return 'Data URLs cannot have expressions in the template literal input.';
  }
  if (/^https:\/\//.test(base) || /^\/\//.test(base)) {
    return validateOrigin(base);
  }
  if (/^\//.test(base)) {
    return validatePathStart(base);
  }
  if (/^about:blank/.test(base)) {
    return validateAboutUrl(base);
  }
  if (isValidRelativePathStart(base)) {
    return undefined;
  }

  let errorMsg =
    'Trying to interpolate expressions in an unsupported url format. The ' +
    'template literal must start with a compile-time static origin (e.g. ' +
    "'https://example.com/'), absolute path ('/path/'), or relative path " +
    "('path/').";
  return errorMsg;
}
