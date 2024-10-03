# Injection (XSS) Vulnerabilities in DOM APIs and Remediations

## SafeHtml: Rendering HTML to the DOM <!-- DO NOT DELETE: safehtml -->

The `safeHtmlValue` variable shown in the following examples is a `SafeHtml`
instance. To learn how to build a `SafeHtml` instance, see the
[`SafeHtml` documentation](../README.md#safehtml).

### Assigning to `HTMLElement#innerHTML` <!-- DO NOT DELETE: ban-element-innerhtml-assignments -->

#### Risky code

```typescript {.bad}
element.innerHTML = value;
```

#### Safe alternative: Use `HTMLElement#textContent`

If the assigned value doesn't contain HTML or shouldn't be interpreted as HTML,
use `.textContent` to assign the value.

```typescript {.good}
element.textContent = value;
```

#### Safe alternative: Use a safe setter

```typescript {.good}
import {setElementInnerHtml} from 'safevalues/dom';

setElementInnerHtml(element, safeHtmlValue);
```

### Assigning to `HTMLElement#outerHTML` <!-- DO NOT DELETE: ban-element-outerhtml-assignments -->

#### Risky code

```typescript {.bad}
element.outerHTML = value;
```

#### Safe alternative

```typescript {.good}
import {setElementOuterHtml} from 'safevalues/dom';

setElementOuterHtml(element, safeHtmlValue);
```

### Assigning to `HTMLIframeElement#srcdoc` <!-- DO NOT DELETE: ban-iframe-srcdoc-assignments -->

#### Risky code

```typescript {.bad}
iframe.srcdoc = value;
```

#### Safe alternative: Use a general-purpose safe setter

```typescript {.good}
import {setIframeSrcdoc} from 'safevalues/dom';

setIframeSrcdoc(iframe, safeHtmlValue);
```

### Calling `HTMLElement#insertAdjacentHTML` <!-- DO NOT DELETE: ban-element-insertadjacenthtml -->

#### Risky code

```typescript {.bad}
element.insertAdjacentHTML('beforeend', value);
```

#### Safe alternative: Use `HTMLElement#insertAdjacentText`

If the assigned value doesn't contain HTML or shouldn't be interpreted as HTML,
call `insertAdjacentText` to insert the value.

```typescript {.good}
element.insertAdjacentText('beforeend', value);
```

#### Safe alternative: Use a safe setter

```typescript {.good}
import {elementInsertAdjacentHTML} from 'safevalues/dom';

elementInsertAdjacentHTML(element, 'beforeend', safeHtmlValue);
```

### Calling `Document#write` <!-- DO NOT DELETE: ban-document-write-calls -->

#### Risky code

```typescript {.bad}
document.write(value);
```

#### Safe alternative

```typescript {.good}
import {documentWrite} from 'safevalues/dom';

documentWrite(document, safeHtmlValue);
```

### Calling `Document#writeln` <!-- DO NOT DELETE: ban-document-writeln-calls -->

#### Risky code

safevalues does not have a safe alternative for `writeln`. If you need such an
API, please file a feature request to safehtml-team@.

#### Safe alternative

safevalues does not have a safe alternative for `writeln`. If you need such an
API, please file a feature request to safehtml-team@. ```

### Calling `DOMParser#parseFromString` <!-- DO NOT DELETE: ban-domparser-parsefromstring -->

#### Risky code

```typescript {.bad}
const parser = new DOMParser();
parser.parseFromString(value, mimeType);
```

#### Safe alternative

```typescript {.good}
import {domParserParseFromString} from 'safevalues/dom';

const parser = new DOMParser();
domParserParseFromString(parser, safeHtmlValue, mimeType);
```

### Calling `Range#createContextualFragment` <!-- DO NOT DELETE: ban-range-createcontextualfragment -->

#### Risky code

```typescript {.bad}
const range = document.createRange();
range.createContextualFragment(value);
```

#### Safe alternative

```typescript {.good}
import {rangeCreateContextualFragment} from 'safevalues/dom';

const range = document.createRange();
rangeCreateContextualFragment(range, safeHtmlValue);
```

## TrustedResourceUrl: Loading code <!-- DO NOT DELETE: trustedresourceurl -->

The `trustedResourceUrl` variable shown in the following examples is a
`TrustedResourceUrl` instance. To learn how to build a `TrustedResourceUrl`
instance, see the
[`TrustedResourceUrl` documentation](../README.md#trustedresourceurl) to
learn how to build a `TrustedResourceUrl` instance.

### Assigning to `HTMLScriptElement#src` <!-- DO NOT DELETE: ban-script-src-assignments -->

#### Risky code

```typescript {.bad}
scriptEl.src = url;
```

#### Safe alternative

```typescript {.good}
import {setScriptSrc} from 'safevalues/dom';

setScriptSrc(scriptEl, trustedResourceUrl);
```

### Assigning to `HTMLObjectElement#data` <!-- DO NOT DELETE: ban-object-data-assignments -->

#### Risky code

```typescript {.bad}
objectEl.data = url;
```

#### Safe alternative

```typescript {.good}
import {setObjectData} from 'safevalues/dom';

setObjectData(objectEl, trustedResourceUrl);
```

### Assigning to `HTMLIFrameElement#src` <!-- DO NOT DELETE: ban-iframe-src-assignments -->

#### Risky code

```typescript {.bad}
iframe.src = url;
```

#### Safe alternative: Use a general-purpose safe setter

```typescript {.good}
import {setIframeSrc} from 'safevalues/dom';

setIframeSrc(iframe, trustedResourceUrl);
```

### Calling the constructor of `Worker` or `SharedWorker` <!-- DO NOT DELETE: ban-worker-calls -->

#### Risky code

```typescript {.bad}
new Worker(url);
new SharedWorker(url);
```

#### Safe alternative

```typescript {.good}
import {createWorker, createSharedWorker} from 'safevalues/dom';

createWorker(trustedResourceUrl);
createSharedWorker(trustedResourceUrl);
```

### Calling `importScripts` in a worker scope <!-- DO NOT DELETE: ban-worker-importscripts -->

#### Risky code

```typescript {.bad}
self.importScripts(url);
```

#### Safe alternative

```typescript {.good}
import {workerGlobalScopeImportScripts} from 'safevalues/dom';

workerGlobalScopeImportScripts(self, trustedResourceUrl);
```

### Calling `ServiceWorkerContainer#register` <!-- DO NOT DELETE: ban-serviceworkercontainer-register -->

#### Risky code

```typescript {.bad}
serviceWorkerContainer.register(url);
```

#### Safe alternative

```typescript {.good}
import {serviceWorkerContainerRegister} from 'safevalues/dom';

serviceWorkerContainerRegister(self, trustedResourceUrl);
```

## SafeScript: Executable code snippets

The `safeScriptValue` variable in the following examples is a `SafeScript`
instance. To learn how to build a `SafeScript` instance, see the
[`SafeScript` documentation](http://go/safehtmltypes?polyglot=typescript#safescript).

Only use the `safevalues/dom` API `setScriptTextContent` to set the text content
of a \<script\> tag, instead of DOM APIs like `text`, `textContent`,
`innerHTML`, `innerText`, or `appendChild`. The safe API prompts you to use a
`SafeScript` value for executable content and propagates security nonces so that
CSP does not block script execution.

```typescript {.good}
import {setScriptTextContent} from 'safevalues/dom'

setScriptTextContent(script, safeScriptValue);
```

### Calls to `eval`

A value passed to `eval` is evaluated and executed in the page as ordinary
JavaScript. Therefore, the assignment of user-controlled, insufficiently
sanitized or escaped content can result in the execution of user-controlled code
(an XSS). Because of browser inconsistencies, sanitizing or escaping for `eval`
is hard to get right and prone to problems.

There might be a few cases where dynamically evaluating code is inevitable. If
your code falls into one of these cases, make sure to convert the content you
are evaluating to `SafeScript` and use `globalEval` to avoid using `eval`
directly.

```typescript {.good}
import {globalEval} from 'safevalues/dom'

globalEval(safeScriptValue);
```

`setTimeout` and `setInterval` can also achieve `eval`-like effects when they
are called with strings as the first arguments. Using these two APIs that way
triggers Trusted Types violations as well.

### A note on `setTimeout` and `setInterval`

The static checkers can emit false alarms when `setTimeout` and `setInterval`
are indirectly called. To inform the checkers that the indirect calls do not
involve `eval`-like effects, wrap them in an arrow function with more
restrictive signatures. See an example below.

```typescript {.bad}
declare const callback: () => void;
const setTimeoutIndirect = setTimeout; // Violation emitted.
setTimeoutIndirect(callback, 10);
```

```typescript {.good}
declare const callback: () => void;
const setTimeoutIndirect =
  (cb: () => void, timeout: number) => {
    setTimeout(cb, timeout); // No violation. The checker now knows that
                             // the first argument cannot be a string.
  };
setTimeoutIndirect(callback, 10);
```

## setAttribute

`Element#setAttribute` (and APIs with similar effects) are not allowed since it
can bypass other security checks, unless the name of the attribute to be set is
statically known to be harmless. If this check blocks your project, consider the
following options.

-   Use a DOM API or a `safevalues/dom` setter whenever possible. Instead of the
    following code:

    ```typescript {.bad}
    elem.setAttribute('tabindex', '1');
    anchor.setAttribute('href', 'https://example.com');
    ```

    Use this instead:

    ```typescript {.good}
    import {setAnchorHref} from 'safevalues/dom';

    elem.tabindex = 1;
    setAnchorHref(anchor, safeUrl`https://example.com`);
    ```

-   To set attributes whose names are not statically known (e.g. for ARIA, some
    other layout helper, or if the code is just structured that way), use
    `setPrefixedAttribute` from `safevalues/dom`, by enumerating the prefixes of
    all possible attributes you want to set. This allows the check to be aware
    that your code is not setting any dangerous attributes at run time.

    ```typescript {.good}
    import {setElementPrefixedAttribute} from 'safevalues/dom';
    import {safeAttrPrefix} from 'safevalues';

    // In this example, `attr` can be any name starting with "aria-" or "role", but nothing else.
    // If you try to set an attribute with other prefixes, the setter will throw an exception.
    setElementPrefixedAttribute(
        [safeAttrPrefix`aria-`, safeAttrPrefix`role`], elem, attr, value);
    ```

    The `safeAttrPrefix` invocation is using the
    [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)
    syntax.

-   To set "data-" attributes, consider using the
    [dataset API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/dataset)
    in addition to `setPrefixedAttribute`.

    ```typescript {.good}
    // Code below is equivalent to:
    //   elem.setAttribute('data-safe', true);
    elem.dataset['safe'] = true;

    // Code below is equivalent to:
    //   elem.setAttribute('data-date-of-birth', '1980-01-01');
    elem.dataset['dateOfBirth'] = '1980-01-01';
    ```
