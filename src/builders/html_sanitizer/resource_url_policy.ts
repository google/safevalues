/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Exports the ResourceUrlPolicy type and its associated
 * interfaces.
 */

/**
 * A policy that can be used to check whether a given URL is allowed to be
 * loaded as an external resource.
 */
export type ResourceUrlPolicy = (
  url: URL,
  hints: ResourceUrlPolicyHints,
) => URL | null;

/**
 * The type of the hints that can be passed to a ResourceUrlPolicy.
 */
export enum ResourceUrlPolicyHintsType {
  STYLE_TAG,
  STYLE_ATTRIBUTE,
  HTML_ATTRIBUTE,
}

interface StyleTagOrAttributeResourceUrlPolicyHints {
  /**
   * The external resource is being loaded by a stylesheet from a <style> tag or
   * a style attribute.
   */
  readonly type:
    | ResourceUrlPolicyHintsType.STYLE_TAG
    | ResourceUrlPolicyHintsType.STYLE_ATTRIBUTE;
  /**
   * The CSS property that attempts to load the resource.
   */
  readonly propertyName: string;
}

interface HtmlAttributeResourceUrlPolicyHints {
  /**
   * The external resource is being loaded by an HTML attribute.
   */
  readonly type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE;
  /**
   * The HTML attribute that attempts to load the resource.
   */
  readonly attributeName: string;
  /**
   * The HTML tag that contains the attribute.
   */
  readonly tagName: string;
}

/**
 * Hints that can be passed to a ResourceUrlPolicy to make the check more
 * informed.
 */
export type ResourceUrlPolicyHints =
  | StyleTagOrAttributeResourceUrlPolicyHints
  | HtmlAttributeResourceUrlPolicyHints;
