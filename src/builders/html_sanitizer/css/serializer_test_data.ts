/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

interface TestCase {
  name: string;
  css: string;
}

/** Test cases for the round-trip tests. */
export const ROUND_TRIP_TEST_CASES: TestCase[] = [
  {
    name: 'example001.css',
    css: String.raw`
@import url(https://fonts.googleapis.com/css?family=Roboto);

div {
  font-family: Roboto;
}
span,p:has(div > span) {
  font-family: Roboto;
  font-size: 10px;
  color: red;
}
`,
  },
  {
    name: 'example002.css',
    css: String.raw`
example002 {
  0% {
    color: red;
  }
  100% {
    color: blue;
  }
}

@keyframes example002-2 {
  0% {
    color: red;
  }
  100% {
    color: blue;
  }
}

.abc {
  animation: example002 1s;
}

.qwe {
  animation: example002-2 1s;
}

.\41bas {
  animation: example002 1s;
}
`,
  },
  {
    name: 'example003.css',
    css: String.raw`
[1aa*=abc] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.a-view_expanded {
  vertical-align: top !important;
  font-size: 2.999em;
}
`,
  },
  {
    name: 'example004.css',
    css: String.raw`

div {
  color: red;
  font-size: 10px;
  font-weight: 100;
  text-align: center;
  text-decoration: underline;
  text-transform: uppercase;
  vertical-align: top;
  white-space: pre;
  width: 100px;
}

@media (min-width: 100px) {
  div {
    color: blue;
  }
}

@property --foo {
  color: red;
  syntax: "<color>";
}

\@property syntax_error;

& {
  div {
    p {
      color: blue;
      @keyframes abc {}
      @import'https://google.com';
    }
  }
}
`,
  },
];
