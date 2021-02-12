/*
 * @license
 * Copyright 2020 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assertIsConstantTemplateObject, assertIsTemplateObject} from '../../src/implementation/safe_string_literal';

function getTagFunction(errMsg: string) {
  return (templateObj: TemplateStringsArray, ...args: unknown[]) => {
    assertIsTemplateObject(templateObj, errMsg);
    const parts = [templateObj[0]];
    for (let i = 0; i < args.length; i++) {
      parts.push(String(args[i]));
      parts.push(templateObj[i + 1]);
    }
    return parts.join('');
  };
}

function getConstantTagFunction(errMsg: string) {
  return (templateObj: TemplateStringsArray,
          ...emptyArgs: ReadonlyArray<''>) => {
    assertIsConstantTemplateObject(templateObj, emptyArgs, errMsg);
    return templateObj.join('');
  };
}

describe('assertIsTemplateObject', () => {
  it('accepts valid input', () => {
    const tagFn = getTagFunction('unexpected error');
    expect(tagFn`valid string`).toEqual('valid string');
  });

  it('supports interpolation', () => {
    const tagFn = getTagFunction('unexpected error');
    expect(tagFn`hello ${'world'}!`).toEqual('hello world!');
  });

  it('rejects invalid input 1: missing property \"raw\"', () => {
    const tagFn = getTagFunction('tagFn is a template tag function');
    expect(() => {
      return tagFn(['evil'] as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });

  it('rejects invalid input 2: missing properties of string[]', () => {
    const tagFn = getTagFunction('tagFn is a template tag function');
    expect(() => {
      return tagFn({raw: ['evil']} as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });
});

describe('assertIsConstantTemplateObject', () => {
  it('accepts valid input', () => {
    const tagFn = getConstantTagFunction('unexpected error');
    expect(tagFn`valid string`).toEqual('valid string');
  });

  it('rejects interpolation', () => {
    const tagFn =
        getConstantTagFunction('tagFn does not support interpolation');
    expect(() => {
      return tagFn`hello ${'world' as unknown as ''}`;
    }).toThrowError(/tagFn does not support interpolation/);
  });

  it('rejects invalid input 1: missing property \"raw\"', () => {
    const tagFn = getConstantTagFunction('tagFn is a template tag function');
    expect(() => {
      return tagFn(['evil'] as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });

  it('rejects invalid input 2: missing properties of string[]', () => {
    const tagFn = getConstantTagFunction('tagFn is a template tag function');
    expect(() => {
      return tagFn({raw: ['evil']} as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });

  it('supports inline comments', () => {
    const tagFn = getConstantTagFunction('unexpected error');
    expect(tagFn`hello${/* awesome */ ''} world!`).toEqual('hello world!');
  });
});
