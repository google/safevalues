/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev';
import {SafeHtml} from '../../internals/html_impl';
import {pure} from '../../internals/pure';
import {ensureTokenIsValid, secretToken} from '../../internals/secrets';
import {nodeToHtmlInternal} from '../html_builders';
import {restrictivelySanitizeUrl} from '../url_builders';

import {createInertFragment} from './inert_fragment';
import {getNodeName, isElement, isText} from './no_clobber';
import {
  ResourceUrlPolicy,
  ResourceUrlPolicyHints,
  ResourceUrlPolicyHintsType,
} from './resource_url_policy';
import {defaultSanitizerTable} from './sanitizer_table/default_sanitizer_table';
import {
  AttributePolicyAction,
  SanitizerTable,
} from './sanitizer_table/sanitizer_table';

/**
 * An HTML5-compliant markup sanitizer that produces SafeHtml markup.
 *
 * You can build sanitizers with a custom configuration using the
 * HtmlSanitizerBuilder.
 */
export interface HtmlSanitizer {
  sanitize(html: string): SafeHtml;
  sanitizeToFragment(html: string): DocumentFragment;
  sanitizeAssertUnchanged(html: string): SafeHtml;
}

/** A function that sanitizes a CSS string. */
export type CssSanitizer = (css: string) => string;

/** Implementation for `HtmlSanitizer` */
export class HtmlSanitizerImpl implements HtmlSanitizer {
  private changes: string[] = [];
  constructor(
    private readonly sanitizerTable: SanitizerTable,
    token: object,
    private readonly styleElementSanitizer?: CssSanitizer,
    private readonly styleAttributeSanitizer?: CssSanitizer,
    private readonly resourceUrlPolicy?: ResourceUrlPolicy,
  ) {
    ensureTokenIsValid(token);
  }

  sanitizeAssertUnchanged(html: string): SafeHtml {
    if (process.env.NODE_ENV !== 'production') {
      this.changes = [];
    }
    const sanitizedHtml = this.sanitize(html);
    if (process.env.NODE_ENV !== 'production' && this.changes.length !== 0) {
      throw new Error(
        `Unexpected change to HTML value as a result of sanitization. ` +
          `Input: "${html}", sanitized output: "${sanitizedHtml}"\n` +
          `List of changes:${this.changes.join('\n')}`,
      );
    }
    return sanitizedHtml;
  }

  sanitize(html: string): SafeHtml {
    const inertDocument = document.implementation.createHTMLDocument('');

    return nodeToHtmlInternal(
      this.sanitizeToFragmentInternal(html, inertDocument),
      inertDocument.body,
    );
  }

  sanitizeToFragment(html: string): DocumentFragment {
    const inertDocument = document.implementation.createHTMLDocument('');
    return this.sanitizeToFragmentInternal(html, inertDocument);
  }

  private sanitizeToFragmentInternal(
    html: string,
    inertDocument: Document,
  ): DocumentFragment {
    const dirtyFragment = createInertFragment(html, inertDocument);

    const treeWalker = document.createTreeWalker(
      dirtyFragment,
      5 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT */,
      (n) => this.nodeFilter(n),
    );

    // `nextNode` is called so we skip the root `DocumentFragment`.
    let currentNode = treeWalker.nextNode();
    // We create a root element to attach all the children of the body to. We
    // use div as it as a semantic-free, generic container and does not
    // represent anything. This is removed when we serialize the tree back
    // into a string.
    const sanitizedFragment = inertDocument.createDocumentFragment();
    let sanitizedParent: Node = sanitizedFragment;

    while (currentNode !== null) {
      let sanitizedNode;

      if (isText(currentNode)) {
        if (
          this.styleElementSanitizer &&
          sanitizedParent.nodeName === 'STYLE'
        ) {
          // TODO(securitymb): The sanitizer should record a change whenever
          // any meaningful change is made to the stylesheet.
          const sanitizedCss = this.styleElementSanitizer(currentNode.data);
          sanitizedNode = this.createTextNode(sanitizedCss);
        } else {
          sanitizedNode = this.sanitizeTextNode(currentNode);
        }
      } else if (isElement(currentNode)) {
        sanitizedNode = this.sanitizeElementNode(currentNode, inertDocument);
      } else {
        let message = '';
        if (process.env.NODE_ENV !== 'production') {
          message = 'Node is not of type text or element';
        }
        throw new Error(message);
      }

      sanitizedParent.appendChild(sanitizedNode);

      // Advance iterator while keeping track of the sanitized parent for the
      // current node
      currentNode = treeWalker.firstChild();
      if (currentNode) {
        sanitizedParent = sanitizedNode;
      } else {
        while (!(currentNode = treeWalker.nextSibling())) {
          if (!(currentNode = treeWalker.parentNode())) {
            break;
          }
          sanitizedParent = sanitizedParent.parentNode!;
        }
      }
    }
    return sanitizedFragment;
  }

