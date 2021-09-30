# Why does this library exist?

And why not just Closure's `goog.html.*` types ?

When this library was initially created, TypeScript was not as common as it is
now & there was a need to create for a set of types that did not depend on
Closure and could be used in TypeScript (both internally and externally).

When it became clear that all of google3 would migrate to TypeScript (end of
2019), we realized we would likely have to converge this library with the
Closure types (see go/tsjs-safetypes). We decided to invest into this new
library rather than trying to port the Closure library due to several key
differences with Closure

-   The code is already in TypeScript, making it easier to serve external use
    cases (TS, Closure, plain JS)
-   The API expresses constants using language syntax (Template literals) rather
    than relying on the compiler through `goog.string.Const`.
-   All functions in this package have or will go through the
    go/closure-api-review process to ensure simplicity, consistency, quality of
    our APIs.
-   The types don't carry any functionality (static or instance methods), making
    it possible for us to alias native Trusted Types in the long term, as well
    as making them generally easier to optimize for the compiler.

We are actively working on migrating google3 code to this library, but you might
still encounter some issues due to the fact that we have two sets of types
during the migration. We wrote [this guide](../compat/README.md) to help you
resolve any issues you might encounter.
