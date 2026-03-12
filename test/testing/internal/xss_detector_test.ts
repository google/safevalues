/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {setScriptSrc} from '../../../src/dom/elements/script';
import {globalEval} from '../../../src/dom/globals/global';
import {rangeCreateContextualFragment} from '../../../src/dom/globals/range';
import {
  testonlyHtml,
  testonlyResourceUrl,
  testonlyScript,
} from '../conversions';

import {XSSDetector} from './xss_detector';

describe('XSSDetector', () => {
  it('times out when not triggered', async () => {
    const detector = new XSSDetector();

    // Access payload to make sure no error is thrown.
    expect(detector.payload).toBeTruthy();

    expect(await detector.waitForTrigger()).toBe(false);
  });

  it('triggers asynchronously for script with src', async () => {
    const detector = new XSSDetector();

    const script = document.createElement('script');
    const url = testonlyResourceUrl(`data:text/javascript,${detector.payload}`);
    setScriptSrc(script, url);
    document.body.appendChild(script);
    document.body.removeChild(script);

    expect(await detector.waitForTrigger()).toBe(true);
  });

  it('triggers asynchronously when parsing img with onerror handler', async () => {
    const detector = new XSSDetector();

    // The bad-scheme is important to make sure the load fails without having
    // to hit the newtork stack, which would make the test flaky due to the
    // variable time it takes to trigger the onerror handler.
    const html = testonlyHtml(
      `<img src=bad-scheme:_ onerror="${detector.payload}">`,
    );
    const range = document.createRange();
    rangeCreateContextualFragment(range, html);

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

    globalEval(window, testonlyScript(detector2.payload));
    setTimeout(() => {
      globalEval(window, testonlyScript(detector3.payload));
    }, 0);

    expect(await detector1.waitForTrigger()).toBe(false);
    expect(await detector2.waitForTrigger()).toBe(true);
    expect(await detector3.waitForTrigger()).toBe(true);
  });

  it('throws an error if the detector is checked whith an unused payload', async () => {
    const detector = new XSSDetector();

    await expectAsync(detector.waitForTrigger()).toBeRejected();
  });
});
