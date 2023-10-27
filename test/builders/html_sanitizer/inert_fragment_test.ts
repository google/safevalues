/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createInertFragment} from '../../../src/builders/html_sanitizer/inert_fragment';
import {XSSDetector} from '../../testing/internal/xss_detector';

describe('createInertFragment', () => {
  it('fails if non-inert document is passed', async () => {
    expect(() => createInertFragment('', document)).toThrow();
  });

  it('returns script nodes without evaluating them', async () => {
    const detector = new XSSDetector();
    const doc = document.implementation.createHTMLDocument('');
    const fragment =
        createInertFragment(`<script>${detector.payload}</script>`, doc);

    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.firstChild!.nodeName).toBe('SCRIPT');

    expect(await detector.waitForTrigger()).toBe(false);
  });

  it('returns img nodes without evaluating them', async () => {
    const detector = new XSSDetector();
    // The bad-scheme is important to make sure the load fails without having
    // to hit the network stack, which ensures that the XSS (if there is one)
    // would trigger before the detector's timeout.
    const doc = document.implementation.createHTMLDocument('');
    const fragment = createInertFragment(
        `<img src=bad-scheme:_ onerror=${detector.payload}()>`, doc);

    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.firstChild!.nodeName).toBe('IMG');

    expect(await detector.waitForTrigger()).toBe(false);
  });
});
