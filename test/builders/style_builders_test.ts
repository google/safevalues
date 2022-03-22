/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {concatStyles, safeStyle} from '../../src/builders/style_builders';
import {SafeStyle} from '../../src/internals/style_impl';

describe('style_builders', () => {
  describe('safeStyle', () => {
    it('can build a simple stye', () => {
      expect(safeStyle`margin: 5px;`.toString()).toEqual('margin: 5px;');
    });

    it('rejects any interpolation', () => {
      const castSafeStyle =
          safeStyle as (arr: TemplateStringsArray, str: string) => SafeStyle;
      expect(() => castSafeStyle`margin: ${'5px'};`).toThrowError();
    });

    it('enforces basic constraints on the style format', () => {
      expect(() => {
        return safeStyle`foobar;`;
      }).toThrowError(/Style string should contain one or more ":"/);
      expect(() => {
        return safeStyle`foo:bar`;
      }).toThrowError(/Style string does not end with ";"/);
      expect(() => {
        return safeStyle`foo<bar`;
      }).toThrowError(/Forbidden characters in style/);
    });
  });

  describe('concatStyles', () => {
    it('concatenates `SafeStyle` values', () => {
      const style1 = safeStyle`color: navy;`;
      const style2 = safeStyle`background: red;`;
      expect(concatStyles([style1, style2]).toString())
          .toEqual('color: navy;background: red;');
    });
  });
});
