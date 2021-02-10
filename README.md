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
import {script} from 'safevalues';

const script = script`return this;`;
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
import {scriptUrl} from 'safevalues';

const url1 = scriptUrl`/static/js/main.js`;
// TrustedScriptURL{'/static/js/main.js'}

const env = 'a/b';
const opt = 'min&test=1';
const url2 = scriptUrl`/static/${env}/js/main.js?opt=${opt}`;
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
[no awareness of Trusted Types](https://github.com/microsoft/TypeScript/issues/30024).
This means that you cannot assign a Trusted Type value to a sink directly.

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
eval(unwrapScriptForSink(script)); // works!
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

## Reviewed and legacy conversions

There are certain situations when migrating a codebase to be safe using Trusted
Types can be difficult because it requires changing large parts of the code
together or because the provided builders are too restrictive for some
particular usage.

To help with these migrations, we provide two additional sets of functions that
can reduce the impact of the issues above.

WARNING: Make sure you use `tsec` to keep track of how your code is using these
functions.

### Legacy conversions

When migrating from using string values to using Trusted Types, we often want to
move the "sensitive" part of the code from where the value is used (`innerHTML`,
`eval`, ect..) to where the value is constructed. This can be difficult as there
is not always a direct path from creation to usage. Successfully changing the
code might require updating many files at once.

To avoid this issue, we provide a conversion from string -> Trusted Type that is
unsafe, but can be used to make the code compatible with Trusted Type where the
value is used. This function can then be "moved up" closer to where the values
are created in independent changes. Once the conversion is in a place where the
context makes it possible to construct the value safely, it can be removed
completely.

```typescript
import {legacyConversionToScriptUrl} from 'safevalues/unsafe/legacy';
import {unwrapScriptUrlForSink} from 'safevalues';

// TODO: move legacyConversion to caller
script.src = unwrapScriptUrlForSink(legacyConversionToScriptUrl(url));
```

### Reviewed conversions

When creating Trusted Types, you might run into some use cases where the
builders that are provided in this package don't match the needs of the
particular application. Sometimes, the use case is narrow enough that it does
not make sense to provide a library function. In these cases, if the context
makes it obvious that the code cannot be misused to create unsafe values.

If you are in a browser that has native support for TrustedTypes, you can create
a new policy, add it to your headers and add an extensive comment explaining why
it is safe to do so.

If you are using tsec however, you can directly use a reviewed conversion which
will let you create a polyfilled value & force you to provide a justification.

```typescript
import {scriptFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';
import {unwrapScript} from 'safevalues';

if (document.domain === '') {
    const scriptText = scriptFromStringKnownToSatisfyTypeContract(
        userInput,
        `Even though the input is user controller, the wrapping if statement
         ensures that this code is only ever run in a sandboxed origin`);
    scriptEl.text = unwrapScriptForSink(scriptText);
}
```
