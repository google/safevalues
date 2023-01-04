/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {secretToken} from '../../internals/secrets';

import {HtmlSanitizer, HtmlSanitizerImpl} from './html_sanitizer';
import {defaultSanitizerTable} from './sanitizer_table/default_sanitizer_table';
import {AttributePolicy, AttributePolicyAction, ElementPolicy, SanitizerTable} from './sanitizer_table/sanitizer_table';

/** This class allows modifications to the default sanitizer configuration. */
export class HtmlSanitizerBuilder {
  private sanitizerTable: SanitizerTable;
  // To denote if the builder has called build() and therefore should make no
  // further changes to the sanitizer table.
  private calledBuild = false;

  constructor() {
    this.sanitizerTable = defaultSanitizerTable;
  }

  /** Builder option to restrict allowed elements to a smaller subset. */
  onlyAllowElements(elementSet: ReadonlySet<string>): HtmlSanitizerBuilder {
    const allowedElements = new Set<string>();
    const allowedElementPolicies = new Map<string, ElementPolicy>();
    for (let element of elementSet) {
      element = element.toUpperCase();
      if (!this.sanitizerTable.isAllowedElement(element)) {
        throw new Error(
            `Element: ${element}, is not allowed by html5_contract.textpb`);
      }

      const elementPolicy = this.sanitizerTable.elementPolicies.get(element);
      if (elementPolicy !== undefined) {
        allowedElementPolicies.set(element, elementPolicy);
      } else {
        allowedElements.add(element);
      }
    }

    this.sanitizerTable = new SanitizerTable(
        allowedElements, allowedElementPolicies,
        this.sanitizerTable.allowedGlobalAttributes,
        this.sanitizerTable.globalAttributePolicies);
    return this;
  }

  /**
   * Builder option to restrict allowed attributes to a smaller subset.
   *
   * If the attribute isn't currently allowed then it won't be added.
   */
  onlyAllowAttributes(attributeSet: ReadonlySet<string>): HtmlSanitizerBuilder {
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
            this.sanitizerTable.globalAttributePolicies.get(attribute)!);
      }
    }

    for (const [elementName, originalElementPolicy] of this.sanitizerTable
             .elementPolicies.entries()) {
      const newElementPolicy = new Map<string, AttributePolicy>();

      for (const [attribute, attributePolicy] of originalElementPolicy
               .entries()) {
        if (attributeSet.has(attribute)) {
          newElementPolicy.set(attribute, attributePolicy);
        }
      }
      elementPolicies.set(elementName, newElementPolicy);
    }

    this.sanitizerTable = new SanitizerTable(
        this.sanitizerTable.allowedElements, elementPolicies,
        allowedGlobalAttributes, globalAttributePolicies);
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
  allowDataAttributes(attributes: string[]): HtmlSanitizerBuilder {
    const allowedGlobalAttributes =
        new Set<string>(this.sanitizerTable.allowedGlobalAttributes);
    for (const attribute of attributes) {
      if (attribute.indexOf('data-') !== 0) {
        throw new Error(`data attribute: ${
            attribute} does not begin with the prefix "data-"`);
      }
      allowedGlobalAttributes.add(attribute);
    }
    this.sanitizerTable = new SanitizerTable(
        this.sanitizerTable.allowedElements,
        this.sanitizerTable.elementPolicies, allowedGlobalAttributes,
        this.sanitizerTable.globalAttributePolicies);
    return this;
  }

  /**
   * Preserves style attributes. Note that the sanitizer won't parse and
   * sanitize the values but keep them as they are. In particular this means
   * that the code will be able to call functions that could do undesirable
   * things (e.g. `url` to trigger a network request), as well as any custom
   * properties or functions defined by the application.
   */
  allowStyleAttributes(): HtmlSanitizerBuilder {
    const globalAttributePolicies = new Map<string, AttributePolicy>(
        this.sanitizerTable.globalAttributePolicies);
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
  allowClassAttributes(): HtmlSanitizerBuilder {
    const allowedGlobalAttributes =
        new Set<string>(this.sanitizerTable.allowedGlobalAttributes);
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
  allowIdAttributes(): HtmlSanitizerBuilder {
    const allowedGlobalAttributes =
        new Set<string>(this.sanitizerTable.allowedGlobalAttributes);
    allowedGlobalAttributes.add('id');
    this.sanitizerTable = new SanitizerTable(
        this.sanitizerTable.allowedElements,
        this.sanitizerTable.elementPolicies,
        allowedGlobalAttributes,
        this.sanitizerTable.globalAttributePolicies,
    );
    return this;
  }

  build(): HtmlSanitizer {
    if (this.calledBuild) {
      throw new Error('this sanitizer has already called build');
    }
    this.calledBuild = true;
    return new HtmlSanitizerImpl(this.sanitizerTable, secretToken);
  }
}