  private createTextNode(text: string): Text {
    return document.createTextNode(text);
  }

  private sanitizeTextNode(textNode: Text): Text {
    return this.createTextNode(textNode.data);
  }

  private sanitizeElementNode(
    elementNode: Element,
    inertDocument: Document,
  ): Element {
    const elementName = getNodeName(elementNode);
    const newNode = inertDocument.createElement(elementName);
    const dirtyAttributes = elementNode.attributes;
    for (const {name, value} of dirtyAttributes) {
      const policy = this.sanitizerTable.getAttributePolicy(name, elementName);
      if (!this.satisfiesAllConditions(policy.conditions, dirtyAttributes)) {
        this.recordChange(
          `Not all conditions satisfied for attribute: ${name}.`,
        );
        continue;
      }

      switch (policy.policyAction) {
        case AttributePolicyAction.KEEP:
          setAttribute(newNode, name, value);
          break;
        case AttributePolicyAction.KEEP_AND_SANITIZE_URL:
          const sanitizedAttrUrl = restrictivelySanitizeUrl(value);
          if (sanitizedAttrUrl !== value) {
            this.recordChange(
              `Url in attribute ${name} was modified during sanitization. Original url:"${value}" was sanitized to: "${sanitizedAttrUrl}"`,
            );
          }

          setAttribute(newNode, name, sanitizedAttrUrl);
          break;
        case AttributePolicyAction.KEEP_AND_NORMALIZE:
          // We don't consider changing the case of an attribute value to be a
          // semantic change
          setAttribute(newNode, name, value.toLowerCase());
          break;
        case AttributePolicyAction.KEEP_AND_SANITIZE_STYLE:
          if (this.styleAttributeSanitizer) {
            const sanitizedCss = this.styleAttributeSanitizer(value);
            // TODO(securitymb): The sanitizer should record a change whenever
            // any meaningful change is made to the stylesheet.
            setAttribute(newNode, name, sanitizedCss);
          } else {
            setAttribute(newNode, name, value);
          }
          break;
        case AttributePolicyAction.KEEP_AND_USE_RESOURCE_URL_POLICY:
          if (this.resourceUrlPolicy) {
            const hints: ResourceUrlPolicyHints = {
              type: ResourceUrlPolicyHintsType.HTML_ATTRIBUTE,
              attributeName: name,
              tagName: elementName,
            };
            const url = parseUrl(value);
            const sanitizedUrl = this.resourceUrlPolicy(url, hints);
            // TODO(securitymb): A change should be recorded if the resource url
            // changes the URL.
            if (sanitizedUrl) {
              setAttribute(newNode, name, sanitizedUrl.toString());
            }
            // If null is returned, the attribute is dropped.
          } else {
            // If the resource url policy is not set, we allow all resources.
            // This is how the sanitizer behaved before the resource url policy
            // was introduced.
            setAttribute(newNode, name, value);
          }
          break;
        case AttributePolicyAction.DROP:
          this.recordChange(`Attribute: ${name} was dropped`);
          break;
        default:
          if (process.env.NODE_ENV !== 'production') {
            checkExhaustive(
              policy.policyAction,
              'Unhandled AttributePolicyAction case',
            );
          }
      }
    }
    return newNode;
  }

