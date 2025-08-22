/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Typings for fake_lib_esm.
 */

import {SafeHtml, TrustedResourceUrl} from 'safevalues';

/** Logs and returns true. Does not use safevalues. */
export function consoleLog(): boolean;

/**
 * Takes an element and sets its innerHTML to a greeting message. Uses
 * safevalues.sanitizeHtml.
 */
export function setGreetingSanitize(
  element: HTMLElement,
  message: string,
): void;

/**
 * Returns a SafeHtml instance with a div that hosts a greeting.
 */
export function sanitizeGreeting(message: string): SafeHtml;

/**
 * Attempts to build a TrustedResourceUrl with a correct API call.
 */
export function buildTrustedResourceUrlCorrectly(): TrustedResourceUrl;

/**
 * Sets the src attribute of an image element.
 */
export function setElementAttributeImageSrc(
  imageElement: HTMLImageElement,
  value: string,
): void;

/**
 * Sets the src attribute of a script element.
 */
export function setElementAttributeScriptSrc(
  scriptElement: HTMLScriptElement,
  value: TrustedResourceUrl,
): void;
