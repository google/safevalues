/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Exports the UrlPolicy type and its associated interfaces.
 */

/**
 * A policy that can be used to process URLs for navigation or resource URL sinks.
 */
export type UrlPolicy = (url: URL, hints: UrlPolicyHints) => URL | null;

/**
 * The type of the hints that can be passed to a UrlPolicy.
 */
export enum UrlPolicyHintsType {
  STYLE_ELEMENT,
  STYLE_ATTRIBUTE,
  HTML_ATTRIBUTE,
}

interface StyleElementOrAttributeUrlPolicyHints {
  /**
   * The URL is being loaded by a stylesheet from a <style> tag or a style
   * attribute.
   */
  readonly type:
    | UrlPolicyHintsType.STYLE_ELEMENT
    | UrlPolicyHintsType.STYLE_ATTRIBUTE;
  /**
   * The CSS property that attempts to load the resource.
   */
  readonly propertyName: string;
}

interface HtmlAttributeUrlPolicyHints {
  /**
   * The external resource is being loaded by an HTML attribute.
   */
  readonly type: UrlPolicyHintsType.HTML_ATTRIBUTE;
  /**
   * The HTML attribute that attempts to load the resource.
   */
  readonly attributeName: string;
  /**
   * The HTML element that contains the attribute.
   */
  readonly elementName: string;
}

/**
 * Hints that can be passed to a UrlPolicy to make the check more
 * informed.
 */
export type UrlPolicyHints =
  | StyleElementOrAttributeUrlPolicyHints
  | HtmlAttributeUrlPolicyHints;

/**
 * Parses a URL. If the URL is invalid, returns URL instance with
 * `about:invalid`.
 */
export function parseUrl(value: string): URL {
  try {
    return new URL(value, window.document.baseURI);
  } catch (e) {
    return new URL('about:invalid');
  }
}
