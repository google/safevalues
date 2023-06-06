/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {createHtml, isHtml, SafeHtml, unwrapHtml} from '../internals/html_impl';
import {TrustedResourceUrl, unwrapResourceUrl} from '../internals/resource_url_impl';
import {SafeScript, unwrapScript} from '../internals/script_impl';

import {sanitizeJavaScriptUrl} from './url_sanitizer';

/**
 * Returns HTML-escaped text as a `SafeHtml` object.
 *
 * Available options:
 * - `preserveSpaces` turns every second consecutive space character into its
 * HTML entity representation (`&#160;`).
 * - `preserveNewlines` turns newline characters into breaks (`<br>`).
 * - `preserveTabs` wraps tab characters in a span with style=white-space:pre.
 */
export function htmlEscape(text: string, options: {
  preserveNewlines?: boolean,
  preserveSpaces?: boolean,
  preserveTabs?: boolean
} = {}): SafeHtml {
  let htmlEscapedString = htmlEscapeToString(text);
  if (options.preserveSpaces) {
    // Do this first to ensure we preserve spaces after newlines and tabs.
    htmlEscapedString =
        htmlEscapedString.replace(/(^|[\r\n\t ]) /g, '$1&#160;');
  }
  if (options.preserveNewlines) {
    htmlEscapedString = htmlEscapedString.replace(/(\r\n|\n|\r)/g, '<br>');
  }
  if (options.preserveTabs) {
    htmlEscapedString = htmlEscapedString.replace(
        /(\t+)/g, '<span style="white-space:pre">$1</span>');
  }
  return createHtml(htmlEscapedString);
}

/**
 * Creates a `SafeHtml` representing a script tag with inline script content.
 */
