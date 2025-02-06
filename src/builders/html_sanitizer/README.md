# HTML Sanitizer

## Overview

This directory contains the implementation of an HTML sanitizer which is
compatible with the safevalues types (and by extension, with Trusted Types).
This HTML sanitizer is configured with a policy that defines how HTML tags and
attributes are sanitized.

safevalues' `sanitizeHtml`, `sanitizeHtmlToFragment`, and
`sanitizeHtmlAssertUnchanged` functions use an HTML sanitizer with a default
base sanitization policy.

The Sanitizer builder API lets you define Sanitizer instances that ban
additional elements and attributes on top of the default policy. There is no
builder available that lets you create arbitrarily looser policies than the
default policy. At most, `style`, `id`, `data-*`, and `class` attributes can be
allowed on top of the default policy.

## Sanitizer methods

All sanitizer instances (default and custom built) expose 3 methods:

*   `sanitize(html: string): SafeHtml` sanitizes a string following the policy,
    returning `SafeHtml`.

*   `sanitizeToFragment(html: string): DocumentFragment` performs the same
    sanitization as `sanitize`, but returns a `DocumentFragment`.

    This method should be preferred over `sanitize` when the result is assigned
    to a Node DOM API like `Node.appendChild`. Doing so is more efficient than
    assigning `SafeHtml` to `Element.innerHTML` as it saves an HTML
    serialization/deserialization.

*   `sanitizeAssertUnchanged(html: string): SafeHtml` is similar to `sanitize`
    but throws if parts of the input is sanitized away.

## Default sanitizer usage

```typescript
import {sanitizeHtml} from 'safevalues';
import {documentWrite} from 'safevalues/dom';

/**
 * Shows an HTML error snippet coming from an untrusted source.
 */
function showError(errorSnippet: string) {
  documentWrite(document, sanitizeHtml(`<div>Reported error:<br> ${errorSnippet}<div>`));
}
```

## Default policy

The default policy defines allowed tags and attributes (sometimes conditioned to
the tag they're used in). The policy is allowlist based. The policy is defined
in accordance with the
[sanitizer_table](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts)
declaration:

A tag is allowed if and only if:

*   it's part of the
    [`allowedElements`](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts#L17)

    OR

*   it has a key in the
    [`elementPolicies`](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts#L35)

An attribute is allowed if and only if:

*   it's
    [globally allowed](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts#L98)
    or has a
    [global attribute policy](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts#L199)

    OR

*   it's
    [allowed for the element](https://github.com/google/safevalues/blob/main/src/builders/html_sanitizer/sanitizer_table/default_sanitizer_table.ts#L35)
    being considered

Attribute values are preserved, sanitized normalized or dropped following the
policy (`AttributePolicyAction`).

## Sanitizer builder API

The sanitizer builder API can be used to ban additional elements and attributes.
Example:

```typescript
// Only allows <article> elements
const sanitizer = new HtmlSanitizerBuilder()
                            .onlyAllowElements(new Set<string>(['article']))
                            .build();
```

If needed, `style`, `id`, `data-`, or `class` attributes can be allowed.
Example:

```typescript
// Allows some data-* attributes
const sanitizer = new HtmlSanitizerBuilder()
                            .allowDataAttributes(['data-foo', 'data-bar'])
                            .build();

// Allow any data-* attributes
const sanitizer = new HtmlSanitizerBuilder()
                            .allowDataAttributes()
                            .build();
```

```typescript
// Allow class and id attributes
const sanitizer = new HtmlSanitizerBuilder()
                            .allowClassAttributes()
                            .allowIdAttributes()
                            .build();
```
