/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl';

/** Safely parses a string using the HTML parser. */
export function parseHtml(parser: DOMParser, html: SafeHtml): HTMLDocument {
  return parseFromString(parser, html, 'text/html');
}

/** Safely parses a string using the HTML or XML parser. */
export function parseFromString(
    parser: DOMParser, content: SafeHtml,
    contentType: DOMParserSupportedType): Document {
  return parser.parseFromString(unwrapHtml(content) as string, contentType);
}
