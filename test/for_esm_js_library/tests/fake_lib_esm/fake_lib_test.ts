/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests that fake_lib works as intended when depending on
 * esm safevalues.
 */

import * as fakeLib from 'fake_lib';
import {
  SafeHtml,
  safeScript,
  trustedResourceUrl,
  TrustedResourceUrl,
} from 'safevalues';
import {setElementInnerHtml} from 'safevalues/dom';

describe('test_lib', () => {
  it('setGreetingSanitize works as intended', () => {
    const div = document.createElement('div');
    fakeLib.setGreetingSanitize(div, 'Google');
    expect(div.innerHTML).toBe('Hello Google!');
  });

  it('setElementAttributeImageSrc works as intended', () => {
    const img = document.createElement('img');
    fakeLib.setElementAttributeImageSrc(img, '/foo.jpg');
    expect(img.src).toMatch(/\/foo.jpg$/);
  });

  it('setElementAttributeScriptSrc accepts a TrustedResourceUrl', () => {
    const myScript = document.createElement('script');
    fakeLib.setElementAttributeScriptSrc(
      myScript,
      trustedResourceUrl`/script.js`,
    );
    expect(myScript.src).toMatch(/\/script.js$/);
  });

  it('setElementAttributeScriptSrc throws when given string', () => {
    const myScript = document.createElement('script');
    expect(() => {
      fakeLib.setElementAttributeScriptSrc(
        myScript,
        '/script.js' as unknown as TrustedResourceUrl,
      );
    }).toThrow();
  });

  it('setElementAttributeScriptSrc throws when given the wrong safe type', () => {
    const myScript = document.createElement('script');
    expect(() => {
      fakeLib.setElementAttributeScriptSrc(
        myScript,
        safeScript`/script.js` as unknown as TrustedResourceUrl,
      );
    }).toThrow();
  });

  it('safe type instances returned through a esm_js_library are compatible with safevalues loaded from a normal dep', () => {
    const htmlGreeting = fakeLib.sanitizeGreeting('friend');
    expect(htmlGreeting instanceof SafeHtml).toBe(true);
    const host = document.createElement('span');
    setElementInnerHtml(host, htmlGreeting);
    expect(host.innerHTML).toBe('<div>Hello friend!</div>');
  });
});
