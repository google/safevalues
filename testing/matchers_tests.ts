/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests that the safe type argument matchers behave as expected.
 */

import {SafeUrl as GoogSafeUrl} from 'google3/third_party/javascript/closure/html/safeurl';
import {TrustedScriptURL as GoogScriptUrl} from 'google3/third_party/javascript/closure/html/trustedresourceurl';
import {mockFunction, verify} from 'google3/third_party/javascript/closure/labs/mock/mock';
import {Const} from 'google3/third_party/javascript/closure/string/const';
import {safeUrl, SafeUrl as TsSafeUrl, scriptUrl, TrustedScriptURL as TsScriptUrl} from 'safevalues';

import {resourceUrlMatcher, urlMatcher} from './matchers';

describe('urlMatcher', () => {
  describe('with TS types', () => {
    let mock: (x: TsSafeUrl) => void;
    beforeEach(() => {
      mock = mockFunction() as unknown as (x: TsSafeUrl) => void;
    });

    it('can compare to an expected value passed as a string when used in a closure test',
       () => {
         mock(safeUrl`https://test.com`);
         verify(mock)(urlMatcher('https://test.com'));
       });

    it('matches to an expected plain string', () => {
      const matcher = urlMatcher('https://test.com');
      expect(matcher.matches(safeUrl`https://test.com`)).toBeTrue();
    });

    it('silently unwraps when a safe type is passed as the expected value when used in a closure test',
       () => {
         mock(safeUrl`https://test.com`);
         verify(mock)(urlMatcher(safeUrl`https://test.com`));
       });

    it('fails when an expected value does not match the wrapped url', () => {
      const matcher = urlMatcher(safeUrl`https://test.com`);
      expect(matcher.matches(safeUrl`https://nottest.com`)).toBeFalse();
    });
  });

  describe('with Closure types', () => {
    let mock: (x: GoogSafeUrl) => void;
    beforeEach(() => {
      mock = mockFunction() as unknown as (x: GoogSafeUrl) => void;
    });

    it('can compare to an expected value passed as a string when used in a closure test',
       () => {
         mock(GoogSafeUrl.fromConstant(Const.from('https://test.com')));
         verify(mock)(urlMatcher('https://test.com'));
       });

    it('matches to an expected plain string', () => {
      const matcher = urlMatcher('https://test.com');
      expect(matcher.matches(
                 GoogSafeUrl.fromConstant(Const.from('https://test.com'))))
          .toBeTrue();
    });

    it('silently unwraps when a safe type is passed as the expected value when used in a closure test',
       () => {
         mock(GoogSafeUrl.fromConstant(Const.from('https://test.com')));
         verify(mock)(urlMatcher(
             GoogSafeUrl.fromConstant(Const.from('https://test.com'))));
       });

    it('fails when an expected value does not match the wrapped url', () => {
      const matcher =
          urlMatcher(GoogSafeUrl.fromConstant(Const.from('https://test.com')));
      expect(matcher.matches(
                 GoogSafeUrl.fromConstant(Const.from('https://nottest.com'))))
          .toBeFalse();
    });
  });
});

describe('resourceUrlMatcher', () => {
  describe('with TS types', () => {
    let mock: (x: TsScriptUrl) => void;
    beforeEach(() => {
      mock = mockFunction() as unknown as (x: TsScriptUrl) => void;
    });

    it('can compare to the expected value passed as a string when used in a closure test',
       () => {
         mock(scriptUrl`https://test.com`);
         verify(mock)(resourceUrlMatcher('https://test.com'));
       });

    it('matches to an expected plain string', () => {
      const matcher = resourceUrlMatcher('https://test.com');
      expect(matcher.matches(scriptUrl`https://test.com`)).toBeTrue();
    });

    it('silently unwraps when a safe type is passed as the expected value when used in a closure test',
       () => {
         mock(scriptUrl`https://test.com`);
         verify(mock)(resourceUrlMatcher(scriptUrl`https://test.com`));
       });

    it('fails when an expected value does not match the wrapped url', () => {
      const matcher = resourceUrlMatcher(scriptUrl`https://test.com`);
      expect(matcher.matches(scriptUrl`https://nottest.com`)).toBeFalse();
    });
  });

  describe('with Closure types', () => {
    let mock: (x: GoogScriptUrl) => void;
    beforeEach(() => {
      mock = mockFunction() as unknown as (x: GoogScriptUrl) => void;
    });

    it('can compare to an expected value passed as a string when used in a closure test',
       () => {
         mock(GoogScriptUrl.fromConstant(Const.from('https://test.com')));
         verify(mock)(resourceUrlMatcher('https://test.com'));
       });

    it('matches to an expected plain string', () => {
      const matcher = resourceUrlMatcher('https://test.com');
      expect(matcher.matches(
                 GoogScriptUrl.fromConstant(Const.from('https://test.com'))))
          .toBeTrue();
    });

    it('silently unwraps when a safe type is passed as the expected value when used in a closure test',
       () => {
         mock(GoogScriptUrl.fromConstant(Const.from('https://test.com')));
         verify(mock)(resourceUrlMatcher(
             GoogScriptUrl.fromConstant(Const.from('https://test.com'))));
       });

    it('fails when an expected value does not match the wrapped url', () => {
      const matcher = resourceUrlMatcher(
          GoogScriptUrl.fromConstant(Const.from('https://test.com')));
      expect(matcher.matches(
                 GoogScriptUrl.fromConstant(Const.from('https://nottest.com'))))
          .toBeFalse();
    });
  });
});