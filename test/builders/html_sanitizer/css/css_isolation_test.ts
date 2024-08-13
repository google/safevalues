/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSS_ISOLATION_PROPERTIES} from '../../../../src/builders/html_sanitizer/css/css_isolation';
import {setSrcdoc} from '../../../../src/dom/elements/iframe';
import {SafeHtml} from '../../../../src/internals/html_impl';
import {testonlyHtml} from '../../../testing/conversions';

function createIframe(content: SafeHtml): Promise<HTMLIFrameElement> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'safevalues-test-iframe';
    setSrcdoc(iframe, content);
    iframe.addEventListener('load', () => {
      // Additional requestAnimationFrame helps deflake the test on Safari.
      requestAnimationFrame(() => {
        resolve(iframe);
      });
    });
    document.body.appendChild(iframe);
  });
}

describe('CSS_ISOLATION_PROPERTIES', () => {
  const testCases = [
    {
      name: 'position:fixed',
      style: `
        #malicious-element {
          display: block;
          background: green;
          position: fixed;
          top: 0; bottom: 0;
          left: 0; right: 0;
        }
      `,
    },
    {
      name: 'position:absolute',
      style: `
        #malicious-element {
          display: block;
          background: green;
          position: absolute;
          top: 0; bottom: 0;
          left: 0; right: 0;
        }
      `,
    },
    {
      name: 'negative margins',
      style: `
        #malicious-element {
          display: block;
          background: green;
          margin-top: -50px;
          margin-left: -50px;
          width: 100px;
          height: 100px;
        }
      `,
    },
    {
      name: 'transform:scale',
      style: `
        #malicious-element {
          display: block;
          background: green;
          transform: scale(100);
          width: 50px;
          height: 50px;
        }
      `,
    },
  ];

  for (const testCase of testCases) {
    it(`ensures that an element with ${testCase.name} cannot escape the sanitized container`, async () => {
      const iframe = await createIframe(
        testonlyHtml(`
        Outside text.
        <style>${testCase.style}</style>
        <sanitized-container id="sanitized-container">
          Unsafe markup
          <malicious-element id="malicious-element"></malicious-element>
        </sanitized-container>`),
      );

      const doc = iframe.contentDocument!;
      const sanitizedContainer = doc.getElementById('sanitized-container')!;
      const maliciousElement = doc.getElementById('malicious-element')!;

      // Initially malicious element should cover the first pixel of the iframe.
      expect(doc.elementFromPoint(0, 0))
        .withContext('sanity check')
        .toBe(maliciousElement);

      sanitizedContainer.style.cssText = CSS_ISOLATION_PROPERTIES;

      // After the sanitized content is isolated, the malicious element should
      // no longer cover the first pixel of the iframe.
      expect(doc.elementFromPoint(0, 0)).not.toBe(maliciousElement);

      iframe.remove();
    });
  }
});
