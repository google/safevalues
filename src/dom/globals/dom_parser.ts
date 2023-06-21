/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../environment/dev';

import {createHtmlInternal, SafeHtml, unwrapHtml} from '../../internals/html_impl';

/** Safely parses a string using the HTML parser. */
export function parseHtml(parser: DOMParser, html: SafeHtml): HTMLDocument {
  return parseFromString(parser, html, 'text/html');
}

/**
 * Safely parses a string using the XML parser. If the XML document is found to
 * contain any elements from the HTML or SVG namespaces, an error is thrown for
 * security reasons.
 */
export function parseXml(parser: DOMParser, xml: string): XMLDocument {
  const doc = parseFromString(parser, createHtmlInternal(xml), 'text/xml');

  const iterator = document.createNodeIterator(
      doc,
      NodeFilter.SHOW_ALL,
      null,
      // @ts-ignore: error TS2554: Expected 1-3 arguments, but got 4.
      false,  // This is required in IE and ignored in other browsers.
  );

  let currentNode: Node|null;
  while ((currentNode = iterator.nextNode())) {
    if (currentNode instanceof HTMLElement ||
        currentNode instanceof SVGElement) {
      let message = 'unsafe XML';
      if (process.env.NODE_ENV !== 'production') {
        message =
            `attempted to parse an XML document that embeds HTML or SVG content`;
      }
      throw new Error(message);
    }
  }

  return doc;
}

/** Safely parses a string using the HTML or XML parser. */
export function parseFromString(
    parser: DOMParser, content: SafeHtml,
    contentType: DOMParserSupportedType): Document {
  return parser.parseFromString(unwrapHtml(content) as string, contentType);
}
