/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the CSS sanitizer.
 *
 * Note that the CSS sanitizer is performing custom serialization of the CSS
 * string, instead of using `cssText`. The reason for that is twofold:
 *
 * 1. Serialization is not super precisely defined in the CSS spec so we have no
 *    guarantees that it will be stable across browsers and versions.
 * 2. At the moment of writing the sanitizer, a bug in serialization was found
 *    in Chromium. Controlling the serialization ourselves is a way to avoid
 *    that bug and possibly other ones.
 */

import {setStyleTextContent} from '../../../dom/elements/style.js';
import {createStyleSheetInternal} from '../../../internals/style_sheet_impl.js';
import {UrlPolicy, UrlPolicyHintsType, parseUrl} from '../url_policy.js';
import {escapeIdent, serializeTokens} from './serializer.js';
import {tokenizeCss} from './tokenizer.js';
import {CssToken, CssTokenKind} from './tokens.js';

/**
 * A function that can be used to discard a property.
 *
 * @param name The name of the property.
 * @return Whether the property should be discarded.
 */
export type PropertyDiscarder = (name: string) => boolean;

class CssSanitizer {
  private readonly inertDocument: Document;

  constructor(
    private readonly propertyAllowlist: ReadonlySet<string>,
    private readonly functionAllowlist: ReadonlySet<string>,
    private readonly resourceUrlPolicy: UrlPolicy | undefined,
    private readonly allowKeyframes: boolean,
    private readonly propertyDiscarders: PropertyDiscarder[],
  ) {
    this.inertDocument = document.implementation.createHTMLDocument();
  }

  private getStyleSheet(cssText: string): CSSStyleSheet {
    const styleEl = this.inertDocument.createElement('style');
    const safeStyleSheet = createStyleSheetInternal(cssText);
    setStyleTextContent(styleEl, safeStyleSheet);
    this.inertDocument.head.appendChild(styleEl);
    const sheet = styleEl.sheet!; // guaranteed to be non-null
    styleEl.remove();
    return sheet;
  }

  private getStyleDeclaration(cssText: string): CSSStyleDeclaration {
    const div = this.inertDocument.createElement('div');
    div.style.cssText = cssText;
    this.inertDocument.body.appendChild(div);
    const style = div.style;
    div.remove();
    return style;
  }

  private hasShadowDomEscapingTokens(
    token: CssToken,
    nextToken: CssToken,
  ): boolean {
    // Thanks to using shadow DOM, the only real worry in selectors are
    // pseudo-classes and pseudo-elements that can be used to target elements
    // outside of the shadow DOM. There are three of them:
    //
    // 1. `:host`
    // 2. `:host()`
    // 3. `:host-context()`
    //
    // We'll disallow all of them.

    if (token.tokenKind !== CssTokenKind.COLON) {
      return false;
    }
    if (
      nextToken.tokenKind === CssTokenKind.IDENT &&
      nextToken.ident.toLowerCase() === 'host'
    ) {
      return true;
    }
    if (
      nextToken.tokenKind === CssTokenKind.FUNCTION &&
      (nextToken.lowercaseName === 'host' ||
        nextToken.lowercaseName === 'host-context')
    ) {
      return true;
    }
    return false;
  }

