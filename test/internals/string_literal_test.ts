/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertIsTemplateObject} from '../../src/internals/string_literal';

function getTagFunction(allowInterpolation: boolean, errMsg: string) {
  return (templateObj: TemplateStringsArray, ...args: unknown[]) => {
    assertIsTemplateObject(templateObj, allowInterpolation, errMsg);
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
    const tagFn = getTagFunction(false, 'unexpected error');
    expect(tagFn`valid string`).toEqual('valid string');
  });

  it('can support interpolation', () => {
    const tagFn = getTagFunction(true, 'unexpected error');
    expect(tagFn`hello ${'world'}`).toEqual('hello world');
  });

  it('can reject interpolation', () => {
    const tagFn = getTagFunction(false, 'tagFn does not support interpolation');
    expect(() => {
      return tagFn`hello ${'world'}`;
    }).toThrowError(/tagFn does not support interpolation/);
  });

  it('rejects invalid input 1: missing property "raw"', () => {
    const tagFn = getTagFunction(false, 'tagFn is a template tag function');
    expect(() => {
      return tagFn(['evil'] as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });

  it('rejects invalid input 2: missing properties of string[]', () => {
    const tagFn = getTagFunction(false, 'tagFn is a template tag function');
    expect(() => {
      return tagFn({raw: ['evil']} as never as TemplateStringsArray);
    }).toThrowError(/tagFn is a template tag function/);
  });
});
