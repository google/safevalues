/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {testonlyHtml} from '../testing/conversions';

import {
  htmlFragment,
  htmlToNode,
  svgFragment,
} from '../../src/builders/document_fragment_builders';

describe('document_fragment_builders', () => {
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

  describe('htmlToNode', () => {
    it('can parse html with multiple nodes', () => {
      const node = htmlToNode(testonlyHtml('<p>foo</p><div>bar</div>'));
      expect(node).toBeInstanceOf(DocumentFragment);
      expect(node.childNodes.length).toEqual(2);
      expect((node.firstChild! as Element).outerHTML).toEqual('<p>foo</p>');
      expect((node.lastChild! as Element).outerHTML).toEqual('<div>bar</div>');
    });

    it('unwraps the fragment for a single node', () => {
      const node = htmlToNode(testonlyHtml('<div>hi</div>'));
      expect(node).toBeInstanceOf(HTMLDivElement);
      expect((node as HTMLDivElement).outerHTML).toEqual('<div>hi</div>');
    });
  });
});
