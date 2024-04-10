/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createHtmlInternal,
  isHtml,
  SafeHtml,
  unwrapHtml,
} from '../../src/internals/html_impl';
import {
  createResourceUrlInternal,
  isResourceUrl,
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../src/internals/resource_url_impl';
import {
  createScriptInternal,
  isScript,
  SafeScript,
  unwrapScript,
} from '../../src/internals/script_impl';
import {
  createStyleSheetInternal,
  isStyleSheet,
  SafeStyleSheet,
  unwrapStyleSheet,
} from '../../src/internals/style_sheet_impl';

interface Impl {
  name: string;
  constructor: unknown;
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
    constructor: SafeHtml,
    guard: isHtml,
    create: createHtmlInternal,
    unwrap: unwrapHtml,
  },
  {
    name: 'SafeScript',
    constructor: SafeScript,
    guard: isScript,
    create: createScriptInternal,
    unwrap: unwrapScript,
  },
  {
    name: 'SafeStyleSheet',
    constructor: SafeStyleSheet,
    guard: isStyleSheet,
    create: createStyleSheetInternal,
    unwrap: unwrapStyleSheet,
  },
  {
    name: 'TrustedResourceUrl',
    constructor: TrustedResourceUrl,
    guard: isResourceUrl,
    create: createResourceUrlInternal,
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

      describe('constructor', () => {
        it('can be used with instanceof', () => {
          expect(impl.create('test')).toBeInstanceOf(
            impl.constructor as jasmine.Constructor,
          );
        });

        it('is different for different types', () => {
          for (const impl2 of IMPLEMENTATIONS) {
            if (impl.name !== impl2.name) {
              expect(impl2.create('test')).not.toBeInstanceOf(
                impl.constructor as jasmine.Constructor,
              );
            }
          }
        });
      });

      describe('unwrappers', () => {
        it('throw when passed a random object', () => {
          const fakeObj = {
            toString() {
              return 'danger';
            },
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
