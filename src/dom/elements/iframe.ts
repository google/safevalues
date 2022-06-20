/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Safe iframe helpers and go/intents-for-iframes-for-closure
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl';
import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';

/** Sets the Src attribute using a TrustedResourceUrl */
export function setSrc(iframe: HTMLIFrameElement, v: TrustedResourceUrl) {
  iframe.src = unwrapResourceUrl(v).toString();
}

/** Sets the Srcdoc attribute using a SafeHtml */
export function setSrcdoc(iframe: HTMLIFrameElement, v: SafeHtml) {
  iframe.srcdoc = unwrapHtml(v) as string;
}
