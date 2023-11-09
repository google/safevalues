/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {safeFragment} from '../../src/builders/document_fragment_builders';

describe('document_fragment_builders', () => {
  describe('safeFragment', () => {
    it('can build a simple document fragment', () => {
      expect(
        (safeFragment`<div></div>`.firstChild! as Element).outerHTML,
      ).toEqual('<div></div>');
    });

    it('rejects any interpolation', () => {
      const castSafeFragment = safeFragment as (
        arr: TemplateStringsArray,
        str: string,
      ) => DocumentFragment;
      expect(() => castSafeFragment`<div>${'this'}</div>;`).toThrowError();
    });
  });
});
