# Restricted functions

Unlike functions provided in the rest of the 'safevalues' package which aim to
be safe in all cases, the functions in this module do not provide the same
guarantees and are only provided to support specific use cases that cannot be
otherwise provided.

Since usage of these functions are designed to be restricted and require human
review, we highly recommend you only use them in conjunction with a tool like
[tsec](https://github.com/google/tsec) to help enforce these restrictions.

## Legacy conversions

When migrating from using `string` values to using Trusted Types, we often want
to move the sensitive part of the code from where the value is used
(`innerHTML`, `eval`, etc..) to where the value is constructed. This can be
difficult as there is not always a direct path from creation to usage.
Successfully changing the code might require updating many files at once.

To avoid this issue, we provide a conversion from `string` -> Trusted Type that
is unsafe, but can be used to make the code compatible with Trusted Type where
the value is used. This function can then be "moved up" closer to where the
values are created in independent changes. Once the conversion is in a place
where the context makes it possible to construct the value safely, it can be
removed completely.

```typescript
import {legacyUnsafeResourceUrl} from 'safevalues/restricted/legacy';
import {setScriptSrc} from 'safevalues/dom';

// TODO: move legacy conversion to caller
setScriptSrc(script,legacyUnsafeResourceUrl(url));
```

## Reviewed conversions

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
import {setScriptSrc} from 'safevalues/dom';
import {scriptSafeByReview} from 'safevalues/restricted/reviewed';

if (document.domain === '') {
    const scriptText = scriptSafeByReview(
        userInput,
        {justification: `Even though the input is user controller, the wrapping if statement
         ensures that this code is only ever run in a sandboxed origin`});
    setScriptSrc(scriptEl, scriptText);
}
```
