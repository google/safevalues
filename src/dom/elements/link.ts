/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapUrlOrSanitize, Url} from '../../builders/url_builders.js';
import {
  isResourceUrl,
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';

const SAFE_URL_REL_VALUES = [
  'alternate',
  'author',
  'bookmark',
  'canonical',
  'cite',
  'help',
  'icon',
  'license',
  'modulepreload',
  'next',
  'prefetch',
  'dns-prefetch',
  'prerender',
  'preconnect',
  'preload',
  'prev',
  'search',
  'subresource',
] as const;

/**
 * Values of the "rel" attribute when "href" should accept `SafeUrl` instead of
 * `TrustedResourceUrl`.
 */
export type SafeUrlRelTypes = (typeof SAFE_URL_REL_VALUES)[number];

/**
 * Values of the "rel" attribute when "href" should accept a
 * `TrustedResourceUrl`. Note that this list is not exhaustive and is here just
 * for better documentation, any unknown "rel" values will also require passing
 * a `TrustedResourceUrl` "href".
 */
export type TrustedResourecUrlRelTypes = 'stylesheet' | 'manifest';

/**
 * Safely sets a link element's "href" property using a sensitive "rel" value.
 */
export function setLinkHrefAndRel(
  link: HTMLLinkElement,
  url: TrustedResourceUrl,
  rel: TrustedResourecUrlRelTypes,
): void;

/**
 * Safely sets a link element's "href" property using a non-sensitive "rel"
 * value.
 */
export function setLinkHrefAndRel(
  link: HTMLLinkElement,
  url: Url,
  rel: SafeUrlRelTypes,
): void;

/**
 * Safely sets a link element's "href" property using an arbitrary "rel"
 * value.
 */
export function setLinkHrefAndRel(
  link: HTMLLinkElement,
  url: TrustedResourceUrl,
  rel: string,
): void;

export function setLinkHrefAndRel(
  link: HTMLLinkElement,
  url: TrustedResourceUrl | Url,
  rel: string,
) {
  if (isResourceUrl(url)) {
    setLinkWithResourceUrlHrefAndRel(link, url, rel);
    return;
  } else {
    if ((SAFE_URL_REL_VALUES as readonly string[]).indexOf(rel) === -1) {
      throw new Error(
        `TrustedResourceUrl href attribute required with rel="${rel}"`,
      );
    }
    const sanitizedUrl = unwrapUrlOrSanitize(url);
    if (sanitizedUrl === undefined) {
      return;
    }
    link.href = sanitizedUrl;
  }
  link.rel = rel;
}

/**
 * Safely sets a link element's "href" property using a TrustedResourceUrl and
 * an arbitrary "rel" value. It is recommended to use this method when the url
 * is always a TrustedResourceUrl, since the resulting binary size will be
 * smaller.
 */
export function setLinkWithResourceUrlHrefAndRel(
  link: HTMLLinkElement,
  url: TrustedResourceUrl,
  rel: TrustedResourecUrlRelTypes | string,
): void {
  link.href = unwrapResourceUrl(url).toString();
  link.rel = rel;
}
