# APIs

## Builders

Below are all the builders we currently provide.

### `SafeHtml`

Note: This type wraps the
[TrustedHTML](https://developer.mozilla.org/en-US/docs/Web/API/TrustedHTML)
Trusted Types value.

#### Escaping HTML entities

Escaping all HTML entities will make sure that the result is always interpreted
as text when used in an HTML context.

```typescript
import {htmlEscape} from 'safevalues';

const html = htmlEscape('<img src=a onerror="javascript:alert()">');
// SafeHtml{'&lt;img src=a onerror=&quot;javascript:alert()&quot;&gt'}
```

#### HTML sanitizer

An HTML sanitizer can take a user-controlled value and sanitize it to produce a
SafeHtml instance.

```typescript
import {sanitizeHtml} from 'safevalues';

const html = sanitizeHtml('<article>my post <script>alert(0)</script></article>');
// SafeHtml{'<article>my post</article>}
```

#### Templating language

For more complex HTML constructions, use a dedicated HTML templating system
compatible with `safevalues` like [Lit](https://lit.dev).

### `SafeScript`

Note: This type wraps the
[TrustedScript](https://developer.mozilla.org/en-US/docs/Web/API/TrustedScript)
Trusted Types value.

#### Building a script from a literal value

There can be a need to defer the evaluation of a piece of JavaScript. By
preventing any interpolation in the script's value we ensure it can never
contain user data.

```typescript
import {safeScript} from 'safevalues';

const script = safeScript`return this;`;
// SafeScript{'return this;'}
```

### `TrustedResourceUrl`

Note: This type wraps the
[TrustedScriptURL](https://developer.mozilla.org/en-US/docs/Web/API/TrustedScriptURL)
Trusted Types value.

#### Building a URL from a literal value with limited interpolation

Script URLs are potentially very dangerous as they allow to execute code in the
current origin. Only knowing the origin from which a url is from is not
sufficient to ensure its safety as many domains have certain paths that
implement open-redirects to arbitrary URLs.

To ensure the safety of script URLs, we ensure that the developer knows the full
origin (either by fully specifying it or by using the current origin implicitly
with a path absolute url) as well as the path (no relative URLs are allowed &
all interpolations are passed to `encodeURIComponent`)

```typescript
import {trustedResourceUrl} from 'safevalues';

const url1 = trustedResourceUrl`/static/js/main.js`;
// TrustedResourceURL{'/static/js/main.js'}

const env = 'a/b';
const opt = 'min&test=1';
const url2 = trustedResourceUrl`/static/${env}/js/main.js?opt=${opt}`;
// TrustedResourceURL{'/static/a%2Fb/js/main.js?opt=min%26test%3D1'}
```

### `SafeStyleSheet`

#### Building a style sheet from a literal value with some banned characters

Note: This type doesn't wrap a Trusted Types value.

```typescript
import {safeStyleSheet, concatStyleSheets} from 'safevalues';

const styleSheet1 = safeStyleSheet`a { color: navy; }`;
// SafeStyleSheet{'a {color: navy;}'}
const styleSheet2 = safeStyle`b { color: red; }`;

concatStyles([styleSheet1, styleSheet2]);
// SafeStyleSheet{'a {color: navy;}b { color: red; }'}
```

## Usage with browsers that don't support Trusted Types

When Trusted Types are not available, the library will automatically return
simple objects that behave identically to Trusted Types, that is they don't
inherit string functions, and only stringify to their inner value.

While this doesn't give as strong assurance in browsers that do not support
Trusted Types, it allows you to preserve the same functional behaviour and
abstract away the fact that some browser might not support Trusted Types.

## A note on literals

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
This means that you cannot assign a Trusted Types value to a sink directly.

While `safety-web` can recognise direct assignments to dangerous sinks, we
recommend using one of the dedicated wrappers from `safevalues/dom` we provide
as they don't require you to cast the value.

### Assigning safe types to DOM sinks

For instance, if you want to assign a `SafeHtml` value to the `innerHTML`
property of an element, you can use the `setElementInnerHtml` function from
`safevalues/dom`:

```typescript
import {sanitizeHtml} from 'safevalues';
import {setElementInnerHtml} from 'safevalues/dom';

const el = document.createElement('div');
const html = sanitizeHtml('<article>my post <script>alert(0)</script></article>');
setElementInnerHtml(el, html);  // Trusted Types and safety-web compatible
```

`safevalues/dom` functions are Trusted Types compatible, and safety-web
compatible.

### Remove `javascript:` URLs sink assignments

Certain DOM APIs which take URLs can be attacked and lead to XSS, when passed an
attacker controlled `javascript:` URL. Trusted Types and CSP offer mechanism to
block *navigations* to `javascript:` URLs
([Trusted Types' `require-trusted-types-for` Pre-Navigation check](https://w3c.github.io/webappsec-trusted-types/dist/spec/#require-trusted-types-for-pre-navigation-check),
[CSP's default, disabled with `unsafe-inline`](https://w3c.github.io/webappsec-csp/#should-block-navigation-request)).
Both these mechanisms require a compatible browser and app to be effective.

`safevalues/dom` wrappers protect individual sink *assignments* and don't
require app level compatibility nor browser compatibility. Wrappers detect
`javascript:` URL usages at assignment time, which is easier to detect than
exercising navigations in tests. They improve confidence that your app will be
compatible with Trusted Types and CSP's `javascript:` navigation protections.

```typescript
import {setLocationHref} from 'safevalues/dom';

let userControlledUrl = 'https://github.com/google/safevalues';
setLocationHref(document.location, userControlledUrl);  // OK
userControlledUrl = 'javascript:evil()';
setLocationHref(document.location, userControlledUrl);  // Blocked
```

`safety-web` will – in the future – provide a rule to enforce that all DOM URL
sinks are accessed using the `safevalues/dom` wrappers.

## Safety-web false positives

`safety-web` will sometimes report false positives, in particular in loosely
typed JavaScript code. For instance, safety-web may complain if you're setting a
`src` property, e.g. `myImg.src = value;`, and it can't tell if `myImg` is an
`HTMLImageElement` or `HTMLScriptElement`.

One way to work around this is to improve the typing of your code, but this is
not always possible. safevalues provides `setElementAttribute`, a generic
attribute setter that can be used to set security-sensitive attributes *and* non-sensitive
attributes. `setElementAttribute` performs a runtime check on the
element and attribute name to ensure that the attribute is safely set.

Example:

```
import {setElementAttribute} from 'safevalues/dom';
import {trustedResourceUrl} from 'safevalues';

// myImg is of type unknown, but at runtime it's an HTMLImageElement.
declare const myImg: unknown

myImg.src = value;  // safety-web will complain here. Use setElementAttribute instead:
setElementAttribute(myImg, 'src', value);  // This works at runtime, and is not flagged by safety-web.

// myScript is of type unknown, but at runtime it's an HTMLScriptElement.
declare const myScript: unknown
setElementAttribute(myScript, 'src', 'https://attacker.com/script.js');  // This is not flagged by safety-web, but will be blocked at runtime because setting a script src requires a TrustedResourceUrl, not a plain string.

// Instead:
setElementAttribute(myScript, 'src', trustedResourceUrl`https://myapp.com/script.js');  // This is not flagged by safety-web, and will work at runtime.
```

You should use the right safe type for the right element-attribute pair. For
instance:

```
const myScript = document.createElement('script');
`setElementAttribute(myScript, 'src', safeScript`https://myapp.com/script.js');
```

is incorrect, because a `script` element's `src` attribute should be a
`TrustedResourceUrl`, not a `SafeScript`.

## Reviewed and legacy conversions

There are certain situations when migrating a codebase to be safe using Trusted
Types can be difficult because it requires changing large parts of the code
together or because the provided builders are too restrictive for some
particular usage.

To help with these migrations, we provide two additional sets of functions that
can reduce the impact of the issues above.

WARNING: Make sure you use `safety-web` to keep track of how your code is using
these functions.

More information:
[Restricted functions documentation](https://github.com/google/safevalues/tree/main/src/restricted).
