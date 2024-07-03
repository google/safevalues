/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for the CSS tokenizer.
 *
 * No official test suite for the tokenizer exists, however there exists a CSS
 * tokenizer written by tabatkins@ (who is an editor of the CSS spec) at
 * https://tabatkins.github.io/parse-css/example.html.
 *
 * This tokenizer was used as a basis for the test cases (modulo some willful
 * violations of the spec).
 */

import {tokenizeCss} from '../../../../src/builders/html_sanitizer/css/tokenizer';
import {
  CssToken,
  CssTokenKind,
} from '../../../../src/builders/html_sanitizer/css/tokens';

describe('tokenizeCss', () => {
  interface TestCase {
    input: string;
    expected: CssToken[];
  }

  const testCases: TestCase[] = [
    {
      input: '',
      expected: [{tokenKind: CssTokenKind.EOF}],
    },
    // Whitespace
    {
      input: ' ',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: ' \r\n\f\t ',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // Comments also count as whitespace (a willful violation of the spec)
    {
      input: '/* hello! */',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // By spec, the input below should create two whitespace tokens, but we
    // merge them into one.
    {
      input: ' /* hello! */ ',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '/* unclosed comment',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '/* * { p { div:host-context(foo) { }} ',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '/*/',
      expected: [
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // Strings
    {
      input: '"hello"',
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: "'hello'",
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\65llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\65 llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\065llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\065 llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\0065llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\0065 llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\00065llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\00065 llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\000065llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'h\000065 llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'abc\azzz'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'abc\nzzz'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'abc\a def'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'abc\ndef'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"abc\a def"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'abc\ndef'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\65llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\65 llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\065llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\065 llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\0065llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\0065 llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\00065llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\00065 llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\000065llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\000065 llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`"h\0000065llo"`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'h\u00065llo'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: `"a"'b'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'a'},
        {tokenKind: CssTokenKind.STRING, value: 'b'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: `"a"/**/'b'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'a'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.STRING, value: 'b'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`'he\llo'`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: `'hello`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: `"hello`,
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'hello'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // New line inside a string creates a bad-string token (which we
      // substitute with an empty string), and the whitespace is then
      // reconsumed.
      input: '"test111\n',
      expected: [
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // Escaped literal newline is ignored.
      input: '"before\\\nafter"',
      expected: [
        {tokenKind: CssTokenKind.STRING, value: 'beforeafter'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // Hash tokens
    {
      input: '#',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '#'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '#a',
      expected: [
        {tokenKind: CssTokenKind.HASH, value: 'a'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '#a-b',
      expected: [
        {tokenKind: CssTokenKind.HASH, value: 'a-b'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '#99ccff',
      expected: [
        {tokenKind: CssTokenKind.HASH, value: '99ccff'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '#abc#def',
      expected: [
        {tokenKind: CssTokenKind.HASH, value: 'abc'},
        {tokenKind: CssTokenKind.HASH, value: 'def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // "Łódź" is a Polish city name. And also a good test case for non-ASCII
      // characters.
      input: '#Łódź',
      expected: [
        {tokenKind: CssTokenKind.HASH, value: 'Łódź'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`#\31 xyz#1xyz`,
      expected: [
        {tokenKind: CssTokenKind.HASH, value: '1xyz'},
        {tokenKind: CssTokenKind.HASH, value: '1xyz'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`#\74\65\73\74`,
      expected: [
        {tokenKind: CssTokenKind.HASH, value: 'test'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`#-abc_DEF`,
      expected: [
        {tokenKind: CssTokenKind.HASH, value: '-abc_DEF'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`#_39cąść`,
      expected: [
        {tokenKind: CssTokenKind.HASH, value: '_39cąść'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '#/**/',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '#'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // Open and close parentheses, brackets, and braces
    {
      input: '(',
      expected: [
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: ')',
      expected: [
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '()',
      expected: [
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '[',
      expected: [
        {tokenKind: CssTokenKind.OPEN_SQUARE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: ']',
      expected: [
        {tokenKind: CssTokenKind.CLOSE_SQUARE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '[]',
      expected: [
        {tokenKind: CssTokenKind.OPEN_SQUARE},
        {tokenKind: CssTokenKind.CLOSE_SQUARE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '{',
      expected: [
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '}',
      expected: [
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '{}',
      expected: [
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Numbers
    {
      input: '+',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '+'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '-'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    {
      input: '1',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123e45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e+67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123.45e+67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e-67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '1px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '1', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '123.45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123e45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '123e45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e+67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e+67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e-67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e-67-x',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e-67',
          dimension: '-x',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`123\70x`,
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`123.45e-67\70x`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '1%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123e45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e+67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123.45e+67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '123.45e-67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // If "%" is escaped, then it's a dimension token.
      input: String.raw`123.45e-67\25`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '123.45e-67',
          dimension: '%',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    {
      input: '+1',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123e45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e+67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123.45e+67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e-67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+1px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '+1', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '+123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '+123.45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123e45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '+123e45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e+67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e+67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e-67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e-67-x',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e-67',
          dimension: '-x',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`+123\70x`,
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '+123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`+123.45e-67\70x`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+1%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123e45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e+67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123.45e+67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123.45e-67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '+123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // If "%" is escaped, then it's a dimension token.
      input: String.raw`+123.45e-67\25`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '+123.45e-67',
          dimension: '%',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    {
      input: '-1',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123e45',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '-123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-1px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '-1', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '-123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '-123.45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123e45px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '-123e45', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67px',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67-x',
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e-67',
          dimension: '-x',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`-123\70x`,
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '-123', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`-123.45e-67\70x`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e-67',
          dimension: 'px',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-1%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123.45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123e45%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123e45'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123.45e67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-123.45e-67%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '-123.45e-67'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '.'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.123',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '.123'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.156e1',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '.156e1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.156e-1',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '.156e-1'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.156px',
      expected: [
        {tokenKind: CssTokenKind.DIMENSION, repr: '.156', dimension: 'px'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '.44%',
      expected: [
        {tokenKind: CssTokenKind.PERCENTAGE, repr: '.44'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // If "%" is escaped, then it's a dimension token.
      input: String.raw`-123.45e-67\25`,
      expected: [
        {
          tokenKind: CssTokenKind.DIMENSION,
          repr: '-123.45e-67',
          dimension: '%',
        },
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Comma token
    {
      input: ',',
      expected: [
        {tokenKind: CssTokenKind.COMMA},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '+123,"abc"',
      expected: [
        {tokenKind: CssTokenKind.NUMBER, repr: '+123'},
        {tokenKind: CssTokenKind.COMMA},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // CDC token
    {
      input: '-->',
      expected: [{tokenKind: CssTokenKind.CDC}, {tokenKind: CssTokenKind.EOF}],
    },
    {
      input: 'abc-->def',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'abc--'},
        {tokenKind: CssTokenKind.DELIM, codePoint: '>'},
        {tokenKind: CssTokenKind.IDENT, ident: 'def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'abc -->def',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'abc'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.CDC},
        {tokenKind: CssTokenKind.IDENT, ident: 'def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // CDO token
    {
      input: '<!--',
      expected: [{tokenKind: CssTokenKind.CDO}, {tokenKind: CssTokenKind.EOF}],
    },
    {
      input: '--abc<--def',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--abc'},
        {tokenKind: CssTokenKind.DELIM, codePoint: '<'},
        {tokenKind: CssTokenKind.IDENT, ident: '--def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'abc<!--def',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'abc'},
        {tokenKind: CssTokenKind.CDO},
        {tokenKind: CssTokenKind.IDENT, ident: 'def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Ident tokens
    {
      input: 'div',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'div'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'div_-abc',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'div_-abc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'Abc',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Abc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'łężczok',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'łężczok'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`a\41 bc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'aAbc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\{\}\(\)\41\42`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '{}()AB'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '--abc',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--abc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '--654',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--654'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '--654',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--654'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`--\41 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\41 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\041 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\0041 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\00041 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\000041 abc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Aabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\41zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\041zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\0041zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\00041zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\000041zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`\000041zabc`,
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'Azabc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Function tokens
    {
      input: '--url("abc")',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: '--url'},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '--mAtrixXY("abc")',
      expected: [
        // Function names are lowercased.
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: '--matrixxy'},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '-mAtrixXY( "abc")',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: '-matrixxy'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`--escaped\28 ("abc")`,
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: '--escaped('},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com)',
      expected: [
        // Willful violation: instead of url-token, we return function token.
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`url(https://google.com\))`,
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com)'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com      )',
      expected: [
        // Whitespace before ")" are ignored
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`URL(https:\2f\2fgoogle.com)`,
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: "url('https://google.com')",
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url("https://google.com")',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url("https://google.com" abc)',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.IDENT, ident: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    // The test cases below return bad-url-token by spec. We instead, return
    // a URL with an empty value.
    {
      input: 'url(https://google.com  abc)',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com")',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: "url(https://google.com')",
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com()',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com\x01)',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'url(https://google.com\\\n)',
      expected: [
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: ''},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      // If there's a space in front of the open paren, then a function token
      // is not created.
      input: "--with_space ('abc')",
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: '--with_space'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.STRING, value: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Colon token
    {
      input: ':',
      expected: [
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '::',
      expected: [
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '::-webkit-test',
      expected: [
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.IDENT, ident: '-webkit-test'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Semicolon token
    {
      input: ';',
      expected: [
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: ';-123.45;',
      expected: [
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.NUMBER, repr: '-123.45'},
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: ';--abc;--def;',
      expected: [
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.IDENT, ident: '--abc'},
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.IDENT, ident: '--def'},
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // At-keyword
    {
      input: '@',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '@'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@567',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '@'},
        {tokenKind: CssTokenKind.NUMBER, repr: '567'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@-567',
      expected: [
        {tokenKind: CssTokenKind.DELIM, codePoint: '@'},
        {tokenKind: CssTokenKind.NUMBER, repr: '-567'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@--567',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: '--567'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@abc',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'abc'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@abc-def',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'abc-def'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@łężczok',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'łężczok'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@abc(test)',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'abc'},
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.IDENT, ident: 'test'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`@\40 atsign`,
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: '@atsign'},
        {tokenKind: CssTokenKind.EOF},
      ],
    },

    // Snippets of CSS
    {
      input: 'a { color: red; }',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'a'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.IDENT, ident: 'color'},
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.IDENT, ident: 'red'},
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: `@media (min-width: 100px) {
  .foo {
    color: red;
  }
}
`,
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'media'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.IDENT, ident: 'min-width'},
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.DIMENSION, repr: '100', dimension: 'px'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.DELIM, codePoint: '.'},
        {tokenKind: CssTokenKind.IDENT, ident: 'foo'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.IDENT, ident: 'color'},
        {tokenKind: CssTokenKind.COLON},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.IDENT, ident: 'red'},
        {tokenKind: CssTokenKind.SEMICOLON},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: String.raw`@\69mport url(https://google.com)`,
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'import'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {tokenKind: CssTokenKind.STRING, value: 'https://google.com'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: '@import/**/url(data:text/css,*{background:red})',
      expected: [
        {tokenKind: CssTokenKind.AT_KEYWORD, name: 'import'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.FUNCTION, lowercaseName: 'url'},
        {
          tokenKind: CssTokenKind.STRING,
          value: 'data:text/css,*{background:red}',
        },
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
    {
      input: 'div,p (abc)[qwe]{zxc}',
      expected: [
        {tokenKind: CssTokenKind.IDENT, ident: 'div'},
        {tokenKind: CssTokenKind.COMMA},
        {tokenKind: CssTokenKind.IDENT, ident: 'p'},
        {tokenKind: CssTokenKind.WHITESPACE},
        {tokenKind: CssTokenKind.OPEN_PAREN},
        {tokenKind: CssTokenKind.IDENT, ident: 'abc'},
        {tokenKind: CssTokenKind.CLOSE_PAREN},
        {tokenKind: CssTokenKind.OPEN_SQUARE},
        {tokenKind: CssTokenKind.IDENT, ident: 'qwe'},
        {tokenKind: CssTokenKind.CLOSE_SQUARE},
        {tokenKind: CssTokenKind.OPEN_CURLY},
        {tokenKind: CssTokenKind.IDENT, ident: 'zxc'},
        {tokenKind: CssTokenKind.CLOSE_CURLY},
        {tokenKind: CssTokenKind.EOF},
      ],
    },
  ];

  for (const testCase of testCases) {
    it(`tokenizes ${JSON.stringify(testCase.input)} correctly`, () => {
      const actual = tokenizeCss(testCase.input);
      expect(actual).toEqual(testCase.expected);
    });
  }
});
