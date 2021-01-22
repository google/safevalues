# safevalues

**This is not an officially supported Google product.**

WARNING: This library is still in developpment and we might make backward
incompatible changes at any moment.

This repository contains a TypeScript library that provides a set of functions
that can be use to create Trusted Types values safely.

It also contains some typed helpers to help assigning Trusted Types values to
sinks in a way compatible with [tsec](https://github.com/googleinterns/tsec).

## Builders

Below are all the builders we currently provide.

### `TrustedHTML`

#### Escaping HTML entities

Escaping all HTML entities will make sure that the result is always interpreted
as text when used in an HTML context.

```typescript
import {htmlEscape} from 'safevalues';

const html = htmlEscape('<img src=a onerror="javascript:alert()">');
// TrustedHTML{'&lt;img src=a onerror=&quot;javascript:alert()&quot;&gt'}
```

### `TrustedScript`

#### Building a script from a literal value

There can be a need to defer the evaluation of a piece of JavaScript. By
preventing any interpolation in the script's value we ensure it can never
contain user data.

```typescript
import {trustedScript} from 'safevalues';

const script = trustedScript`return this;`;
// TrustedScript{'return this;'}
```

### `TrustedScriptURL`

#### Building a URL from a literal value with limited interpolation

Script URLs are potentially very dangerous as they allow to execute code in the
current origin. Only knowing the origin from which a url is from is not
sufficient to ensure its safety as many domains have certain paths that
implement open-redirects to arbitrary URLs.

To ensure the safety of script URLs, we ensure that the developper knows the
full origin (either by fully specifying it or by using the current origin
implicitly with a path absolute url) as well as the path (no relative URLs are
allowed & all interpolations are passed to `encodeURIComponent`)

```typescript
import {trustedScriptURL} from 'safevalues';

const script1 = trustedScriptURL`/static/js/main.js`;
// TrustedScriptURL{'/static/js/main.js'}

const env = 'a/b';
const opt = 'min&test=1';
const script2 = trustedScriptURL`/static/${env}/js/main.js?opt=${opt}`;
// TrustedScriptURL{'/static/a%2Fb/js/main.js?opt=min%26test%3D1'}
```

## Use with browsers that don't support Trusted Types

When Trusted Types are not available, the library will automatically return
simple objects that behave identically to Trusted Types, that is they don't
inherit string functions, and only stringify to their inner value.

While this doesn't give as strong assurance in browsers that do not support
Trusted Types, it allows you to preserve the same functional behaviour and
abstract away the fact that some browser might not support Trusted Types.

## Note on literals

To ensure that the values we produce are safe, we design our APIs in a way to
easily make the distinction between potentially user-provided data vs
programmer-authored values, which we encode as literals (also known as
compile-time constants in other languages).

The principal mechanism we use to programmatically encode literal values is
tagged templates. This ensures that our API is easy to use as-is in JavaScript
without relying on typing tricks or additional tooling.

## Sinks

Using Trusted Types in TypeScript still has a limitation as the standard lib has
no awareness of Trusted Types. This means that you cannot assign a Trusted Type
value to a sink directly.

As explained in
[tsec's README](https://github.com/googleinterns/tsec#trusted-type-awareness-in-tsec-rules),
there are two main ways to support assigning to sinks in a way that will satisfy
the TypeScript compiler and be recognized by tsec.

### Casting the value to `string`

While we provide no explicit support for this, the values we produce will
stringify as expected, so casting them as `string` before assigning them to a
sink should mostly work as expected.

```typescript
const html: TrustedHTML = ...;
document.body.innerHTML = html as unknown as string;
```

Unfortunately, this will only work for sinks that can accept an object and
implicitly stringify it. `eval` for example is not one such sink and will just
passthrough any value passed to it that is not a string (or a `TrustedScript`
for Trusted Types enabled browsers)

```typescript
const script: TrustedScript = ...;
// This will do nothing in browser that don't support Trusted Types
eval(script as unknown as string);
```

### Using an unwrapping function

We also provide three functions that you can use to explicitly unwrap values
before passing them to sinks in a way that tsec will understand.

```typescript
import {unwrapScript} from 'safevalues';
const script: TrustedScript = ...;
eval(unwrapScript(script)); // works!
```

The unwrap functions' return type is `string&Trusted*`, which ensures that the
return value can be used without cases in places where strings are expected.
(note that including the Trusted Type in the type does nothing except document
that this function might not actually return a value that can be used as a
string, i.e. string functions are not available)

In Trusted Types enabled browsers, the unwrap functions behave like identity
functions and just return their input.

In browsers that do not support Trusted Types, the unwrap functions serve two
purposes:

-   They unwrap the objects into their string representation to avoid relying on
    the implicit stringifier behaviour.
-   They perform runtime checks to ensure the passed in value was created by the
    library, giving you similar runtime guarantees as for Trusted Types enforced
    browsers.
