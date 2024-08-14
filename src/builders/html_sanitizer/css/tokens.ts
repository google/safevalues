/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview List of tokens that can be produced by the CSS tokenizer.
 */

export enum CssTokenKind {
  AT_KEYWORD,
  CDC,
  CDO,
  CLOSE_CURLY,
  CLOSE_PAREN,
  CLOSE_SQUARE,
  COLON,
  COMMA,
  DELIM,
  DIMENSION,
  EOF,
  FUNCTION,
  HASH,
  IDENT,
  NUMBER,
  OPEN_CURLY,
  OPEN_PAREN,
  OPEN_SQUARE,
  PERCENTAGE,
  SEMICOLON,
  STRING,
  WHITESPACE,
}

/**
 * At-keyword token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-at-keyword-token
 */
export interface AtKeywordToken {
  tokenKind: CssTokenKind.AT_KEYWORD;
  name: string;
}

/**
 * CDC (Comment Delimiter Close) token. Represents `"-->"`.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdc-token
 */
export interface CdcToken {
  tokenKind: CssTokenKind.CDC;
}

/**
 * CDO (Comment Delimiter Open) token. Represents `"<!--"`.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdo-token
 */
export interface CdoToken {
  tokenKind: CssTokenKind.CDO;
}

/**
 * Close curly bracket token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-curly
 */
export interface CloseCurlyToken {
  tokenKind: CssTokenKind.CLOSE_CURLY;
}

/**
 * Close parenthesis token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-paren
 */
export interface CloseParenToken {
  tokenKind: CssTokenKind.CLOSE_PAREN;
}

/**
 * Close square bracket token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-square
 */
export interface CloseSquareToken {
  tokenKind: CssTokenKind.CLOSE_SQUARE;
}

/**
 * Colon token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-colon-token
 */
export interface ColonToken {
  tokenKind: CssTokenKind.COLON;
}

/**
 * Comma token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-comma-token
 */
export interface CommaToken {
  tokenKind: CssTokenKind.COMMA;
}

/**
 * Delim token.
 *
 * It has a value composed of a single code point.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-delim-token
 */
export interface DelimToken {
  tokenKind: CssTokenKind.DELIM;
  codePoint: string;
}

/**
 * Dimension token. (for values such as "10px")
 *
 * The CSS spec requires to also store a flag whether the dimension is an
 * integer or not. We don't need this information for sanitization or
 * serialization, so we'll just ignore it. We also don't store the numeric
 * value of the dimension token; instead we'll just store the original string
 * representation and will always serialize it back.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-dimension
 */
export interface DimensionToken {
  tokenKind: CssTokenKind.DIMENSION;
  repr: string;
  dimension: string;
}

/**
 * EOF token. Always the last token produced by the tokenizer.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-eof-token
 */
export interface EofToken {
  tokenKind: CssTokenKind.EOF;
}

/**
 * Function token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-function-token
 */
export interface FunctionToken {
  tokenKind: CssTokenKind.FUNCTION;
  lowercaseName: string;
}

/**
 * Hash token.
 *
 * Per spec, the hash token should also have a type flag with value either "id"
 * or "unrestricted". We don't need this information neither for sanitization
 * nor for serialization, so we'll just ignore it.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-hash-token
 */
export interface HashToken {
  tokenKind: CssTokenKind.HASH;
  value: string;
}

/**
 * Identifier token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-ident-token
 */
export interface IdentToken {
  tokenKind: CssTokenKind.IDENT;
  ident: string;
}

/**
 * Number token.
 *
 * The CSS spec requires to also store a flag whether the number is an integer
 * or not. We don't need this information for sanitization or serialization,
 * so we'll just ignore it. We also don't store the numeric value of the number
 * token; instead we'll just store the original string representation and will
 * always serialize it back.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-number-token
 */
export interface NumberToken {
  tokenKind: CssTokenKind.NUMBER;
  repr: string;
}

/**
 * Open curly bracket token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-curly
 */
export interface OpenCurlyToken {
  tokenKind: CssTokenKind.OPEN_CURLY;
}

/**
 * Open parenthesis token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-paren
 */
export interface OpenParenToken {
  tokenKind: CssTokenKind.OPEN_PAREN;
}

/**
 * Open square bracket token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-square
 */
export interface OpenSquareToken {
  tokenKind: CssTokenKind.OPEN_SQUARE;
}

/**
 * Percentage token. (for values such as "10%")
 *
 * The CSS spec requires to also store a flag whether the percentage is an
 * integer or not. We don't need this information for sanitization or
 * serialization, so we'll just ignore it. We also don't store the numeric
 * value of the percentage token; instead we'll just store the original string
 * representation and will always serialize it back.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage
 */
export interface PercentageToken {
  tokenKind: CssTokenKind.PERCENTAGE;
  repr: string;
}

/**
 * Semicolon token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-semicolon-token
 */
export interface SemicolonToken {
  tokenKind: CssTokenKind.SEMICOLON;
}

/**
 * String token.
 *
 * The CSS spec also defines a bad-string token, which is not included here
 * because it serves no value for the purposes of the CSS sanitizer. Instead
 * we'll emit just an empty string.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-string-token
 */
export interface StringToken {
  tokenKind: CssTokenKind.STRING;
  value: string;
}

/**
 * Whitespace token.
 *
 * https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-whitespace-token
 */
export interface WhitespaceToken {
  tokenKind: CssTokenKind.WHITESPACE;
}

/**
 * A token produced by the CSS tokenizer.
 */
export type CssToken =
  | AtKeywordToken
  | CdcToken
  | CdoToken
  | CloseCurlyToken
  | CloseParenToken
  | CloseSquareToken
  | ColonToken
  | CommaToken
  | DelimToken
  | DimensionToken
  | EofToken
  | FunctionToken
  | HashToken
  | IdentToken
  | NumberToken
  | OpenCurlyToken
  | OpenParenToken
  | OpenSquareToken
  | PercentageToken
  | SemicolonToken
  | StringToken
  | WhitespaceToken;
