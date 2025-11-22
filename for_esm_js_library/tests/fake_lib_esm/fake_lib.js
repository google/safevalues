/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safevalues from 'safevalues';
import * as dom from 'safevalues/dom';

/**
 * @fileoverview A fake esm_js_library only meant to be used as a test. It
 * depends on esm safevalues.
 */

export function consoleLog() {
  console.log('hey I am fake_lib');
  return true;
}

export function setGreetingSanitize(element, message) {
  dom.setElementInnerHtml(element, safevalues.sanitizeHtml('Hello ' + message + '!'));
}

export function sanitizeGreeting(message) {
  return safevalues.sanitizeHtml('<div>Hello ' + message + '!</div>');
}

export function buildTrustedResourceUrlCorrectly() {
  return safevalues.trustedResourceUrl`https://google.com`;
}

export function setElementAttributeImageSrc(imageElement, value) {
  dom.setElementAttribute(imageElement, 'src', value);
}

export function setElementAttributeScriptSrc(scriptElement, value) {
  dom.setElementAttribute(scriptElement, 'src', value);
}
