/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This contains safe wrappers for properties that aren't specific
 * to one kind of HTMLElement (like innerHTML), plus other setters and functions
 * that are not tied to elements (like location.href or Worker constructor).
 */

import '../../environment/dev.js';
import {
  SafeAttributePrefix,
  unwrapAttributePrefix,
} from '../../internals/attribute_impl.js';
import {SafeHtml, unwrapHtml} from '../../internals/html_impl.js';
import {TrustedResourceUrl} from '../../internals/resource_url_impl.js';
import {setAnchorHref} from './anchor.js';
import {setAreaHref} from './area.js';
import {setBaseHref} from './base.js';
import {setButtonFormaction} from './button.js';
import {setEmbedSrc} from './embed.js';
import {setFormAction} from './form.js';
import {setIframeSrc, setIframeSrcdoc} from './iframe.js';
import {setInputFormaction} from './input.js';
import {setObjectData} from './object.js';
import {setScriptSrc} from './script.js';

type ScriptOrStyle =
  | HTMLScriptElement
  | HTMLStyleElement
  | SVGScriptElement
  | SVGStyleElement;
/**
 * Safely set {@link Element.innerHTML} on a given ShadowRoot or Element which
 * may not be a `<script>` element or a `<style>` element.
 */
export function setElementInnerHtml<T extends Element | ShadowRoot>(
  elOrRoot: Exclude<T, ScriptOrStyle>,
  v: SafeHtml,
): void {
  if (isElement(elOrRoot)) {
    throwIfScriptOrStyle(elOrRoot);
  }
  elOrRoot.innerHTML = unwrapHtml(v) as string;
}

/**
 * Safely set {@link Element.outerHTML} for the given Element.
 */
export function setElementOuterHtml(e: Element, v: SafeHtml): void {
  const parent = e.parentElement;
  if (parent !== null) {
    throwIfScriptOrStyle(parent);
  }
  e.outerHTML = unwrapHtml(v) as string;
}

/**
 * Safely call {@link Element.insertAdjacentHTML} for the given Element.
 */
export function elementInsertAdjacentHtml<T extends Element>(
  element: Exclude<T, ScriptOrStyle>,
  position: 'afterbegin' | 'afterend' | 'beforebegin' | 'beforeend',
  v: SafeHtml,
): void {
  const tagContext =
    position === 'beforebegin' || position === 'afterend'
      ? element.parentElement
      : element;
  if (tagContext !== null) {
    throwIfScriptOrStyle(tagContext);
  }
  element.insertAdjacentHTML(position, unwrapHtml(v) as string);
}

/**
 * Given a set of known-to-be-safe prefixes (e.g., "data-", "aria-", "js"),
 * return a setter function that allows you to set attributes on an element,
 * as long as the names of the attributes to be set has one of the prefixes.
 *
 * The returned setter ensures that setting any dangerous attribute, e.g.,
 * "src", "href" will cause an exception. This is intended to be used as the
 * safe alterantive of `Element#setAttribute`, when applications need to set
 * attributes that do not have security implications and do not have a
 * corresponding DOM property.
 */
export function buildPrefixedAttributeSetter(
  prefix: SafeAttributePrefix,
  ...otherPrefixes: readonly SafeAttributePrefix[]
) {
  const prefixes = [prefix, ...otherPrefixes];

  return (e: Element, attr: string, value: string): void => {
    setElementPrefixedAttribute(prefixes, e, attr, value);
  };
}

/**
 * A safe alternative to Element#setAttribute. The function takes a list of
 * `SafeAttributePrefix`, making developer intention explicit. The attribute
 * to be set must has one of the safe prefixes, otherwise the function throws
 * an Error.
 */
export function setElementPrefixedAttribute(
  attrPrefixes: readonly SafeAttributePrefix[],
  e: Element,
  attr: string,
  value: string,
): void {
  if (attrPrefixes.length === 0) {
    let message = '';
    if (process.env.NODE_ENV !== 'production') {
      message = 'No prefixes are provided';
    }
    throw new Error(message);
  }
  const prefixes = attrPrefixes.map((s) => unwrapAttributePrefix(s));
  const attrLower = attr.toLowerCase();
  if (prefixes.every((p) => attrLower.indexOf(p) !== 0)) {
    throw new Error(
      `Attribute "${attr}" does not match any of the allowed prefixes.`,
    );
  }
  e.setAttribute(attr, value);
}

function throwIfScriptOrStyle(element: Element): void {
  let message = '';
  const tagName = element.tagName;
  if (/^(script|style)$/i.test(tagName)) {
    if (process.env.NODE_ENV !== 'production') {
      if (tagName.toLowerCase() === 'script') {
        message = 'Use setScriptTextContent with a SafeScript.';
      } else {
        message = 'Use setStyleTextContent with a SafeStyleSheet.';
      }
    }
    throw new Error(message);
  }
}

