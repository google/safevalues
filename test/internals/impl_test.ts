/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {createHtml, isHtml, unwrapHtml} from '../../src/internals/html_impl';
import {createResourceUrl, isResourceUrl, unwrapResourceUrl} from '../../src/internals/resource_url_impl';
import {createScript, isScript, unwrapScript} from '../../src/internals/script_impl';
import {createStyle, isStyle, unwrapStyle} from '../../src/internals/style_impl';
import {createStyleSheet, isStyleSheet, unwrapStyleSheet} from '../../src/internals/style_sheet_impl';

interface Impl {
  name: string;
  guard: (value: unknown) => boolean;
  create: (str: string) => {};
  // Functions are contravariant in regards to their param types so unknown does
  // not work here.
  // tslint:disable-next-line:no-any
  unwrap: (value: any) => unknown;
}

const IMPLEMENTATIONS: Impl[] = [
  {
    name: 'SafeHtml',
    guard: isHtml,
    create: createHtml,
    unwrap: unwrapHtml,
  },
  {
    name: 'SafeScript',
    guard: isScript,
    create: createScript,
    unwrap: unwrapScript,
  },
  {
    name: 'SafeStyle',
    guard: isStyle,
    create: createStyle,
    unwrap: unwrapStyle,
  },
  {
    name: 'SafeStyleSheet',
    guard: isStyleSheet,
    create: createStyleSheet,
    unwrap: unwrapStyleSheet,
  },
  {
    name: 'TrustedResourceUrl',
    guard: isResourceUrl,
    create: createResourceUrl,
    unwrap: unwrapResourceUrl,
  },
];

describe('safevalues implementation', () => {
  for (const impl of IMPLEMENTATIONS) {
    describe(`of ${impl.name}`, () => {
      it('stringifies to its inner value', () => {
        const value = impl.create('');
        expect(value.toString()).toBe('');
      });

      describe('guard', () => {
        it('returns true for correct safe type', () => {
          expect(impl.guard(impl.create('test'))).toBeTrue();
        });

        it('returns false for other safe types', () => {
          for (const impl2 of IMPLEMENTATIONS) {
            if (impl.name !== impl2.name) {
              expect(impl.guard(impl2.create('test'))).toBeFalse();
            }
          }
        });

        it('returns false for incorrect type', () => {
          expect(impl.guard('test')).toBeFalse();
        });
      });

      describe('unwrappers', () => {
        it('throw when passed a random object', () => {
          const fakeObj = {
            toString() {
              return 'danger';
            }
          };
          expect(() => impl.unwrap(fakeObj)).toThrowError();
        });

        for (const impl2 of IMPLEMENTATIONS) {
          if (impl.name !== impl2.name) {
            it(`throws when passed a ${impl2.name} value`, () => {
              const value = impl2.create('');
              expect(() => impl.unwrap(value)).toThrowError();
            });
          }
        }
      });
    });
  }
});
