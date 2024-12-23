/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {safeAttrPrefix} from '../../../src/builders/attribute_builders';
import {testonlyHtml} from '../../testing/conversions';

import {
  buildPrefixedAttributeSetter,
  elementInsertAdjacentHtml,
  setElementInnerHtml,
  setElementOuterHtml,
} from '../../../src/dom/elements/element';

describe('element API wrappers', () => {
  let div: HTMLDivElement;
  describe('with TS safe types', () => {
    beforeEach(() => {
      div = document.createElement('div');
    });
    describe('setElementInnerHtml', () => {
      it('can set innerHTML safely', () => {
        const html = testonlyHtml('<div id="test-html"></div>');
        setElementInnerHtml(div, html);
        expect(div.innerHTML).toBe('<div id="test-html"></div>');
      });

      it('cannot set style.innerHTML', () => {
        const style = document.createElement('style') as HTMLElement;
        expect(() => {
          setElementInnerHtml(style, testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot set script.innerHTML', () => {
        const script = document.createElement('script') as HTMLElement;
        expect(() => {
          setElementInnerHtml(script, testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot set svg:script.innerHTML', () => {
        const script = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'script',
        ) as Element;
        expect(() => {
          setElementInnerHtml(script, testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot set svg:style.innerHTML', () => {
        const style = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'style',
        ) as Element;
        expect(() => {
          setElementInnerHtml(style, testonlyHtml('bad'));
        }).toThrow();
      });
    });

    describe('setElementOuterHtml', () => {
      it('can set outerHTML safely', () => {
        const child = document.createElement('div');
        div.appendChild(child);
        const html = testonlyHtml('<div id="test-html"></div>');
        setElementOuterHtml(child, html);
        const newChild = div.lastElementChild!;
        expect(newChild.outerHTML).toBe('<div id="test-html"></div>');
      });
    });
    describe('buildPrefixedAttributeSetter', () => {
      it('can set attributes safely', () => {
        const anyElement = document.createElement('div');

        const setAriaAttribute = buildPrefixedAttributeSetter(
          safeAttrPrefix`aria-`,
          safeAttrPrefix`role`,
        );
        setAriaAttribute(anyElement, 'aria-hidden', 'abc');
        setAriaAttribute(anyElement, 'aria-label', 'xyz');
        setAriaAttribute(anyElement, 'ROLE', 'button');

        expect(anyElement.getAttribute('aria-hidden')).toEqual('abc');
        expect(anyElement.getAttribute('aria-label')).toEqual('xyz');
        expect(anyElement.getAttribute('role')).toEqual('button');

        const tryBypassAttrCheck = () => {
          setAriaAttribute(anyElement, 'unknown', '');
        };
        expect(tryBypassAttrCheck).toThrowError(
          `Attribute "unknown" does not match any of the allowed prefixes.`,
        );
      });
    });
    describe('elementInsertAdjacentHtml', () => {
      it('can insert adjacent HTML safely', () => {
        const html = testonlyHtml('<p>Hello SafeHtml team!</p>');
        elementInsertAdjacentHtml(div, 'beforeend', html);
        expect(div.innerHTML).toBe('<p>Hello SafeHtml team!</p>');
      });

      it('cannot insert adjacent HTML in style', () => {
        const style = document.createElement('style') as HTMLElement;
        expect(() => {
          elementInsertAdjacentHtml(style, 'afterbegin', testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot insert adjacent HTML in a script parent', () => {
        const script = document.createElement('script') as HTMLElement;
        const child = document.createElement('p') as HTMLElement;
        script.appendChild(child);
        expect(() => {
          elementInsertAdjacentHtml(child, 'afterend', testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot insert adjacent HTML in svg:style', () => {
        const style = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'style',
        ) as Element;
        expect(() => {
          elementInsertAdjacentHtml(style, 'afterbegin', testonlyHtml('bad'));
        }).toThrow();
      });

      it('cannot insert adjacent HTML in svg:script parent', () => {
        const script = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'script',
        ) as Element;
        const child = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'a',
        ) as Element;
        script.appendChild(child);
        expect(() => {
          elementInsertAdjacentHtml(child, 'afterend', testonlyHtml('bad'));
        }).toThrow();
      });
    });
  });
});
