/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';
import {SafeUrl, unwrapUrl} from '../../internals/url_impl';

const SAFE_URL_REL_VALUES = [
  'alternate',
  'author',
  'bookmark',
  'canonical',
  'cite',
  'help',
  'icon',
  'license',
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
export type SafeUrlRelTypes = typeof SAFE_URL_REL_VALUES[number];

/**
 * Values of the "rel" attribute when "href" should accept a
 * `TrustedResourceUrl`. Note that this list is not exhaustive and is here just
 * for better documentation, any unknown "rel" values will also require passing
 * a `TrustedResourceUrl` "href".
 */
export type TrustedResourecUrlRelTypes = 'stylesheet'|'manifest';

/**
 * Safely sets a link element's "href" property using a sensitive "rel" value.
 */
export function setHrefAndRel(
    link: HTMLLinkElement, url: TrustedResourceUrl,
    rel: TrustedResourecUrlRelTypes): void;

/**
 * Safely sets a link element's "href" property using a non-sensitive "rel"
 * value.
 */
export function setHrefAndRel(
    link: HTMLLinkElement, url: SafeUrl, rel: SafeUrlRelTypes): void;

/**
 * Safely sets a link element's "href" property using an arbitrary "rel"
 * value.
 */
export function setHrefAndRel(
    link: HTMLLinkElement, url: TrustedResourceUrl, rel: string): void;

export function setHrefAndRel(
    link: HTMLLinkElement, url: TrustedResourceUrl|SafeUrl, rel: string) {
  if (url instanceof SafeUrl) {
    if ((SAFE_URL_REL_VALUES as readonly string[]).indexOf(rel) === -1) {
      throw new Error(
          `TrustedResourceUrl href attribute required with rel="${rel}"`);
    }
    link.href = unwrapUrl(url);
  } else {
    link.href = unwrapResourceUrl(url).toString();
  }
  link.rel = rel;
}
