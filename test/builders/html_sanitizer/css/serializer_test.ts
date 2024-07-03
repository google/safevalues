/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  serializeToken,
  serializeTokens,
} from '../../../../src/builders/html_sanitizer/css/serializer';
import {ROUND_TRIP_TEST_CASES} from '../../../../src/builders/html_sanitizer/css/serializer_test_data';
import {tokenizeCss} from '../../../../src/builders/html_sanitizer/css/tokenizer';
import {
  CssToken,
  CssTokenKind,
} from '../../../../src/builders/html_sanitizer/css/tokens';

describe('serializeToken', () => {
  interface TestCase {
    name: string;
    token: CssToken;
    expected: string;
  }
  const TEST_CASES: TestCase[] = [
    {
      name: 'at keyword',
      token: {tokenKind: CssTokenKind.AT_KEYWORD, name: 'foo'},
      expected: '@foo',
    },
    {
      name: 'at keyword with escaped characters',
      token: {tokenKind: CssTokenKind.AT_KEYWORD, name: 'foo@<>\n\0'},
      expected: String.raw`@foo\40 \3c \3e \a \0 `,
    },
    {
      name: 'CDC token',
      token: {tokenKind: CssTokenKind.CDC},
      expected: '-->',
    },
    {
      name: 'CDO token',
      token: {tokenKind: CssTokenKind.CDO},
      expected: '<!--',
    },
    {
      name: 'close curly',
      token: {tokenKind: CssTokenKind.CLOSE_CURLY},
      expected: '}',
    },
    {
      name: 'close paren',
      token: {tokenKind: CssTokenKind.CLOSE_PAREN},
      expected: ')',
    },
    {
      name: 'close square',
      token: {tokenKind: CssTokenKind.CLOSE_SQUARE},
      expected: ']',
    },
    {
      name: 'colon',
      token: {tokenKind: CssTokenKind.COLON},
      expected: ':',
    },
    {
      name: 'comma',
      token: {tokenKind: CssTokenKind.COMMA},
      expected: ',',
    },
    {
      name: 'delim token: @',
      token: {tokenKind: CssTokenKind.DELIM, codePoint: '@'},
      expected: '@',
    },
    {
      name: 'delim token: <',
      token: {tokenKind: CssTokenKind.DELIM, codePoint: '<'},
      expected: '<',
    },
    {
      name: 'delim token: >',
      token: {tokenKind: CssTokenKind.DELIM, codePoint: '>'},
      expected: '>',
    },
    {
      name: 'dimension token',
      token: {tokenKind: CssTokenKind.DIMENSION, repr: '123', dimension: 'px'},
      expected: '123px',
    },
    {
      name: 'dimension token with a negative number',
      token: {tokenKind: CssTokenKind.DIMENSION, repr: '-123', dimension: 'px'},
      expected: '-123px',
    },
    {
      name: 'dimension token with a number starting with a .',
      token: {tokenKind: CssTokenKind.DIMENSION, repr: '.123', dimension: 'px'},
      expected: '.123px',
    },
    {
      name: 'dimension token with escaped characters in dimension',
      token: {
        tokenKind: CssTokenKind.DIMENSION,
        repr: '123',
        dimension: 'p<>x',
      },
      expected: String.raw`123p\3c \3e x`,
    },
    {
      name: 'eof token',
      token: {tokenKind: CssTokenKind.EOF},
      expected: '',
    },
    {
      name: 'function token',
      token: {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'foo'},
      expected: 'foo(',
    },
    {
      name: 'function token with escaped characters',
      token: {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'foo<>'},
      expected: String.raw`foo\3c \3e (`,
    },
    {
      name: 'hash token',
      token: {tokenKind: CssTokenKind.HASH, value: 'foo'},
      expected: '#foo',
    },
    {
      name: 'hash token with escaped characters',
      token: {tokenKind: CssTokenKind.HASH, value: 'foo<>'},
      expected: String.raw`#foo\3c \3e `,
    },
    {
      name: 'hash token starting wih a digit',
      token: {tokenKind: CssTokenKind.HASH, value: '123'},
      expected: String.raw`#\31 23`,
    },
    {
      name: 'hash token starting wih a dash',
      token: {tokenKind: CssTokenKind.HASH, value: '-123'},
      expected: String.raw`#\2d 123`,
    },
    {
      name: 'ident token',
      token: {tokenKind: CssTokenKind.IDENT, ident: 'foo'},
      expected: 'foo',
    },
    {
      name: 'ident token with escaped characters',
      token: {tokenKind: CssTokenKind.IDENT, ident: 'foo<>\0'},
      expected: String.raw`foo\3c \3e \0 `,
    },
    {
      name: 'ident token starting with a dash',
      token: {tokenKind: CssTokenKind.IDENT, ident: '-bar'},
      expected: String.raw`\2d bar`,
    },
    {
      name: 'ident token starting with a digit',
      token: {tokenKind: CssTokenKind.IDENT, ident: '123'},
      expected: String.raw`\31 23`,
    },
    {
      name: 'ident starting with a @',
      token: {tokenKind: CssTokenKind.IDENT, ident: '@foo'},
      expected: String.raw`\40 foo`,
    },
    {
      name: 'number',
      token: {tokenKind: CssTokenKind.NUMBER, repr: '123'},
      expected: '123',
    },
    {
      name: 'number with a negative sign',
      token: {tokenKind: CssTokenKind.NUMBER, repr: '-123'},
      expected: '-123',
    },
    {
      name: 'number with a decimal point',
      token: {tokenKind: CssTokenKind.NUMBER, repr: '123.456'},
      expected: '123.456',
    },
    {
      name: 'number with exponent',
      token: {tokenKind: CssTokenKind.NUMBER, repr: '123e456'},
      expected: '123e456',
    },
    {
      name: 'open curly',
      token: {tokenKind: CssTokenKind.OPEN_CURLY},
      expected: '{',
    },
    {
      name: 'open paren',
      token: {tokenKind: CssTokenKind.OPEN_PAREN},
      expected: '(',
    },
    {
      name: 'open square',
      token: {tokenKind: CssTokenKind.OPEN_SQUARE},
      expected: '[',
    },
    {
      name: 'percentage token',
      token: {tokenKind: CssTokenKind.PERCENTAGE, repr: '123'},
      expected: '123%',
    },
    {
      name: 'semicolon',
      token: {tokenKind: CssTokenKind.SEMICOLON},
      expected: ';',
    },
    {
      name: 'string - empty',
      token: {tokenKind: CssTokenKind.STRING, value: ''},
      expected: '""',
    },
    {
      name: 'string',
      token: {tokenKind: CssTokenKind.STRING, value: 'foo'},
      expected: '"foo"',
    },
    {
      name: 'string with escaped characters',
      token: {tokenKind: CssTokenKind.STRING, value: 'foo<>'},
      expected: String.raw`"foo\3c \3e "`,
    },
    {
      name: 'string with a null character',
      token: {tokenKind: CssTokenKind.STRING, value: 'foo\0abc'},
      expected: String.raw`"foo\0 abc"`,
    },
    {
      name: 'whitespace',
      token: {tokenKind: CssTokenKind.WHITESPACE},
      expected: ' ',
    },
  ];

  for (const testCase of TEST_CASES) {
    it(`serializes ${JSON.stringify(testCase.name)} correctly`, () => {
      expect(serializeToken(testCase.token)).toEqual(testCase.expected);
    });
  }
});

describe('serializeTokens', () => {
  // Serialization in the CSS spec is defined in an interesting way:
  //
  // > This specification does not define how to serialize CSS in general (...)
  // > The only requirement for serialization is that it must "round-trip" with
  // > parsing, that is, parsing the stylesheet must produce the same data
  // > structures as parsing, serializing, and parsing again, except for
  // > consecutive whitespace-tokens, which may be collapsed into a single
  // > token.
  //
  // Source: https://www.w3.org/TR/css-syntax-3/#serialization
  //
  // So this is exactly what we are testing here. We don't check the exact
  // serialization (as we check individual tokens in tests above), but we check
  // that the list of tokens after a roundtrip is the same.
  //
  // This should ensure that the serialization is correct, and that it is
  // stable.
  for (const {name, css} of ROUND_TRIP_TEST_CASES) {
    it(`serialization of ${name} round-trips correctly`, () => {
      const tokens = tokenizeCss(css);
      const serialized = serializeTokens(tokens);
      const afterRoundTrip = tokenizeCss(serialized);
      expect(afterRoundTrip).toEqual(tokens);
    });
  }
});
