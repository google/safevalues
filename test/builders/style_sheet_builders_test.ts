/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  concatStyleSheets,
  safeStyleSheet,
} from '../../src/builders/style_sheet_builders';

describe('style_sheet_builders', () => {
  describe('safeStyleSheet', () => {
    it('builds a simple stylesheet', () => {
      expect(safeStyleSheet`a { color: navy; }`.toString()).toEqual(
        'a { color: navy; }',
      );
    });

    it('interpolates SafeStyleSheet values', () => {
      const base = safeStyleSheet`a { color: navy; }`;
      const extra = safeStyleSheet`c { color: green; }`;
      expect(
        safeStyleSheet`${base} b { color: red; } ${extra}`.toString(),
      ).toEqual('a { color: navy; } b { color: red; } c { color: green; }');
    });

    it('throws when < is present in literal', () => {
      const base = safeStyleSheet`a { color: navy; }`;
      expect(() => safeStyleSheet`a < b { color: navy; }`).toThrowError(
        /'<' character is forbidden/,
      );
      expect(() => safeStyleSheet`${base} a < b { color: navy; }`).toThrowError(
        /'<' character is forbidden/,
      );
    });

    it('rejects non-SafeStyleSheet interpolations at runtime', () => {
      const castSafeStyleSheet = safeStyleSheet as unknown as (
        arr: TemplateStringsArray,
        str: string,
      ) => unknown;
      expect(() => castSafeStyleSheet`a { color: ${'navy'}; }`).toThrowError(
        /Unexpected type when unwrapping SafeStyleSheet/,
      );
    });

    it('rejects calls that do not use tagged template syntax', () => {
      expect(() =>
        (safeStyleSheet as unknown as (arr: string[]) => unknown)([
          'a { color: navy; }',
        ]),
      ).toThrowError(/It looks like you are trying to call a template tag/);
    });
  });

  describe('concatStyleSheets', () => {
    it('concatenates `SafeStyleSheet` values', () => {
      const style1 = safeStyleSheet`a { color: navy; }`;
      const style2 = safeStyleSheet`b { color: red; }`;
      expect(concatStyleSheets([style1, style2]).toString()).toEqual(
        'a { color: navy; }b { color: red; }',
      );
    });
  });
});