function isElement(elOrRoot: Element | ShadowRoot): elOrRoot is Element {
  return elOrRoot.nodeType === 1; // Node.ELEMENT_NODE
}

/**
 * A safe alternative to Element#setAttribute.
 *
 * The function has essentially the same signature as `Element.setAttribute`,
 * but requires a safe type (or sanitizes the value) when used with a security
 * sensitive attribute. It does this by forwarding the call to the
 * element-specific setters within `safevalues/dom`.
 *
 * Note that this function doesn't currently support elements outside of the
 * html namespace & might throw if used with the wrong type of element or
 * attribute value
 *
 * If code size is a concern, consider using `setPrefixedAttribute`, or the
 * element-specific setters.
 *
 * The security sensitive element/attributes pairs are the following:
 *   - anchor#href -> forwarded to `setAnchorHref`
 *   - area#href -> forwarded to `setAreaHref`
 *   - base#href -> forwarded to `setBaseHref`
 *   - button#formaction -> forwarded to `setButtonFormaction`
 *   - embed#src -> forwarded to `setEmbedSrc`
 *   - form#action -> forwarded to `setFormAction`
 *   - iframe#src -> forwarded to `setIframeSrc`
 *   - iframe#srcdoc -> forwarded to `setIframeSrcdoc`
 *   - iframe#sandbox -> rejected, use `setIframeSrcWithIntent` or
 *       `setIframeSrcdocWithIntent` instead
 *   - input#formaction -> forwarded to `setInputFormaction`
 *   - link#href -> rejected, use `setLinkHrefAndRel` instead
 *   - link#rel -> rejected, use `setLinkHrefAndRel` instead
 *   - object#data -> forwarded to `setObjectData`
 *   - script#src -> forwarded to `setScriptSrc`
 *   - global attributes:
 *   - target -> forwarded to `el.setAttribute`
 *   - cite -> forwarded to `el.setAttribute`
 *   - poster -> forwarded to `el.setAttribute`
 *   - srcset -> forwarded to `el.setAttribute`
 *   - src -> forwarded to `el.setAttribute`
 *   - href -> forwarded to `el.setAttribute`
 *   - any attribute starting with `on` -> rejected
 *
 * Every other attribute is set as is using `element.setAttribute`
 */
export function setElementAttribute(
  el: HTMLElement,
  attr: string,
  value: string | TrustedResourceUrl | SafeHtml,
): void {
  if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
    throw new Error(
      `Cannot set attribute '${attr}' on '${el.tagName}'.` +
        `Element is not in the HTML namespace`,
    );
  }

  attr = attr.toLowerCase();
  const key = `${el.tagName} ${attr}`;
  switch (key) {
    case 'A href':
      setAnchorHref(el as HTMLAnchorElement, value as string);
      return;
    case 'AREA href':
      setAreaHref(el as HTMLAreaElement, value as string);
      return;
    case 'BASE href':
      setBaseHref(el as HTMLBaseElement, value as TrustedResourceUrl);
      return;
    case 'BUTTON formaction':
      setButtonFormaction(el as HTMLButtonElement, value as string);
      return;
    case 'EMBED src':
      setEmbedSrc(el as HTMLEmbedElement, value as TrustedResourceUrl);
      return;
    case 'FORM action':
      setFormAction(el as HTMLFormElement, value as string);
      return;
    case 'IFRAME src':
      setIframeSrc(el as HTMLIFrameElement, value as TrustedResourceUrl);
      return;
    case 'IFRAME srcdoc':
      setIframeSrcdoc(el as HTMLIFrameElement, value as SafeHtml);
      return;
    case 'IFRAME sandbox':
      throw new Error(
        "Can't set 'sandbox' on iframe tags. " +
          'Use setIframeSrcWithIntent or setIframeSrcdocWithIntent instead',
      );
    case 'INPUT formaction':
      setInputFormaction(el as HTMLInputElement, value as string);
      return;
    case 'LINK href':
      throw new Error(
        "Can't set 'href' attribute on link tags. " +
          'Use setLinkHrefAndRel instead',
      );
    case 'LINK rel':
      throw new Error(
        "Can't set 'rel' attribute on link tags. " +
          'Use setLinkHrefAndRel instead',
      );
    case 'OBJECT data':
      setObjectData(el as HTMLObjectElement, value as TrustedResourceUrl);
      return;
    case 'SCRIPT src':
      setScriptSrc(el as HTMLScriptElement, value as TrustedResourceUrl);
      return;
    default:
      if (/^on./.test(attr)) {
        throw new Error(
          `Attribute "${attr}" looks like an event handler attribute. ` +
            `Please use a safe alternative like addEventListener instead.`,
        );
      }
      el.setAttribute(attr, value as string);
  }
}
