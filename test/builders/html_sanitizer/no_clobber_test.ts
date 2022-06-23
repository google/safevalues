/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {getNodeName, isElement, isText} from '../../../src/builders/html_sanitizer/no_clobber';

function createClobberedElement(property: string): Element {
  const formElement = document.createElement('form');
  const inputElement = document.createElement('input');
  inputElement.setAttribute('name', property);
  formElement.appendChild(inputElement);
  return formElement;
}

describe('no clobber test', () => {
  describe('getNodeName', () => {
    it('returns the expected value for an unclobbered element', () => {
      const divElement = document.createElement('div');
      const nodeName = getNodeName(divElement);

      expect(divElement.nodeName).toBe('DIV');
      expect(nodeName).toBe('DIV');
    });

    it('assumes the nodeName is `FORM` for a clobbered element', () => {
      const formElement = createClobberedElement('nodeName') as Node;
      const nodeName = getNodeName(formElement);

      expect(formElement.nodeName).not.toBeInstanceOf(String);
      expect(nodeName).toBe('FORM');
    });
  });

  describe('isElement', () => {
    it('returns false for a text node', () => {
      const textNode = document.createTextNode('some text');
      expect(isElement(textNode)).toBeFalse();
    });

    it('returns true for an unclobbered element', () => {
      const divElement = document.createElement('div');

      expect(typeof divElement.nodeType).toBe('number');
      expect(isElement(divElement)).toBeTrue();
    });

    it('returns true for a clobbered element', () => {
      const formElement = createClobberedElement('nodeType');

      expect(typeof formElement.nodeType).not.toBe('number');
      expect(isElement(formElement)).toBeTrue();
    });
  });

  describe('isText', () => {
    it('returns true for a text node', () => {
      const textNode = document.createTextNode('some text');
      expect(isText(textNode)).toBeTrue();
    });

    it('returns false for an unclobbered element', () => {
      const divElement = document.createElement('div');

      expect(typeof divElement.nodeType).toBe('number');
      expect(isText(divElement)).toBeFalse();
    });

    it('returns false for a clobbered element', () => {
      const formElement = createClobberedElement('nodeType');

      expect(typeof formElement.nodeType).not.toBe('number');
      expect(isText(formElement)).toBeFalse();
    });
  });
});
