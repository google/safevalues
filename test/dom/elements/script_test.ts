/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {trustedResourceUrl} from '../../../src/builders/resource_url_builders';
import {safeScript} from '../../../src/builders/script_builders';
import * as safeScriptEl from '../../../src/dom/elements/script';
import {safeDocument} from '../../../src/dom/index';
import {testonlyHtml} from '../../conversions';

describe('safeScriptEl', () => {
  const nonce = btoa(`Nonce12345`);
  let noncedScript: HTMLScriptElement;

  beforeEach(() => {
    noncedScript = document.createElement('script');
    noncedScript.setAttribute('nonce', nonce);
    document.body.appendChild(noncedScript);
  });

  afterEach(() => {
    try {
      document.body.removeChild(noncedScript);
    } catch {
    }
  });

  describe('with TS safe types', () => {
    it('propagates nonces when setting script src', () => {
      const blankScript = document.createElement('script');
      const url = trustedResourceUrl`data:text/javascript,alert('hello');`;
      safeScriptEl.setSrc(blankScript, url);

      expect(blankScript.src).toEqual(`data:text/javascript,alert('hello');`);
      expect(blankScript.nonce).toEqual(nonce);
    });

    it('propagates nonces when setting textContent', () => {
      const content = safeScript`alert(1);`;
      const blankScript = document.createElement('script');
      safeScriptEl.setTextContent(blankScript, content);

      expect(blankScript.text).toEqual(`alert(1);`);
      expect(blankScript.nonce).toEqual(nonce);
    });

    it('test nonce cache', () => {
      const blankScript = document.createElement('script');
      // This will allow safe setter to cache CSP nonce
      const content = safeScript`alert(1);`;
      safeScriptEl.setTextContent(blankScript, content);

      document.body.removeChild(noncedScript);

      // Tests cached nonce
      const url = trustedResourceUrl`data:text/javascript,alert('hello');`;
      safeScriptEl.setSrc(blankScript, url);

      expect(blankScript.src).toEqual(url.toString());
      expect(blankScript.nonce).toEqual(nonce);
    });

    it('propagates CSP nonce correctly from documents', () => {
      // Creates the iframe and set up a script inside the iframe.
      const nonceIframe = btoa(`NonceForiframe`);

      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      const iframeDocument = iframe.contentWindow!.document;
      safeDocument.write(
          iframeDocument,
          testonlyHtml(`<script nonce="${nonceIframe}"><script>`));
      iframeDocument.close();
      const blankScript = iframeDocument.createElement('script');
      iframeDocument.body.appendChild(blankScript);
      const url = trustedResourceUrl`data:text/javascript,alert('hello');`;
      safeScriptEl.setSrc(blankScript, url);

      expect(blankScript.nonce).toEqual(nonceIframe);

      document.body.removeChild(iframe);
    });
  });
});
