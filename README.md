# safevalues

Safevalues is a library to help you prevent Cross-Site Scripting vulnerabilities
in TypeScript (and JavaScript). It is meant to be used together with
[safety-web](https://github.com/google/safety-web) to provide strong security
guarantees and help you deploy
[TrustedTypes](https://w3c.github.io/trusted-types/dist/spec/) and
other CSP restrictions in your applications. Google has used these components
together to reduce DOM XSS ([paper](https://research.google/pubs/pub49950/)),
and we hope it will be useful in your codebase.

## Features

### Policy definition for building safe-by-construction Trusted Types

Trusted Types is a browser API that enables developers to control the values
that can be assigned to XSS sinks. Developers need to define a Trusted Types
policy to build these values, and then the Trusted Types API constraints these
policies.

The Trusted Types API is not opinionated on what *should be* considered safe. It
only acts as a tool for developers to mark values they can *trust*.

`safevalues` in contrast, defines functions that make security decisions on what
is safe (by construction, via escaping or sanitization), so that developers who
are not security experts don't need to.

`safevalues` produces Trusted Types (through its own policy) when available.

### Additional types and functions for sinks not covered by Trusted Types

Some DOM APIs are not covered by Trusted Types, but can also be abused; leading
to XSS or other security issues. Alternative security mechanisms such as the
`unsafe-inline` CSP protection can help to secure these APIs, but not all
browsers or apps support them.

`safevalues` defines additional types, builders, and setters to help protect
these sinks.

### DOM sink wrappers

To build a Trusted Types-compatible app and surface potential violations at
compile time, we recommend that you lint your code with
[safety-web](https://github.com/google/safety-web). safety-web bans certain DOM
APIs. `safevalues` defines wrappers around these APIs which lets you assign
Trusted Types with them.

Some wrappers don't require a particular type, but sanitize the argument they
get before they assign it to the DOM sink (e.g. `setLocationHref` from
`safevalues/dom`).

### Trusted Types polyfills

Whenever possible, `safevalues` uses Trusted Types to build its values, in order
to benefit from the runtime protection of Trusted Types. When Trusted Types is
not available, `safevalues` transparently defines its own types and your app
will continue to work.

## Known issues

### ReferenceError: Can't find variable: process

When using a bundler that performs dead-code elimination, you must ensure that
`process.env.NODE_ENV` is declared globally with either a value of `development`
or `production`. This is done in Webpack by
[specifying a mode](https://webpack.js.org/guides/production/#specify-the-mode),
in Terser using the
[--define flag](https://webpack.js.org/guides/production/#specify-the-mode) and
in Rollup using the
[rollup-plugin-define plugin](https://www.npmjs.com/package/rollup-plugin-define#usage).
See ([#212](https://github.com/google/safevalues/issues/212)).

--------------------------------------------------------------------------------

[Read on](https://github.com/google/safevalues/tree/main/src) for more
information on our APIs.
