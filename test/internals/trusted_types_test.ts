/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlEscape} from '../../src/builders/html_builders';
import {trustedResourceUrl} from '../../src/builders/resource_url_builders';
import {safeScript} from '../../src/builders/script_builders';

import {unwrapHtml} from '../../src/internals/html_impl';
import {unwrapResourceUrl} from '../../src/internals/resource_url_impl';
import {unwrapScript} from '../../src/internals/script_impl';
import {TEST_ONLY} from '../../src/internals/trusted_types';
import {
  TrustedTypePolicyFactory,
  TrustedTypePolicyOptions,
} from '../../src/internals/trusted_types_typings';

/** A mock TrustedHTML type */
class MockTrustedHTML {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

/** A mock TrustedScript type */
class MockTrustedScript {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

/** A mock TrustedScriptURL type */
class MockTrustedScriptURL {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

/** A mock window.trustedTypes based on the mocked Trusted Types from above */
const mockTrustedTypes = {
  createPolicy: (name: string, stringifiers: TrustedTypePolicyOptions) => ({
    name,
    createHTML: (s: string) => new MockTrustedHTML(stringifiers.createHTML!(s)),
    createScript: (s: string) =>
      new MockTrustedScript(stringifiers.createScript!(s)),
    createScriptURL: (s: string) =>
      new MockTrustedScriptURL(stringifiers.createScriptURL!(s)),
  }),
} as unknown as TrustedTypePolicyFactory;

describe('Trusted Types in safevalues', () => {
  beforeAll(() => {
    // Clear any cached policy created from other tests before running this
    // test suite.
    TEST_ONLY.resetDefaults();
  });

  // `usesTrustedTypes` describes behaviour that should be observed when Trusted
  // Types are supported and enabled, and `usesStrings` behaviour when Trusted
  // Types are either not support or not enabled. They are separate functions
  // for code reuse and readability; they are used in the tests below that
  // evaluate the four possible states of Trusted Types enabled/disabled in the
  // library, and Trusted Types supported/not supported by the browser.
  const usesTrustedTypes = () => {
    beforeEach(() => {
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      expect(mockTrustedTypes.createPolicy).toHaveBeenCalled();
    });

    it('should be used by SafeHtml', () => {
      const safe = htmlEscape('aaa');
      expect(safe.toString()).toEqual('aaa');
      expect(unwrapHtml(safe).toString()).toEqual('aaa');
      expect(unwrapHtml(safe) as unknown).toEqual(new MockTrustedHTML('aaa'));
    });

    it('should be used by SafeScript', () => {
      const safe = safeScript`a = b;`;
      expect(safe.toString()).toEqual('a = b;');
      expect(unwrapScript(safe).toString()).toEqual('a = b;');
      expect(unwrapScript(safe) as unknown).toEqual(
        new MockTrustedScript('a = b;'),
      );
    });

    it('should be used by TrustedResourceUrl', () => {
      const safe = trustedResourceUrl`a/b/c`;
      expect(safe.toString()).toEqual('a/b/c');
      expect(unwrapResourceUrl(safe).toString()).toEqual('a/b/c');
      expect(unwrapResourceUrl(safe) as unknown).toEqual(
        new MockTrustedScriptURL('a/b/c'),
      );
    });
  };

  const usesStrings = () => {
    beforeEach(() => {
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      expect(mockTrustedTypes.createPolicy).not.toHaveBeenCalled();
    });

    it('should not be used by SafeHtml', () => {
      const safe = htmlEscape('aaa');
      expect(safe.toString()).toEqual('aaa');
      expect(unwrapHtml(safe).toString()).toEqual('aaa');
      expect(unwrapHtml(safe) as unknown).toEqual('aaa');
    });

    it('should not be used by SafeScript', () => {
      const safe = safeScript`a = b;`;
      expect(safe.toString()).toEqual('a = b;');
      expect(unwrapScript(safe).toString()).toEqual('a = b;');
      expect(unwrapScript(safe) as unknown).toEqual('a = b;');
    });

    it('should not be used by TrustedResourceUrl', () => {
      const safe = trustedResourceUrl`a/b/c`;
      expect(safe.toString()).toEqual('a/b/c');
      expect(unwrapResourceUrl(safe).toString()).toEqual('a/b/c');
      expect(unwrapResourceUrl(safe) as unknown).toEqual('a/b/c');
    });
  };

  describe('when enabled and supported', () => {
    beforeEach(() => {
      TEST_ONLY.setTrustedTypes(mockTrustedTypes);
      TEST_ONLY.setPolicyName('safevalues#testing');
    });

    afterEach(() => {
      TEST_ONLY.resetDefaults();
    });

    usesTrustedTypes();
  });

  describe('when supported but disabled', () => {
    beforeEach(() => {
      TEST_ONLY.setTrustedTypes(mockTrustedTypes);
      TEST_ONLY.setPolicyName('');
    });

    afterEach(() => {
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });

  describe('when enabled but not supported', () => {
    beforeEach(() => {
      TEST_ONLY.setTrustedTypes(undefined);
      TEST_ONLY.setPolicyName('safevalues#testing');
    });

    afterEach(() => {
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });

  describe('when disabled and not supported', () => {
    beforeEach(() => {
      TEST_ONLY.setTrustedTypes(undefined);
      TEST_ONLY.setPolicyName('');
    });

    afterEach(() => {
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });
});
