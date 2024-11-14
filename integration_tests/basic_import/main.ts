/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlEscape} from 'safevalues';
import {setElementInnerHtml} from 'safevalues/dom';
import {
  htmlSafeByReview,
  styleSheetSafeByReview,
} from 'safevalues/restricted/reviewed';

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
    expect(
      styleSheetSafeByReview('hello', {justification: 'test'}).toString(),
    ).toEqual('hello');
  });
});

describe('safevalues/dom', () => {
  it('can be referenced', () => {
    const e = document.createElement('div');
    setElementInnerHtml(
      e,
      htmlSafeByReview('<p>hello</p>', {justification: 'test'}),
    );
    expect(e.innerHTML).toEqual('<p>hello</p>');
  });
});
