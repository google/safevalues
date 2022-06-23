/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createInertFragment} from '../../../src/builders/html_sanitizer/inert_fragment';


describe('createInertFragment', () => {
  it('returns script nodes', () => {
    const fragment = createInertFragment('<script></script>');
    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.firstChild!.nodeName).toBe('SCRIPT');
  });
});
