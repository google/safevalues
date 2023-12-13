/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  htmlFragment,
  safeFragment,
  svgFragment,
} from '../../src/builders/document_fragment_builders';

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

  describe('htmlFragment', () => {
    it('can build a simple document fragment', () => {
      expect(
        (htmlFragment`<div>Hello World</div>`.firstChild! as Element).outerHTML,
      ).toEqual('<div>Hello World</div>');
    });

    it('rejects any interpolation', () => {
      const castSafeFragment = htmlFragment as (
        arr: TemplateStringsArray,
        str: string,
      ) => DocumentFragment;
      expect(() => castSafeFragment`<div>${'this'}</div>;`).toThrowError();
    });
  });

  describe('svgFragment', () => {
    // svgFragment doesn’t support IE
    if (isIE()) {
      return;
    }

    it('can build a simple svg fragment', () => {
      const fragment = svgFragment`<circle cx="100" cy="100" r="100"></circle>`;
      expect((fragment.firstChild! as Element).outerHTML).toEqual(
        '<circle cx="100" cy="100" r="100"></circle>',
      );
      expect((fragment.firstChild! as Element).namespaceURI).toEqual(
        'http://www.w3.org/2000/svg',
      );
    });

    it('can build a simple svg fragment without changing case', () => {
      expect(
        (
          svgFragment`<radialGradient gradientUnits="userSpaceOnUse" r="40">
<stop offset="0%" stop-color="cyan" />
<stop offset="100%" stop-color="transparent" />
</radialGradient>`.firstChild! as Element
        ).outerHTML,
      ).toEqual(`<radialGradient gradientUnits="userSpaceOnUse" r="40">
<stop offset="0%" stop-color="cyan"></stop>
<stop offset="100%" stop-color="transparent"></stop>
</radialGradient>`);
    });

    it('rejects any interpolation', () => {
      const castSafeFragment = svgFragment as (
        arr: TemplateStringsArray,
        str: string,
      ) => DocumentFragment;
      expect(() => castSafeFragment`<div>${'this'}</div>;`).toThrowError();
    });
  });
});

function isIE() {
  return navigator.userAgent.indexOf('Trident/') > 0;
}
