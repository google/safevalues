/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Safe iframe helpers and go/intents-for-iframes-for-closure
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl.js';
import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';

/** Sets the Src attribute using a TrustedResourceUrl */
export function setIframeSrc(
  iframe: HTMLIFrameElement,
  v: TrustedResourceUrl,
): void {
  iframe.src = unwrapResourceUrl(v).toString();
}

/** Sets the Srcdoc attribute using a SafeHtml */
export function setIframeSrcdoc(iframe: HTMLIFrameElement, v: SafeHtml): void {
  iframe.srcdoc = unwrapHtml(v) as string;
}
