/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev.js';
import {
  createHtmlInternal,
  SafeHtml,
  unwrapHtml,
} from '../../internals/html_impl.js';

/** Safely parses a string using the HTML parser. */
export function domParserParseHtml(
  parser: DOMParser,
  html: SafeHtml,
): Document {
  return domParserParseFromString(parser, html, 'text/html');
}

/**
 * Safely parses a string using the XML parser. If the XML document is found to
 * contain any elements from the HTML or SVG namespaces, an error is thrown for
 * security reasons.
 */
export function domParserParseXml(parser: DOMParser, xml: string): XMLDocument {
  const doc = domParserParseFromString(
    parser,
    createHtmlInternal(xml),
    'text/xml',
  );

  const iterator = document.createNodeIterator(doc, NodeFilter.SHOW_ELEMENT);

  let currentNode: Node | null;
  while ((currentNode = iterator.nextNode())) {
    const ns = (currentNode as Element).namespaceURI;
    if (isUnsafeNamespace(ns)) {
      let message = 'unsafe XML';
      if (process.env.NODE_ENV !== 'production') {
        message += ` - attempted to parse an XML document containing an element with namespace ${ns}. Parsing HTML, SVG or MathML content is unsafe because it may lead to XSS when the content is appended to the document.`;
      }
      throw new Error(message);
    }
  }

  return doc;
}

/**
 * Checks if an element has one of: HTML, SVG or MathML namespace.
 * Appending elements with these namespaces to the document may lead to XSS.
 */
function isUnsafeNamespace(ns: string | null): boolean {
  return (
    ns === 'http://www.w3.org/1999/xhtml' ||
    ns === 'http://www.w3.org/2000/svg' ||
    ns === 'http://www.w3.org/1998/Math/MathML'
  );
}

/** Safely parses a string using the HTML or XML parser. */
export function domParserParseFromString(
  parser: DOMParser,
  content: SafeHtml,
  contentType: DOMParserSupportedType,
): Document {
  return parser.parseFromString(unwrapHtml(content) as string, contentType);
}
