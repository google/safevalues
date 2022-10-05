/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Legacy re-exports for safevalues functions that are only used
 * internally.
 */

import {scriptUrlToHtml} from '../builders/html_builders';
import {SafeHtml} from '../internals/html_impl';
import {TrustedResourceUrl} from '../internals/resource_url_impl';

export {scriptToHtml as createScript} from '../builders/html_builders';

/**
 * Creates a `SafeHtml` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 * @deprecated Use scriptUrlToHtml instead.
 */
export function createScriptSrc(
    src: TrustedResourceUrl, async?: boolean, nonce?: string): SafeHtml {
  return scriptUrlToHtml(src, {async, nonce});
}

export {unwrapAttributePrefix as unwrapSafeAttributePrefix} from '../internals/attribute_impl';
export {unwrapStyle as unwrapSafeStyle} from '../internals/style_impl';
export {unwrapStyleSheet as unwrapSafeStyleSheet} from '../internals/style_sheet_impl';
export {unwrapUrl as unwrapSafeUrl} from '../internals/url_impl';
export {valueAsScript as scriptFromJson} from '../builders/script_builders';
export {objectUrlFromSafeSource as fromBlob} from '../builders/url_builders';
export {objectUrlFromScript as blobUrlFromScript} from '../builders/resource_url_builders';
