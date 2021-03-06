/*
 * @license
 * Copyright 2021 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {htmlEscape} from '../../src/builders/html_builders';
import {script} from '../../src/builders/script_builders';
import {scriptUrl} from '../../src/builders/script_url_builders';
import {unwrapHtmlAsString, unwrapHtmlForSink} from '../../src/implementation/html_impl';
import {unwrapScriptAsString, unwrapScriptForSink} from '../../src/implementation/script_impl';
import {unwrapScriptUrlAsString, unwrapScriptUrlForSink} from '../../src/implementation/script_url_impl';
import {TEST_ONLY} from '../../src/implementation/trusted_types';

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
  emptyHTML: new MockTrustedHTML(''),
  emptyScript: new MockTrustedScript(''),
  createPolicy: (name: string, stringifiers: TrustedTypePolicyOptions) => ({
    name,
    createHTML: (s: string) => new MockTrustedHTML(stringifiers.createHTML!(s)),
    createScript: (s: string) =>
        new MockTrustedScript(stringifiers.createScript!(s)),
    createScriptURL: (s: string) =>
        new MockTrustedScriptURL(stringifiers.createScriptURL!(s)),
  }),
  isHTML: (o: unknown) => o instanceof MockTrustedHTML,
  isScript: (o: unknown) => o instanceof MockTrustedScript,
  isScriptURL: (o: unknown) => o instanceof MockTrustedScriptURL,
};

// Preserve a reference to all objects that we override for our tests.
const NATIVE_TT = {
  'trustedTypes': Object.getOwnPropertyDescriptor(window, 'trustedTypes'),
  'TrustedHTML': Object.getOwnPropertyDescriptor(window, 'TrustedHTML'),
  'TrustedScript': Object.getOwnPropertyDescriptor(window, 'TrustedScript'),
  'TrustedScriptURL':
      Object.getOwnPropertyDescriptor(window, 'TrustedScriptURL'),
};

/**
 * Sets the globals to mock trustedTypes support or remove support
 * Note that we can't use normal spies here because some of the properties don't
 * have getters or might not exist in some browsers. All we know is that they
 * should be configurable
 */
function setTrustedTypesSupported(trustedTypesSupported: boolean) {
  if (trustedTypesSupported) {
    Object.defineProperties(window, {
      'trustedTypes': {value: mockTrustedTypes, configurable: true},
      'TrustedHTML': {value: MockTrustedHTML, configurable: true},
      'TrustedScript': {value: MockTrustedScript, configurable: true},
      'TrustedScriptURL': {value: MockTrustedScriptURL, configurable: true},
    });
  } else {
    delete window['trustedTypes' as keyof Window];
    delete window['TrustedHTML' as keyof Window];
    delete window['TrustedScript' as keyof Window];
    delete window['TrustedScriptURL' as keyof Window];
  }
}

/** Reset the globals that we replaced to avoid impacting other tests. */
function resetDefaultTrustedTypesSupport() {
  for (const [prop, descriptor] of Object.entries(NATIVE_TT)) {
    if (descriptor === undefined) {
      delete window[prop as keyof Window];
    } else {
      Object.defineProperty(window, prop, descriptor);
    }
  }
}

describe('Trusted Types in safevalues', () => {
  // `usesTrustedTypes` describes behaviour that should be observed when Trusted
  // Types are supported and enabled, and `usesStrings` behaviour when Trusted
  // Types are either not support or not enabled. They are separate functions
  // for code reuse and readability; they are used in the tests below that
  // evaluate the four possible states of Trusted Types enabled/disabled in the
  // library, and Trusted Types supported/not supported by the browser.
  const usesTrustedTypes = () => {
    it('should be used by TrustedHTML', () => {
      const safe = htmlEscape('aaa');
      expect(safe.toString()).toEqual('aaa');
      expect(unwrapHtmlAsString(safe)).toEqual('aaa');
      expect(unwrapHtmlForSink(safe) as unknown)
          .toEqual(new MockTrustedHTML('aaa'));
    });

    it('should be used by TrustedScript', () => {
      const safe = script`a = b;`;
      expect(safe.toString()).toEqual('a = b;');
      expect(unwrapScriptAsString(safe)).toEqual('a = b;');
      expect(unwrapScriptForSink(safe) as unknown)
          .toEqual(new MockTrustedScript('a = b;'));
    });

    it('should be used by TrustedScriptURL', () => {
      const safe = scriptUrl`a/b/c`;
      expect(safe.toString()).toEqual('a/b/c');
      expect(unwrapScriptUrlAsString(safe)).toEqual('a/b/c');
      expect(unwrapScriptUrlForSink(safe) as unknown)
          .toEqual(new MockTrustedScriptURL('a/b/c'));
    });
  };

  const usesStrings = () => {
    afterEach(() => {
      expect(mockTrustedTypes.createPolicy).not.toHaveBeenCalled();
    });

    it('should not be used by TrustedHTML', () => {
      const safe = htmlEscape('aaa');
      expect(safe.toString()).toEqual('aaa');
      expect(unwrapHtmlAsString(safe)).toEqual('aaa');
      expect(unwrapHtmlForSink(safe) as unknown).toEqual('aaa');
    });

    it('should not be used by TrustedScript', () => {
      const safe = script`a = b;`;
      expect(safe.toString()).toEqual('a = b;');
      expect(unwrapScriptAsString(safe)).toEqual('a = b;');
      expect(unwrapScriptForSink(safe) as unknown).toEqual('a = b;');
    });

    it('should not be used by TrustedScriptURL', () => {
      const safe = scriptUrl`a/b/c`;
      expect(safe.toString()).toEqual('a/b/c');
      expect(unwrapScriptUrlAsString(safe)).toEqual('a/b/c');
      expect(unwrapScriptUrlForSink(safe) as unknown).toEqual('a/b/c');
    });
  };

  describe('when enabled and supported', () => {
    beforeEach(() => {
      setTrustedTypesSupported(true);
      TEST_ONLY.resetDefaults();
      TEST_ONLY.setTrustedTypesPolicyName('safevalues#testing');
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      resetDefaultTrustedTypesSupport();
      TEST_ONLY.resetDefaults();
    });

    usesTrustedTypes();
  });

  describe('when supported but disabled', () => {
    beforeEach(() => {
      setTrustedTypesSupported(true);
      TEST_ONLY.resetDefaults();
      TEST_ONLY.setTrustedTypesPolicyName('');
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      resetDefaultTrustedTypesSupport();
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });

  describe('when enabled but not supported', () => {
    beforeEach(() => {
      setTrustedTypesSupported(false);
      TEST_ONLY.resetDefaults();
      TEST_ONLY.setTrustedTypesPolicyName('safevalues#testing');
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      resetDefaultTrustedTypesSupport();
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });

  describe('when disabled and not supported', () => {
    beforeEach(() => {
      setTrustedTypesSupported(false);
      TEST_ONLY.resetDefaults();
      TEST_ONLY.setTrustedTypesPolicyName('');
      spyOn(mockTrustedTypes, 'createPolicy').and.callThrough();
    });

    afterEach(() => {
      resetDefaultTrustedTypesSupport();
      TEST_ONLY.resetDefaults();
    });

    usesStrings();
  });
});
