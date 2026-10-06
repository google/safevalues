/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getScriptNonce,
  openWindowInNewTab,
  windowOpen,
} from '../../../src/dom/globals/window';

describe('Window', () => {
  describe('openWindowInNewTab', () => {
    it('opens a new tab with noopener,noreferrer by default and returns null', () => {
      const openSpy = spyOn(window, 'open').and.returnValue(null);

      const result = openWindowInNewTab(window, 'https://example.com');

      expect(result).toBeNull();
      expect(openSpy).toHaveBeenCalledOnceWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('opens a new tab with noopener when referrer is true', () => {
      const openSpy = spyOn(window, 'open').and.returnValue(null);

      const result = openWindowInNewTab(window, 'https://example.com', true);

      expect(result).toBeNull();
      expect(openSpy).toHaveBeenCalledOnceWith(
        'https://example.com',
        '_blank',
        'noopener',
      );
    });

    it('does not call window.open when URL is unsafe', () => {
      const openSpy = spyOn(window, 'open');

      // eslint-disable-next-line no-script-url
      const result = openWindowInNewTab(window, 'javascript:evil()');

      expect(result).toBeNull();
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('windowOpen', () => {
    it('forwards target and features to window.open', () => {
      const openSpy = spyOn(window, 'open').and.returnValue(null);

      const result = windowOpen(
        window,
        'https://example.com',
        '_blank',
        'noopener,noreferrer',
      );

      expect(result).toBeNull();
      expect(openSpy).toHaveBeenCalledOnceWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

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
