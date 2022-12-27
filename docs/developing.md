# Development notes

## Stripping out development code

Error messages and development-time checks are stripped from production binaries
to keep the code size footprint of safevalues small. This is achieved by using
the `process.env.NODE_ENV !== 'production'` compile-time constant from the `environment.ts` module. To
increase readability, the `process.env.NODE_ENV !== 'production'` constant should always be used in a
dedicated `if` statement without other conditions.

### Error messages

Error messages should only be present in development mode. Use an `if` statement
to achieve this as follows:

```
import {process.env.NODE_ENV !== 'production'} from './environment';

let message = '';
if (process.env.NODE_ENV !== 'production') {
  message = 'Verbose error message';
}
throw new Error(message);
```

### Development-time checks

Security and development checks that only involve compile-time assertions or
values that have no downstream effects should only be present in development
mode. Use an `if` statement to achieve this as follows:

```
import {process.env.NODE_ENV !== 'production'} from './environment';

if (process.env.NODE_ENV !== 'production') {
  assertIsTemplateObject(input);
}
```

Place the `if` statement as close to the public API surface as possible to
maximize the amount of code that is stripped out.
