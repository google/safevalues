/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Class for holding element and attribute policies used for sanitization. */
export class SanitizerTable {
  constructor(
    readonly allowedElements: ReadonlySet<string>,
    readonly elementPolicies: ReadonlyMap<string, ElementPolicy>,
    readonly allowedGlobalAttributes: ReadonlySet<string>,
    readonly globalAttributePolicies: ReadonlyMap<string, AttributePolicy>,
    readonly globallyAllowedAttributePrefixes: ReadonlySet<string> | undefined,
  ) {}

  isAllowedElement(elementName: string): boolean {
    // Note: `HTMLFormElement`s are always dropped, supporting them is very
    // costly because of the DOM clobberring they can cause. The additional code
    // size required to properly work around DOM clobberring issues is large and
    // shouldn't be put on every user of the sanitizer. Thoroughly review
    // b/210975025 and the CLs linked there before you start allowing form
    // elements.
    return (
      elementName !== 'FORM' &&
      (this.allowedElements.has(elementName) ||
        this.elementPolicies.has(elementName))
    );
  }

  getAttributePolicy(
    attributeName: string,
    elementName: string,
  ): AttributePolicy {
    const elementPolicy = this.elementPolicies.get(elementName);
    if (elementPolicy?.has(attributeName)) {
      return elementPolicy.get(attributeName)!;
    }

    if (this.allowedGlobalAttributes.has(attributeName)) {
      return {policyAction: AttributePolicyAction.KEEP};
    }

    const globalPolicy = this.globalAttributePolicies.get(attributeName);
    if (globalPolicy) {
      return globalPolicy;
    }
    if (
      this.globallyAllowedAttributePrefixes &&
      [...this.globallyAllowedAttributePrefixes].some(
        (prefix) => attributeName.indexOf(prefix) === 0,
      )
    ) {
      return {policyAction: AttributePolicyAction.KEEP};
    }
    return {policyAction: AttributePolicyAction.DROP};
  }
}

/**
 * Holds information on how to sanitize the attributes of a particular element.
 * An element with an ElementPolicy specified is implicitly kept in the output.
 */
export type ElementPolicy = ReadonlyMap<string, AttributePolicy>;

/**
 * Values derived from
 * https://godoc.corp.google.com/pkg/google3/third_party/safehtml/sanitizer/policy#AttributePolicy
 */
export enum AttributePolicyAction {
  DROP,
  KEEP,
  KEEP_AND_SANITIZE_URL,
  KEEP_AND_NORMALIZE,
  // This action is currently equivalent to KEEP as there is no style sanitizer.
  KEEP_AND_SANITIZE_STYLE,
  KEEP_AND_USE_RESOURCE_URL_POLICY,
  KEEP_AND_USE_RESOURCE_URL_POLICY_FOR_SRCSET,
  KEEP_AND_USE_NAVIGATION_URL_POLICY,
}

/**
 * Holds information on how to sanitize the values of a particular attribute.
 */
export interface AttributePolicy {
  readonly policyAction: AttributePolicyAction;
  // This attribute is only allowed if the attributes (used as the keys in
  // the map) is equal to one of the values in the set.
  readonly conditions?: ReadonlyMap<string, Set<string>>;
}

// From the spec:
// https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname:~:text=name%20must%20not%20be%20any%20of%20the%20following%3A
const FORBIDDEN_CUSTOM_ELEMENT_NAMES = new Set<string>([
  'ANNOTATION-XML',
  'COLOR-PROFILE',
  'FONT-FACE',
  'FONT-FACE-SRC',
  'FONT-FACE-URI',
  'FONT-FACE-FORMAT',
  'FONT-FACE-NAME',
  'MISSING-GLYPH',
]);

/**
 * Helper for checking if an element tag is a custom element.
 */
export function isCustomElement(tag: string): boolean {
  return (
    !FORBIDDEN_CUSTOM_ELEMENT_NAMES.has(tag.toUpperCase()) &&
    /^[a-z][-_.a-z0-9]*-[-_.a-z0-9]*$/i.test(tag)
  );
}
