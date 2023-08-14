/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertIsTemplateObject} from '../../src/internals/string_literal';

function getTagFunction(options?: {numArgs: number}) {
  return (templateObj: TemplateStringsArray, ...args: unknown[]) => {
    assertIsTemplateObject(templateObj, options?.numArgs ?? args.length);
    const parts = [templateObj[0]];
    for (let i = 0; i < args.length; i++) {
      parts.push(String(args[i]));
      parts.push(templateObj[i + 1]);
    }
    return parts.join('');
  };
}

describe('assertIsTemplateObject', () => {
  it('accepts valid input', () => {
    const tagFn = getTagFunction();
    expect(tagFn`valid string`).toEqual('valid string');
  });

  it('accepts valid input containing escape sequences', () => {
    const tagFn = getTagFunction();
    expect(tagFn`\0`).toEqual('\0');
    expect(tagFn`\n`).toEqual('\n');
    expect(tagFn`\\`).toEqual('\\');
    expect(tagFn`\u0000`).toEqual('\u0000');
  });

  it('can support interpolation', () => {
    const tagFn = getTagFunction();
    expect(tagFn`hello ${'world'}`).toEqual('hello world');
  });

  it('can reject interpolation', () => {
    const tagFn = getTagFunction({numArgs: 0});
    expect(() => {
      return tagFn`hello ${'world'}`;
    }).toThrowError(/##### ERROR #####/);
  });

  it('rejects invalid input 1: missing property "raw"', () => {
    const tagFn = getTagFunction() as Function;
    expect(() => {
      return tagFn(Object.freeze(['']));
    }).toThrowError(/##### ERROR #####/);
  });

  it('rejects invalid input 2: missing properties of string[]', () => {
    const tagFn = getTagFunction() as Function;
    expect(() => {
      return tagFn(Object.freeze({raw: Object.freeze([''])}));
    }).toThrowError(/##### ERROR #####/);
  });

  it('rejects invalid input 3: raw has wrong length', () => {
    const tagFn = getTagFunction() as Function;
    expect(() => {
      return tagFn(
          Object.freeze(Object.assign([''], {raw: Object.freeze([])})) as
          unknown as TemplateStringsArray);
    }).toThrowError(/##### ERROR #####/);
  });

  it('rejects invalid input 4: array and raw prop are same array', () => {
    const tagFn = getTagFunction() as Function;
    const isNative = (() => ``).toString().includes('`');
    if (isNative) {
      expect(() => {
        const arr = [''];
        return tagFn(Object.freeze(Object.assign(arr, {raw: arr})));
      }).toThrowError(/##### ERROR #####/);
    } else {
      // Skip this test if we are running transpiled code. Since we need an
      // expectation, add a check that the code is indeed transpiled.
      expect(isNative).toBeFalse();
    }
  });

  it('rejects invalid input 5: non frozen objects', () => {
    const tagFn = getTagFunction() as Function;
    const isNative = (() => ``).toString().includes('`');
    if (isNative || Object.isFrozen``) {
      expect(() => {
        return tagFn(Object.assign([''], {raw: ['']}));
      }).toThrowError(/##### ERROR #####/);
    } else {
      expect(Object.isFrozen``).toBeFalse();
    }
  });

  it('rejects invalid input 6: Wrong number of arguments', () => {
    const tagFn = getTagFunction() as Function;
    const tagFnOneArg = (s: TemplateStringsArray, ...args: string[]) =>
        tagFn(s, args[0]);
    expect(() => {
      return tagFnOneArg`${'one'}, ${'two'}`;
    }).toThrowError(/##### ERROR #####/);
  });
});
