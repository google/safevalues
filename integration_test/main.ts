/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlEscape} from 'safevalues';
import {styleSheetSafeByReview} from 'safevalues/restricted/reviewed';

function doSomething() {
  const html = htmlEscape('hello <world>');
  console.log(html.toString());
  return 'alright';
}

describe('doSomething', () => {
  it('works', () => {
    const status = doSomething();
    expect(status).toEqual('alright');
  });
});

describe('safevalues/restricted/reviewed', () => {
  it('can be referenced', () => {
    expect(styleSheetSafeByReview('hello', 'test').toString()).toEqual('hello');
  });
});
