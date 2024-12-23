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
 * The safe alternative to Element#setAttribute. The function takes a list of
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
