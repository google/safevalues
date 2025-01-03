/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSS_ISOLATION_PROPERTIES} from '../../../../src/builders/html_sanitizer/css/css_isolation';
import {setElementInnerHtml} from '../../../../src/dom/elements/element';
import {setIframeSrcdoc} from '../../../../src/dom/elements/iframe';
import {SafeHtml} from '../../../../src/internals/html_impl';
import {testonlyHtml} from '../../../testing/conversions';

async function createIframe(content: SafeHtml): Promise<HTMLIFrameElement> {
  const iframe = document.createElement('iframe');
  iframe.id = 'safevalues-test-iframe';
  setIframeSrcdoc(iframe, content);
  const iframeLoaded = new Promise((resolve) => {
    iframe.addEventListener('load', resolve, {once: true});
  });
  document.body.appendChild(iframe);
  await iframeLoaded;
  // Additional requestAnimationFrame helps deflake the test on Safari.
  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

  return iframe;
}

describe('CSS_ISOLATION_PROPERTIES', () => {
  const testCases = [
    {
      name: 'position:fixed',
      style: `
        #malicious-element {
          display: block;
          z-index: 10;
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
          z-index: 10;
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
          z-index: 10;
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
          z-index: 10;
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

  it('ensures that the sanitized content is vertically aligned', () => {
    // This test would fail with display:inline-block;overflow:hidden and
    // without vertical-align:top. Proving that vertical-align:top is necessary.

    const div = document.createElement('div');
    setElementInnerHtml(
      div,
      testonlyHtml(`
        <span>Everything</span>
        <sanitized-content style="${CSS_ISOLATION_PROPERTIES}">should be</sanitized-content>
        <span>in one line.</span>
    `),
    );
    document.body.appendChild(div);

    const children = Array.from(div.children) as HTMLElement[];
    const firstTop = children[0].offsetTop;
    expect(children.every((child) => child.offsetTop === firstTop)).toBeTrue();

    div.remove();
  });

  it('ensures that text-decoration is inherited', () => {
    // This test would fail with display:inline-block;overflow:hidden and
    // without text-decoration:inherit. Proving that text-decoration:inherit is
    // necessary.

    const div = document.createElement('div');
    setElementInnerHtml(
      div,
      testonlyHtml(`
      <u>
        Everything
        <sanitized-content style="${CSS_ISOLATION_PROPERTIES}">should be</sanitized-content>
        underlined
      </u>
    `),
    );
    document.body.appendChild(div);

    const sanitizedContent = div.querySelector('sanitized-content')!;
    const decorationLine =
      getComputedStyle(sanitizedContent).textDecorationLine;
    expect(decorationLine).toBe('underline');

    div.remove();
  });
});