  private sanitizeSelector(selector: string): string | null {
    // If we find any tokens we deem insecure in a selector, we'll then treat
    // the whole selector as insecure. In this case, we'll return null;
    // otherwise we'll return the re-serialized tokens.
    const tokens = tokenizeCss(selector);
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      if (this.hasShadowDomEscapingTokens(token, nextToken)) {
        return null;
      }
    }
    return serializeTokens(tokens);
  }

  private sanitizeValue(
    propertyName: string,
    value: string,
    calledFromStyleElement: boolean,
  ): string | null {
    // Values can contain functions, such as url() or rgba(). We maintain
    // an allowlist of functions and we make sure that only those are allowed.
    // Furthermore, a special logic is needed to handle url() functions.
    const tokens = tokenizeCss(value);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.tokenKind !== CssTokenKind.FUNCTION) {
        continue;
      }
      // The whole value is disregarded if it contains a disallowed function.
      if (!this.functionAllowlist.has(token.lowercaseName)) {
        return null;
      }
      if (token.lowercaseName === 'url') {
        const nextToken = tokens[i + 1] as CssToken | undefined;
        if (nextToken?.tokenKind !== CssTokenKind.STRING) {
          // Browsers always serialize the first argument of url() as a string.
          // If this doesn't happen, something weird is going on and we'll
          // reject the whole value for good measure.
          return null;
        }
        const url = nextToken.value;
        let parsedUrl: URL | null = parseUrl(url);
        if (this.resourceUrlPolicy) {
          parsedUrl = this.resourceUrlPolicy(parsedUrl, {
            type: calledFromStyleElement
              ? UrlPolicyHintsType.STYLE_ELEMENT
              : UrlPolicyHintsType.STYLE_ATTRIBUTE,
            propertyName,
          });
        }
        if (!parsedUrl) {
          return null;
        }
        tokens[i + 1] = {
          tokenKind: CssTokenKind.STRING,
          value: parsedUrl.toString(),
        };

        // Skip the string token.
        i++;
      }
    }
    return serializeTokens(tokens);
  }

  private sanitizeKeyframeRule(rule: CSSKeyframeRule): string | null {
    const sanitizedProperties = this.sanitizeStyleDeclaration(rule.style, true);
    // It should be safe to just re-use `rule.keyText` here because it can only
    // contain comma-separated percentages.
    //
    // https://drafts.csswg.org/css-animations/#dom-csskeyframerule-keytext
    return `${rule.keyText} { ${sanitizedProperties} }`;
  }

  private sanitizeKeyframesRule(
    keyframesRule: CSSKeyframesRule,
  ): string | null {
    if (!this.allowKeyframes) {
      return null;
    }
    const keyframeRules: string[] = [];
    for (const rule of keyframesRule.cssRules) {
      if (!(rule instanceof CSSKeyframeRule)) {
        // The only allowed child rules of CSSKeyframesRule are CSSKeyframeRule.
        continue;
      }
      const sanitizedRule = this.sanitizeKeyframeRule(rule);
      if (sanitizedRule) {
        keyframeRules.push(sanitizedRule);
      }
    }

    return `@keyframes ${escapeIdent(keyframesRule.name)} { ${keyframeRules.join(' ')} }`;
  }

  private isPropertyNameAllowed(name: string): boolean {
    if (!this.propertyAllowlist.has(name)) {
      return false;
    }
    for (const discarder of this.propertyDiscarders) {
      if (discarder(name)) {
        return false;
      }
    }
    return true;
  }

  private sanitizeProperty(
    name: string,
    value: string,
    isImportant: boolean,
    calledFromStyleElement: boolean,
  ): string | null {
    if (!this.isPropertyNameAllowed(name)) {
      return null;
    }
    const sanitizedValue = this.sanitizeValue(
      name,
      value,
      calledFromStyleElement,
    );
    if (!sanitizedValue) {
      return null;
    }
    return `${escapeIdent(name)}: ${sanitizedValue}${
      isImportant ? ' !important' : ''
    }`;
  }

  private sanitizeStyleDeclaration(
    style: CSSStyleDeclaration,
    calledFromStyleElement: boolean,
  ): string {
    // We sort the property names to ensure a stable serialization. This also
    // makes the output easier to test.
    const sortedPropertyNames = [...style].sort();
    let sanitizedProperties = '';
    for (const name of sortedPropertyNames) {
      const value = style.getPropertyValue(name);
      const isImportant = style.getPropertyPriority(name) === 'important';
      const sanitizedProperty = this.sanitizeProperty(
        name,
        value,
        isImportant,
        calledFromStyleElement,
      );
      if (sanitizedProperty) {
        sanitizedProperties += sanitizedProperty + ';';
      }
    }
    return sanitizedProperties;
  }

  private sanitizeStyleRule(rule: CSSStyleRule): string | null {
    const selector = this.sanitizeSelector(rule.selectorText);
    if (!selector) {
      return null;
    }
    const sanitizedProperties = this.sanitizeStyleDeclaration(rule.style, true);
    return `${selector} { ${sanitizedProperties} }`;
  }

  sanitizeStyleElement(cssText: string): string {
    const styleSheet = this.getStyleSheet(cssText);
    const rules = styleSheet.cssRules;
    const output: string[] = [];
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        const sanitizedRule = this.sanitizeStyleRule(rule);
        if (sanitizedRule) {
          output.push(sanitizedRule);
        }
      } else if (rule instanceof CSSKeyframesRule) {
        const sanitizedRule = this.sanitizeKeyframesRule(rule);
        if (sanitizedRule) {
          output.push(sanitizedRule);
        }
      }
    }

    return output.join('\n');
  }

  sanitizeStyleAttribute(cssText: string): string {
    const styleDeclaration = this.getStyleDeclaration(cssText);
    return this.sanitizeStyleDeclaration(styleDeclaration, false);
  }
}

/**
 * Sanitizes a CSS string in a `<style>` tag.
 *
 * @param cssText The CSS string to sanitize.
 * @return The sanitized CSS string.
 */
export function sanitizeStyleElement(
  cssText: string,
  propertyAllowlist: ReadonlySet<string>,
  functionAllowlist: ReadonlySet<string>,
  resourceUrlPolicy: UrlPolicy | undefined,
  allowKeyframes: boolean,
  propertyDiscarders: PropertyDiscarder[],
): string {
  return new CssSanitizer(
    propertyAllowlist,
    functionAllowlist,
    resourceUrlPolicy,
    allowKeyframes,
    propertyDiscarders,
  ).sanitizeStyleElement(cssText);
}

/**
 * Sanitizes a CSS string in a `style` attribute.
 *
 * @param cssText The CSS string to sanitize.
 * @return The sanitized CSS string.
 */
export function sanitizeStyleAttribute(
  cssText: string,
  propertyAllowlist: ReadonlySet<string>,
  functionAllowlist: ReadonlySet<string>,
  resourceUrlPolicy: UrlPolicy | undefined,
  propertyDiscarders: PropertyDiscarder[],
): string {
  return new CssSanitizer(
    propertyAllowlist,
    functionAllowlist,
    resourceUrlPolicy,
    false, // allowKeyframes is not relevant for the style attribute
    propertyDiscarders,
  ).sanitizeStyleAttribute(cssText);
}