export function scriptToHtml(script: SafeScript, options: {
  id?: string,
  nonce?: string,
  type?: string,
} = {}): SafeHtml {
  const unwrappedScript = unwrapScript(script).toString();
  let stringTag = `<script`;
  if (options.id) {
    stringTag += ` id="${htmlEscapeToString(options.id)}"`;
  }
  if (options.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  if (options.type) {
    stringTag += ` type="${htmlEscapeToString(options.type)}"`;
  }
  stringTag += `>${unwrappedScript}\u003C/script>`;
  return createHtml(stringTag);
}

/**
 * Creates a `SafeHtml` representing a script tag with the src attribute.
 * This also supports CSP nonces and async loading.
 */
export function scriptUrlToHtml(src: TrustedResourceUrl, options: {
  async?: boolean,
  nonce?: string,
} = {}): SafeHtml {
  const unwrappedSrc = unwrapResourceUrl(src).toString();
  let stringTag = `<script src="${htmlEscapeToString(unwrappedSrc)}"`;
  if (options.async) {
    stringTag += ' async';
  }
  if (options.nonce) {
    stringTag += ` nonce="${htmlEscapeToString(options.nonce)}"`;
  }
  stringTag += '>\u003C/script>';
  return createHtml(stringTag);
}

/**
 * HTML-escapes the given text (`&`, `<`, `>`, `"` and `'`).
 */
function htmlEscapeToString(text: string): string {
  const escaped = text.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
  return escaped;
}

/** Creates a `SafeHtml` value by concatenating multiple `SafeHtml`s. */
export function concatHtmls(htmls: readonly SafeHtml[]): SafeHtml {
  return createHtml(htmls.map(unwrapHtml).join(''));
}

type AttributeValue = string|number;

/**
 * Shorthand for union of types that can sensibly be converted to strings
 * or might already be SafeHtml.
 */
type TextOrHtml = string|number|boolean|SafeHtml;

/**
 * Creates a SafeHtml content consisting of a tag with optional attributes and
 * optional content.
 * This is roughly equivalent to Closure's goog.html.SafeHtml.create function,
 * with a few dropped features, like Const strings. It is discouraged for new
 * usages. Prefer using a recommended templating system like Lit instead.
 *
 * Example usage:
 *
 * safeHtmlLegacyCreate('br');
 * safeHtmlLegacyCreate('div', {'class': 'a'});
 * safeHtmlLegacyCreate('p', {}, 'a');
 * safeHtmlLegacyCreate('p', {}, safeHtmlLegacyCreate('br'));
 *
 * safeHtmlLegacyCreate('span', {
 *   'style': {'margin': '0'}
 * });
 *
 * To guarantee SafeHtml's type contract is upheld there are restrictions on
 * attribute values and tag names.
 *
 * - Attributes which contain script code (e.g. on*) are disallowed.
 * - For attributes which are interpreted as URLs (e.g. src, href), the URL will
 *   be sanitized with javascript: URLs blocked.
 * - For tags which can load code or set security relevant page metadata,
 *   more specific safeHtmlLegacyCreate*() functions must be used. Tags
 *   which are not supported by this function are applet, base, embed, iframe,
 *   link, math, meta, object, script, style, svg, and template.
 */
export function safeHtmlLegacyCreate(
    tagName: string,
    attributes?: {[attrName: string]: AttributeValue|undefined|null}|undefined,
    content?: TextOrHtml|TextOrHtml[]): SafeHtml {
  verifyTagName(tagName);
  return createSafeHtmlTag(tagName, attributes, content);
}

const VALID_NAMES_IN_TAG = /^[a-zA-Z0-9-]+$/;

/**
 * Tags which are unsupported via safeHtmlLegacyCreate(). They might be
 * supported via a tag-specific create method. These are tags which might
 * require a TrustedResourceUrl in one of their attributes or a restricted type
 * for their content.
 */
// Using an Array instead of native Set, which brings 4k of polyfill in ES2012.
const NOT_ALLOWED_TAG_NAMES = [
  'APPLET', 'BASE', 'EMBED', 'IFRAME', 'LINK', 'MATH', 'META', 'OBJECT',
  'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE'
];

// Using an Array instead of native Set, which brings 4k of polyfill in ES2012.
const VOID_TAG_NAMES = [
  'AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT',
  'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
];

/**
 * Set of attributes containing URL as defined at
 * http://www.w3.org/TR/html5/index.html#attributes-1.
 */
// Using an Array instead of native Set, which brings 4k of polyfill in ES2012.
const URL_ATTRIBUTES =
    ['action', 'cite', 'formaction', 'href', 'manifest', 'poster', 'src'];

/**
 * Verifies if the tag name is valid and if it doesn't change the context.
 * E.g. STRONG is fine but SCRIPT throws because it changes context. See
 * safeHtmlLegacyCreate for an explanation of allowed tags.
 * @throws {!Error} If invalid tag name is provided.
 */
function verifyTagName(tagName: string) {
  if (!VALID_NAMES_IN_TAG.test(tagName)) {
    throw new Error(
        process.env.NODE_ENV !== 'production' ?
            `Invalid tag name <${tagName}>.` :
            '');
  }
  if (NOT_ALLOWED_TAG_NAMES.includes(tagName.toUpperCase())) {
    throw new Error(
        process.env.NODE_ENV !== 'production' ?
            `Tag name <${tagName}> is not allowed for SafeHtml.` :
            '');
  }
}

function htmlify(content: TextOrHtml[]): SafeHtml[] {
  return content.map(
      (value) => isHtml(value) ? value : htmlEscape(String(value)));
}

/**
 * Like safeHtmlLegacyCreate() but does not restrict which tags can be
 * constructed.
 * @throws {!Error} If invalid or unsafe attribute name or value is provided, or
 *     content for void tag is provided.
 */
function createSafeHtmlTag(
    tagName: string,
    attributes?: {[attrName: string]: AttributeValue|undefined|null}|undefined,
    content?: TextOrHtml|TextOrHtml[]): SafeHtml {
  let result = `<${tagName}`;
  result += stringifyAttributes(tagName, attributes);

  if (content == null) {
    content = [];
  } else if (!Array.isArray(content)) {
    content = [content];
  }

  if (VOID_TAG_NAMES.includes(tagName.toUpperCase())) {
    if (process.env.NODE_ENV !== 'production') {
      if (content.length > 0) {
        throw new Error(`Void tag <${tagName}> does not allow content.`);
      }
    }
    result += '>';
  } else {
    const html = concatHtmls(htmlify(content));
    result += '>' + html.toString() + '</' + tagName + '>';
  }

  return createHtml(result);
}

/**
 * Creates a string with attributes to insert after tagName.
 * @throws {!Error} If attribute value is unsafe for the given tag and
 *     attribute.
 * @package
 */
function stringifyAttributes(
    tagName: string,
    attributes?: {[attrName: string]: AttributeValue|undefined|null}|
    undefined): string {
  let result = '';
  if (attributes) {
    // Using `in` instead of `of` to not pay the polyfill. -> -1756B in ES2012
    for (const name in attributes) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#Using_hasOwnProperty_as_a_property_name
      if (Object.prototype.hasOwnProperty.call(attributes, name)) {
        if (!VALID_NAMES_IN_TAG.test(name)) {
          throw new Error(
              process.env.NODE_ENV !== 'production' ?
                  `Invalid attribute name "${name}".` :
                  '');
        }
        const value = attributes[name];
        if (value == null) {
          continue;
        }
        result += ' ' + getAttrNameAndValue(tagName, name, value);
      }
    }
  }
  return result;
}

function getAttrNameAndValue(
    tagName: string, name: string,
    value: AttributeValue|undefined|null): string {
  if (/^on/i.test(name)) {
    throw new Error(
        process.env.NODE_ENV !== 'production' ?
            `Attribute "${
                name} is forbidden. Inline event handlers can lead to XSS.` :
            '');
    // URL attributes handled differently according to tag.
  } else if (URL_ATTRIBUTES.includes(name.toLowerCase())) {
    if (typeof value === 'string') {
      value = sanitizeJavaScriptUrl(value) || 'about:invalid#zClosurez';
    } else {
      throw new Error(
          process.env.NODE_ENV !== 'production' ?
              `Attribute "${name}" on tag "${
                  tagName} requires a string, value '${value}' given.` :
              '');
    }
  }
  if (isHtml(value)) {
    value = String(value);
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(
        process.env.NODE_ENV !== 'production' ?
            `String or number value expected, got ${typeof value} with value '${
                value}' given.` :
            '');
  }
  return `${name}="${htmlEscape(String(value))}"`;
}
