/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {getScriptNonce} from '../../../src/dom/globals/window';

describe('Window', () => {
  describe('getScriptNonce', () => {
    it('returns a nonce if a script tag with nonce is found', () => {
      const doc = document.implementation.createHTMLDocument();
      const script = doc.createElement('script');
      script.setAttribute('nonce', '123');
      doc.body.appendChild(script);
      expect(getScriptNonce(doc)).toEqual('123');
    });

    it('returns empty string if no script tag is found', () => {
      const doc = document.implementation.createHTMLDocument();
      expect(getScriptNonce(doc)).toEqual('');
    });

    it('returns empty string if no nonce is found', () => {
      const doc = document.implementation.createHTMLDocument();
      const script = doc.createElement('script');
      doc.body.appendChild(script);
      expect(getScriptNonce(doc)).toEqual('');
    });

    it('returns nonce from current document when passed in no arguments', () => {
      const script = document.createElement('script');
      script.setAttribute('nonce', '345');

      spyOn(document, 'querySelector')
        .withArgs('script[nonce]')
        .and.returnValue(script);

      expect(getScriptNonce()).toEqual('345');
    });
  });
});
