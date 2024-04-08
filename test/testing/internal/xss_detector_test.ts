/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {createContextualFragment} from '../../../src/dom/globals/range';
import {setSrc, setTextContent} from '../../dom/elements/script';
import {globalEval} from '../../dom/globals/global';
import {testonlyHtml, testonlyResourceUrl, testonlyScript} from '../conversions';

import {XSSDetector} from './xss_detector';

describe('XSSDetector', () => {
  it('triggers synchronously for eval ', async () => {
    const detector = new XSSDetector();
    globalEval(window, testonlyScript(detector.payload));
    expect(detector.wasTriggered()).toBe(true);
  });

  it('times out when not triggered', async () => {
    const detector = new XSSDetector();

    // Access payload to make sure no error is thrown.
    expect(detector.payload).toBeTruthy();

    expect(await detector.waitForTrigger()).toBe(false);
  });

  it('triggers synchronously for inline script', async () => {
    const detector = new XSSDetector();

    const script = document.createElement('script');
    setTextContent(script, testonlyScript(detector.payload));
    document.body.appendChild(script);
    document.body.removeChild(script);

    expect(detector.wasTriggered()).toBe(true);
  });

  it('triggers asynchronously for script with src', async () => {
    const detector = new XSSDetector();

    const script = document.createElement('script');
    const url = testonlyResourceUrl(`data:text/javascript,${detector.payload}`);
    setSrc(script, url);
    document.body.appendChild(script);
    document.body.removeChild(script);

    expect(detector.wasTriggered()).toBe(false);

    expect(await detector.waitForTrigger()).toBe(true);
  });

  it('triggers synchronously for inline script parsed with Range', () => {
    const detector = new XSSDetector();

    const html = testonlyHtml(`<script>${detector.payload}<${'/'}script>`);
    const range = document.createRange();
    const script = createContextualFragment(range, html).firstChild!;
    document.body.appendChild(script);
    document.body.removeChild(script);

    expect(detector.wasTriggered()).toBe(true);
  });

  it('triggers asynchronously when parsing img with onerror handler',
     async () => {
       const detector = new XSSDetector();

       // The bad-scheme is important to make sure the load fails without having
       // to hit the newtork stack, which would make the test flaky due to the
       // variable time it takes to trigger the onerror handler.
       const html =
           testonlyHtml(`<img src=bad-scheme:_ onerror="${detector.payload}">`);
       const range = document.createRange();
       createContextualFragment(range, html);

       expect(detector.wasTriggered()).toBe(false);

       expect(await detector.waitForTrigger()).toBe(true);
     });

  it('can be instantiated multiple times in parallel', async () => {
    const detector1 = new XSSDetector();
    const detector2 = new XSSDetector();
    const detector3 = new XSSDetector();

    // Access payloads to avoid having the detector complaining
    expect(detector1.payload).toBeTruthy();
    expect(detector2.payload).toBeTruthy();
    expect(detector3.payload).toBeTruthy();

    expect(detector1.wasTriggered()).toBe(false);
    expect(detector2.wasTriggered()).toBe(false);
    expect(detector3.wasTriggered()).toBe(false);

    globalEval(window, testonlyScript(detector2.payload));
    setTimeout(() => {
      globalEval(window, testonlyScript(detector3.payload));
    }, 0);

    expect(detector1.wasTriggered()).toBe(false);
    expect(detector2.wasTriggered()).toBe(true);
    expect(detector3.wasTriggered()).toBe(false);

    expect(await detector1.waitForTrigger()).toBe(false);
    expect(await detector2.waitForTrigger()).toBe(true);
    expect(await detector3.waitForTrigger()).toBe(true);
  });

  it('throws an error if the detector is checked whith an unused payload',
     async () => {
       const detector = new XSSDetector();

       expect(() => detector.wasTriggered()).toThrow();
       await expectAsync(detector.waitForTrigger()).toBeRejected();
     });
});