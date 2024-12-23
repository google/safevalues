/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {secretToken} from '../../internals/secrets.js';
import {
  CSS_FUNCTION_ALLOWLIST,
  CSS_PROPERTY_ALLOWLIST,
} from './css/allowlists.js';
import {
  PropertyDiscarder,
  sanitizeStyleAttribute,
  sanitizeStyleElement,
} from './css/sanitizer.js';
import {
  CssSanitizer,
  HtmlSanitizer,
  HtmlSanitizerImpl,
} from './html_sanitizer.js';
import {ResourceUrlPolicy} from './resource_url_policy.js';
import {DEFAULT_SANITIZER_TABLE} from './sanitizer_table/default_sanitizer_table.js';
import {
  AttributePolicy,
  AttributePolicyAction,
  ElementPolicy,
  SanitizerTable,
  isCustomElement,
} from './sanitizer_table/sanitizer_table.js';
/**
 * The base class for all sanitizer builders.
 */
export abstract class BaseSanitizerBuilder<
  T extends HtmlSanitizer | CssSanitizer,
> {
  protected sanitizerTable: SanitizerTable;
  // To denote if the builder has called build() and therefore should make no
  // further changes to the sanitizer table.
  protected calledBuild = false;
  protected resourceUrlPolicy?: ResourceUrlPolicy;
  constructor() {
    this.sanitizerTable = DEFAULT_SANITIZER_TABLE;
  }
  /** Builder option to restrict allowed elements to a smaller subset. */
  onlyAllowElements(elementSet: ReadonlySet<string>): this {
    const allowedElements = new Set<string>();
    const allowedElementPolicies = new Map<string, ElementPolicy>();
    for (let element of elementSet) {
      element = element.toUpperCase();
      if (!this.sanitizerTable.isAllowedElement(element)) {
        throw new Error(
          `Element: ${element}, is not allowed by html5_contract.textpb`,
        );
      }
      const elementPolicy = this.sanitizerTable.elementPolicies.get(element);
      if (elementPolicy !== undefined) {
        allowedElementPolicies.set(element, elementPolicy);
      } else {
        allowedElements.add(element);
      }
    }
    this.sanitizerTable = new SanitizerTable(
      allowedElements,
      allowedElementPolicies,
      this.sanitizerTable.allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Builder option to allow a set of custom elements. Must be called either
   * without or after `onlyAllowElements` - will be overwritten otherwise.
   * Custom elements must contain a dash.
   */
  allowCustomElement(
    element: string,
    allowedAttributes?: ReadonlySet<string>,
  ): this {
    const allowedElements = new Set<string>(
      this.sanitizerTable.allowedElements,
    );
    const allowedElementPolicies = new Map<string, ElementPolicy>(
      this.sanitizerTable.elementPolicies,
    );
    element = element.toUpperCase();
    if (!isCustomElement(element)) {
      throw new Error(`Element: ${element} is not a custom element`);
    }
    if (allowedAttributes) {
      const elementPolicy = new Map<string, AttributePolicy>();
      for (const attribute of allowedAttributes) {
        elementPolicy.set(attribute.toLowerCase(), {
          policyAction: AttributePolicyAction.KEEP,
        });
      }
      allowedElementPolicies.set(element, elementPolicy);
    } else {
      allowedElements.add(element);
    }
    this.sanitizerTable = new SanitizerTable(
      allowedElements,
      allowedElementPolicies,
      this.sanitizerTable.allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Builder option to restrict allowed attributes to a smaller subset.
   *
   * If the attribute isn't currently allowed then it won't be added.
   */
  onlyAllowAttributes(attributeSet: ReadonlySet<string>): this {
    const allowedGlobalAttributes = new Set<string>();
    const globalAttributePolicies = new Map<string, AttributePolicy>();
    const elementPolicies = new Map<string, ElementPolicy>();
    for (const attribute of attributeSet) {
      if (this.sanitizerTable.allowedGlobalAttributes.has(attribute)) {
        allowedGlobalAttributes.add(attribute);
      }
      if (this.sanitizerTable.globalAttributePolicies.has(attribute)) {
        globalAttributePolicies.set(
          attribute,
          this.sanitizerTable.globalAttributePolicies.get(attribute)!,
        );
      }
    }
    for (const [
      elementName,
      originalElementPolicy,
    ] of this.sanitizerTable.elementPolicies.entries()) {
      const newElementPolicy = new Map<string, AttributePolicy>();
      for (const [
        attribute,
        attributePolicy,
      ] of originalElementPolicy.entries()) {
        if (attributeSet.has(attribute)) {
          newElementPolicy.set(attribute, attributePolicy);
        }
      }
      elementPolicies.set(elementName, newElementPolicy);
    }
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      elementPolicies,
      allowedGlobalAttributes,
      globalAttributePolicies,
    );
    return this;
  }
  /**
   * Allows the set of data attributes passed.
   *
   * These values must be prefixed with "data-"
   *
   * If called with onlyAllowElements or onlyAllowAttributes, those methods must
   * be called first.
   */
  allowDataAttributes(attributes: string[]): this {
    const allowedGlobalAttributes = new Set<string>(
      this.sanitizerTable.allowedGlobalAttributes,
    );
    for (const attribute of attributes) {
      if (attribute.indexOf('data-') !== 0) {
        throw new Error(
          `data attribute: ${attribute} does not begin with the prefix "data-"`,
        );
      }
      allowedGlobalAttributes.add(attribute);
    }
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      this.sanitizerTable.elementPolicies,
      allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Preserves style attributes. Note that the sanitizer won't parse and
   * sanitize the values but keep them as they are. In particular this means
   * that the code will be able to call functions that could do undesirable
   * things (e.g. `url` to trigger a network request), as well as any custom
   * properties or functions defined by the application.
   */
  allowStyleAttributes(): this {
    const globalAttributePolicies = new Map<string, AttributePolicy>(
      this.sanitizerTable.globalAttributePolicies,
    );
    globalAttributePolicies.set('style', {
      policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_STYLE,
    });
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      this.sanitizerTable.elementPolicies,
      this.sanitizerTable.allowedGlobalAttributes,
      globalAttributePolicies,
    );
    return this;
  }
  /**
   * Preserves the class attribute on all elements. This means contents can
   * adopt CSS styles from other page elements and possibly mask themselves as
   * legitimate UI elements, which can lead to phishing.
   */
  allowClassAttributes(): this {
    const allowedGlobalAttributes = new Set<string>(
      this.sanitizerTable.allowedGlobalAttributes,
    );
    allowedGlobalAttributes.add('class');
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      this.sanitizerTable.elementPolicies,
      allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Preserves id attributes. This carries moderate risk as it allows an
   * element to override other elements with the same ID.
   */
  allowIdAttributes(): this {
    const allowedGlobalAttributes = new Set<string>(
      this.sanitizerTable.allowedGlobalAttributes,
    );
    allowedGlobalAttributes.add('id');
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      this.sanitizerTable.elementPolicies,
      allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Preserves (some) attributes that reference existing ids. This carries a
   * moderate security risk, because sanitized content can create semantic
   * associations with existing elements in the page, regardless of the layout.
   * This could be used to override the label associated with a form input by a
   * screen reader, and facilitate phishing.
   */
  allowIdReferenceAttributes(): this {
    const allowedGlobalAttributes = new Set<string>(
      this.sanitizerTable.allowedGlobalAttributes,
    );
    allowedGlobalAttributes
      .add('aria-activedescendant')
      .add('aria-controls')
      .add('aria-labelledby')
      .add('aria-owns')
      .add('for')
      .add('list');
    this.sanitizerTable = new SanitizerTable(
      this.sanitizerTable.allowedElements,
      this.sanitizerTable.elementPolicies,
      allowedGlobalAttributes,
      this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }
  /**
   * Sets the ResourceUrlPolicy to be used by the sanitizer.
   *
   * The ResourceUrlPolicy can be used to decide whether a given URL is allowed
   * to be loaded as an external resource. It is a function that an instance
   * of `URL` and a set of hints giving a context on why an image was loaded.
   *
   * The policy can return `null` to indicate that the resource should be
   * dropped, otherwise it should return a valid `URL` that will be used to
   * replace the original URL in the sanitized output.
   *
   * For example the following policy drops all images loaded from
   * `https://forbidden.google.com` but allows all other images.
   *
   * ```typescript
   * const resourceUrlPolicy: ResourceUrlPolicy = (url) => {
   *   if (url.origin === 'https://forbidden.google.com') {
   *     return null;
   *   }
   *   return url;
   * };
   * ```
   *
   * You can also use the `ResourceUrlPolicyHints` to make the policy more
   * informed. For example the following policy only allows images loaded
   * via an <img src> element but drops all other images.
   *
   * ```typescript
   * const resourceUrlPolicy: ResourceUrlPolicy = (url, hints) => {
   *   if (hints.type === ResourceUrlPolicyHintsType.HTML_ATTRIBUTE &&
   *       hints.attributeName === 'src' &&
   *       hints.elementName === 'IMG') {
   *     return url;
   *   }
   *   return null;
   * };
   * ```
   */
  withResourceUrlPolicy(resourceUrlPolicy: ResourceUrlPolicy): this {
    this.resourceUrlPolicy = resourceUrlPolicy;
    return this;
  }
  abstract build(): T;
}
/**
 * This class allows modifications to the default sanitizer configuration.
 * It builds an instance of `HtmlSanitizer`.
 */
export class HtmlSanitizerBuilder extends BaseSanitizerBuilder<HtmlSanitizer> {
  build(): HtmlSanitizer {
    if (this.calledBuild) {
      throw new Error('this sanitizer has already called build');
    }
    this.calledBuild = true;
    return new HtmlSanitizerImpl(
      this.sanitizerTable,
      secretToken,
      /* styleElementSanitizer= */ undefined,
      /* styleAttributeSanitizer= */ undefined,
      this.resourceUrlPolicy,
    );
  }
}
/**
 * This class allows modifications to the default sanitizer configuration.
 * It builds an instance of `CssSanitizer`.
 */
export class CssSanitizerBuilder extends BaseSanitizerBuilder<CssSanitizer> {
  private animationsAllowed = false;
  private transitionsAllowed = false;
  allowAnimations(): this {
    this.animationsAllowed = true;
    return this;
  }
  allowTransitions(): this {
    this.transitionsAllowed = true;
    return this;
  }
  /**
   * Builds a CSS sanitizer.
   *
   * Note that this function always adds `style`, `id`, `name` and `class`
   * attributes to the allowlist as well as the `STYLE` element.
   */
  build(): CssSanitizer {
    this.extendSanitizerTableForCss();
    const propertyDiscarders: PropertyDiscarder[] = [];
    if (!this.animationsAllowed) {
      propertyDiscarders.push((property) =>
        /^(animation|offset)(-|$)/.test(property),
      );
    }
    if (!this.transitionsAllowed) {
      propertyDiscarders.push((property) => /^transition(-|$)/.test(property));
    }
    const styleElementSanitizer = (cssText: string) =>
      sanitizeStyleElement(
        cssText,
        CSS_PROPERTY_ALLOWLIST,
        CSS_FUNCTION_ALLOWLIST,
        this.resourceUrlPolicy,
        this.animationsAllowed,
        propertyDiscarders,
      );
    const styleAttributeSanitizer = (cssText: string) =>
      sanitizeStyleAttribute(
        cssText,
        CSS_PROPERTY_ALLOWLIST,
        CSS_FUNCTION_ALLOWLIST,
        this.resourceUrlPolicy,
        propertyDiscarders,
      );
    return new HtmlSanitizerImpl(
      this.sanitizerTable,
      secretToken,
      styleElementSanitizer,
      styleAttributeSanitizer,
      this.resourceUrlPolicy,
    );
  }
  private extendSanitizerTableForCss() {
    const allowedElements = new Set(this.sanitizerTable.allowedElements);
    const allowedGlobalAttributes = new Set(
      this.sanitizerTable.allowedGlobalAttributes,
    );
    const globalAttributePolicies = new Map(
      this.sanitizerTable.globalAttributePolicies,
    );
    allowedElements.add('STYLE');
    globalAttributePolicies.set('style', {
      policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_STYLE,
    });
    allowedGlobalAttributes.add('id');
    allowedGlobalAttributes.add('name');
    allowedGlobalAttributes.add('class');
    this.sanitizerTable = new SanitizerTable(
      allowedElements,
      this.sanitizerTable.elementPolicies,
      allowedGlobalAttributes,
      globalAttributePolicies,
    );
  }
}
