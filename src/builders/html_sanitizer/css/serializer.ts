/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Exports methods for serializing CSS tokens.
 */

import {CssToken, CssTokenKind} from './tokens.js';

function escapeCodePoint(c: string): string {
  return `\\${c.codePointAt(0)!.toString(16)} `;
}

function escapeString(str: string): string {
  // We don't escape some characters to increase readability.
  return (
    '"' +
    str.replace(/[^A-Za-z0-9_/. :,?=%;-]/g, (c) => escapeCodePoint(c)) +
    '"'
  );
}

/**
 * Escapes a CSS identifier.
 *
 * @param ident The identifier to escape.
 * @return The escaped identifier.
 */
export function escapeIdent(ident: string): string {
  // We don't generally escape digits or "-" in identifiers, however we do need
  // to do this for the first character to avoid ambiguity.
  //
  // For example, the string "123" would create a valid number token, but if
  // we want to have an ident-token, it needs to be escaped as a "\31 23".
  const firstChar = /^[^A-Za-z_]/.test(ident)
    ? escapeCodePoint(ident[0])
    : ident[0];
  return (
    firstChar +
    ident.slice(1).replace(/[^A-Za-z0-9_-]/g, (c) => escapeCodePoint(c))
  );
}

/**
 * Serializes a CSS token to a string.
 *
 * @param token The token to serialize.
 * @return The serialized token.
 */
export function serializeToken(token: CssToken): string {
  switch (token.tokenKind) {
    case CssTokenKind.AT_KEYWORD:
      return `@${escapeIdent(token.name)}`;
    case CssTokenKind.CDC:
      return '-->';
    case CssTokenKind.CDO:
      return '<!--';
    case CssTokenKind.CLOSE_CURLY:
      return '}';
    case CssTokenKind.CLOSE_PAREN:
      return ')';
    case CssTokenKind.CLOSE_SQUARE:
      return ']';
    case CssTokenKind.COLON:
      return ':';
    case CssTokenKind.COMMA:
      return ',';
    case CssTokenKind.DELIM:
      // A <delim-token> containing U+005C REVERSE SOLIDUS (\) must be
      // serialized as U+005C REVERSE SOLIDUS followed by a newline. (The
      // tokenizer only ever emits such a token followed by a <whitespace-token>
      // that starts with a newline.)
      // Source: https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#serialization
      if (token.codePoint === '\\') {
        return '\\\n';
      }
      return token.codePoint;
    case CssTokenKind.DIMENSION:
      return token.repr + escapeIdent(token.dimension);
    case CssTokenKind.EOF:
      return '';
    case CssTokenKind.FUNCTION:
      return escapeIdent(token.lowercaseName) + '(';
    case CssTokenKind.HASH:
      return '#' + escapeIdent(token.value);
    case CssTokenKind.IDENT:
      return escapeIdent(token.ident);
    case CssTokenKind.NUMBER:
      return token.repr;
    case CssTokenKind.OPEN_CURLY:
      return '{';
    case CssTokenKind.OPEN_PAREN:
      return '(';
    case CssTokenKind.OPEN_SQUARE:
      return '[';
    case CssTokenKind.PERCENTAGE:
      return token.repr + '%';
    case CssTokenKind.SEMICOLON:
      return ';';
    case CssTokenKind.STRING:
      return escapeString(token.value);
    case CssTokenKind.WHITESPACE:
      return ' ';
    default:
      checkExhaustive(token);
  }
}

/**
 * Serializes a list of CSS tokens to a string.
 *
 * @param tokens The tokens to serialize.
 * @return The serialized tokens.
 */
export function serializeTokens(tokens: CssToken[]): string {
  return tokens.map(serializeToken).join('');
}

function checkExhaustive(
  value: never,
  msg = `unexpected value ${value}!`,
): never {
  throw new Error(msg);
}