  nodeFilter(node: Node): number {
    if (isText(node)) {
      return 1; // NodeFilter.FILTER_ACCEPT
    } else if (!isElement(node)) {
      // Getting a node that is neither an `Element` or a `Text` node. This is
      // likely due to something that is not supposed to be an element in user
      // code but recognized as such by the TreeWalker (e.g. a polyfill for
      // other kind of nodes). Since we can't recognize it as an element, we
      // drop the node, but we don't record it as a meaningful change.
      return 2; // NodeFilter.FILTER_REJECT
    }

    const nodeName = getNodeName(node);
    if (nodeName === null) {
      this.recordChange(`Node name was null for node: ${node}`);
      return 2; // NodeFilter.FILTER_REJECT
    }

    if (this.sanitizerTable.isAllowedElement(nodeName)) {
      return 1; // NodeFilter.FILTER_ACCEPT
    }

    this.recordChange(`Element: ${nodeName} was dropped`);
    return 2; // NodeFilter.FILTER_REJECT
  }

  private recordChange(errorMessage: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.changes.push(errorMessage);
    }
  }

  private satisfiesAllConditions(
    conditions: ReadonlyMap<string, Set<string>> | undefined,
    attrs: NamedNodeMap,
  ): boolean {
    if (!conditions) {
      return true;
    }

    for (const [attrName, expectedValues] of conditions) {
      const value = attrs.getNamedItem(attrName)?.value;
      if (value && !expectedValues.has(value)) {
        return false;
      }
    }

    return true;
  }
}

function parseUrl(value: string): URL {
  try {
    return new URL(value, window.document.baseURI);
  } catch (e) {
    return new URL('about:invalid');
  }
}

/** @noinline Helper to save on codesize. */
function setAttribute(el: Element, name: string, value: string) {
  el.setAttribute(name, value);
}

interface SrcsetPart {
  url: string;
  descriptor: string | undefined;
}

/**
 * A structured representation of a srcset attribute.
 */
export interface Srcset {
  parts: SrcsetPart[];
}

/**
 * Parses a srcset attribute into a structured representation.
 *
 * @param srcset The srcset attribute value.
 * @return The parsed srcset.
 */
export function parseSrcset(srcset: string): Srcset {
  // The algorithm is described in the spec at
  // https://html.spec.whatwg.org/multipage/images.html#srcset-attributes.
  //
  // The code below is greatly simplified though; we don't check the validity of
  // the descriptors, only extract them. If they happen to be invalid, the
  // browser will ignore them anyway.

  const parts: SrcsetPart[] = [];
  for (const part of srcset.split(',')) {
    const [url, descriptor] = part.trim().split(/\s+/, 2);
    parts.push({url, descriptor});
  }
  return {parts};
}

/**
 * Serializes a srcset into a string.
 *
 * @param srcset The srcset to serialize.
 * @return The serialized srcset.
 */
export function serializeSrcset(srcset: Srcset): string {
  return (
    srcset.parts
      .map((part) => {
        const {url, descriptor} = part;
        return `${url}${descriptor ? ` ${descriptor}` : ''}`;
      })
      // We always add whitespaces around the parts to remove the ambiguity of
      // whether a comma character is a part of the URL or not.
      .join(' , ')
  );
}

const defaultHtmlSanitizer = /* #__PURE__ */ pure(
  () => new HtmlSanitizerImpl(defaultSanitizerTable, secretToken),
);

/** Sanitizes untrusted html using the default sanitizer configuration. */
export function sanitizeHtml(html: string): SafeHtml {
  return defaultHtmlSanitizer.sanitize(html);
}

/**
 * Sanitizes untrusted html using the default sanitizer configuration. Throws
 * an error if the html was changed.
 */
export function sanitizeHtmlAssertUnchanged(html: string): SafeHtml {
  return defaultHtmlSanitizer.sanitizeAssertUnchanged(html);
}

/**
 * Sanitizes untrusted html using the default sanitizer configuration. Throws
 * an error if the html was changed.
 */
export function sanitizeHtmlToFragment(html: string): DocumentFragment {
  return defaultHtmlSanitizer.sanitizeToFragment(html);
}

function checkExhaustive(
  value: never,
  msg = `unexpected value ${value}!`,
): never {
  throw new Error(msg);
}
