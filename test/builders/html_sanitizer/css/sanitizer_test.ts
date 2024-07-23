/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ResourceUrlPolicy,
  ResourceUrlPolicyHintsType,
} from '../../../../src/builders/html_sanitizer/css/../resource_url_policy';
import {
  PropertyDiscarder,
  sanitizeStyleAttribute,
  sanitizeStyleElement,
} from '../../../../src/builders/html_sanitizer/css/sanitizer';

describe('sanitizeStyleElement', () => {
  interface TestCase {
    input: string;
    expected: string[];
  }
  const PROPERTY_ALLOWLIST = new Set([
    'background-color',
    'background',
    'background-image',
    'color',
  ]);
  const IDENTITY_RESOURCE_POLICY: ResourceUrlPolicy = (url) => url;
  const FUNCTION_ALLOWLIST = new Set(['rgb', 'rgba', 'url']);
  const TEST_CASES: TestCase[] = [
    {
      input: 'body { background-color: red; }',
      expected: ['body { background-color: red; }'],
    },
    {
      input: 'body { font-face: Tahoma; }',
      expected: ['body {  }'],
    },
    {
      input: '@random-at-rule { }',
      expected: [''],
    },
    {
      input: 'invalid:selector { } div { background-color: red; }',
      expected: ['div { background-color: red; }'],
    },
    {
      input: 'body { nested { background-color: red } }',
      // Nested rules are currently not supported.
      expected: ['body {  }'],
    },
    {
      input: 'span,abc { background-color: red !important; }',
      expected: ['span, abc { background-color: red !important; }'],
    },
    // Tests for :host, :host() and :host-context()
    {
      input: ':host { background-color: red; }',
      expected: [''],
    },
    {
      input: ':host(div) { background-color: red; }',
      expected: [''],
    },
    {
      input: ':host-context(div) { background-color: red; }',
      expected: [''],
    },
    {
      input: ':HOst { background-color: red; }',
      expected: [''],
    },
    {
      input: ':HoSt(div) { background-color: red; }',
      expected: [''],
    },
    {
      input: ':hosT-coNTExt(div) { background-color: red; }',
      expected: [''],
    },
    // Tests for the order of properties (should be sorted)
    {
      input: 'body { background-color: red; color: red; }',
      expected: ['body { background-color: red;color: red; }'],
    },
    {
      input: 'body { color: red; background-color: red; }',
      expected: ['body { background-color: red;color: red; }'],
    },
    // Tests for function allowlist
    {
      input: 'body { color: rgb(1, 2, 3); }',
      expected: ['body { color: rgb(1, 2, 3); }'],
    },
    {
      input: 'body { color: rgb(1 2 3 / 0.5); }',
      expected: [
        // This expectation may be surprising but browsers tend to change
        // function names to different, equivalent ones in certain cases.
        'body { color: rgba(1, 2, 3, 0.5); }',
      ],
    },
    {
      input: 'body { color: oklch(20% 0.123 0.456); }',
      expected: ['body {  }'],
    },
    {
      input: 'body { background-image: url("https://www.google.com") }',
      expected: ['body { background-image: url("https://www.google.com/"); }'],
    },
  ];
  for (const testCase of TEST_CASES) {
    it(`sanitizes ${JSON.stringify(testCase.input)} correctly`, () => {
      const sanitized = sanitizeStyleElement(
        testCase.input,
        PROPERTY_ALLOWLIST,
        FUNCTION_ALLOWLIST,
        IDENTITY_RESOURCE_POLICY,
        false,
        [],
      );
      expect(testCase.expected).toContain(sanitized);
    });
  }

  describe('without a custom resource url policy', () => {
    it('allows all URLs', () => {
      const propertyAllowlist = new Set([
        'background-image',
        'border-image-source',
        'cursor',
      ]);
      const functionAllowlist = new Set(['url']);
      const sanitized = sanitizeStyleElement(
        `
          body { background-image: url("https://www.google.com") }
          div { border-image-source: url("file:///etc/passwd") }
          span { cursor: url(/relative/path), pointer }
        `,
        propertyAllowlist,
        functionAllowlist,
        undefined, // resourceUrlPolicy
        false,
        [],
      );
      const relativePath = new URL(
        '/relative/path',
        document.baseURI,
      ).toString();
      expect(sanitized).toEqual(
        `body { background-image: url("https://www.google.com/"); }
div { border-image-source: url("file:///etc/passwd"); }
span { cursor: url("${relativePath}"), pointer; }`,
      );
    });
  });

  describe('with a custom resource url policy', () => {
    it('calls the policy with a valid URL and hints', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(new URL('about:blank'));
      const propertyAllowlist = new Set([
        'background-image',
        'border-image-source',
        'cursor',
      ]);
      const functionAllowlist = new Set(['url']);
      sanitizeStyleElement(
        `
          body { background-image: url("https://www.google.com") }
          div { border-image-source: url("file:///etc/passwd") }
          span { cursor: url(/relative/path), pointer }
        `,
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        false,
        [],
      );

      expect(resourceUrlPolicy).toHaveBeenCalledTimes(3);
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://www.google.com'),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ELEMENT,
          propertyName: 'background-image',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('file:///etc/passwd'),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ELEMENT,
          propertyName: 'border-image-source',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('/relative/path', document.baseURI),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ELEMENT,
          propertyName: 'cursor',
        },
      );
    });

    it('uses the returned URL if the policy returns a string', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(new URL('https://from-policy.com'));
      const propertyAllowlist = new Set(['background-image']);
      const functionAllowlist = new Set(['url']);

      const sanitized = sanitizeStyleElement(
        'body { background-image: url("https://www.google.com") }',
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        false,
        [],
      );

      expect(sanitized).toEqual(
        'body { background-image: url("https://from-policy.com/"); }',
      );
    });

    it('deletes a property if the policy returns null', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(null);
      const propertyAllowlist = new Set(['background-image']);
      const functionAllowlist = new Set(['url']);

      const sanitized = sanitizeStyleElement(
        'body { background-image: url("https://www.google.com") }',
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        false,
        [],
      );

      expect(sanitized).toEqual('body {  }');
    });
  });

  describe('with allowKeyframes = true', () => {
    it('allows keyframes', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const sanitized = sanitizeStyleElement(
        '@keyframes test { 0% { background-color: red; } 100% { background-color: blue; } }',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        true,
        [],
      );
      expect(sanitized).toEqual(
        '@keyframes test { 0% { background-color: red; } 100% { background-color: blue; } }',
      );
    });

    it('escapes the @keyframes name', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const sanitized = sanitizeStyleElement(
        String.raw`@keyframes test\{\}\@ {  }`,
        propertyAllowlist,
        functionAllowlist,
        () => null,
        true,
        [],
      );
      expect(sanitized).toEqual(String.raw`@keyframes test\7b \7d \40  {  }`);
    });
  });

  it('with allowKeyframes = false, disallows keyframes', () => {
    const propertyAllowlist = new Set(['background-color']);
    const functionAllowlist = new Set<string>();
    const sanitized = sanitizeStyleElement(
      '@keyframes test { 0% { background-color: red; } 100% { background-color: blue; } }',
      propertyAllowlist,
      functionAllowlist,
      () => null,
      false,
      [],
    );
    expect(sanitized).toEqual('');
  });

  describe('propertyDiscarders', () => {
    it('are called for each property which is in the allowlist', () => {
      const propertyAllowlist = new Set([
        'background-color',
        'background-image',
      ]);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      sanitizeStyleElement(
        'body { background-color: red; background-image: url("https://www.google.com"); color:red; }',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        false,
        propertyDiscarders,
      );
      for (const discarder of propertyDiscarders) {
        expect(discarder).toHaveBeenCalledTimes(2);
        expect(discarder).toHaveBeenCalledWith('background-color');
        expect(discarder).toHaveBeenCalledWith('background-image');
        expect(discarder).not.toHaveBeenCalledWith('color');
      }
    });
    it('allow a property if none of the discarders disallow it', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      const sanitized = sanitizeStyleElement(
        'body { background-color: red; }',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        false,
        propertyDiscarders,
      );
      expect(sanitized).toEqual('body { background-color: red; }');
    });
    it('disallow a property if at least one of the discarders disallows it', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(true),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      const sanitized = sanitizeStyleElement(
        'body { background-color: red; }',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        false,
        propertyDiscarders,
      );
      expect(sanitized).toEqual('body {  }');
    });
  });
});

describe('sanitizeStyleAttribute', () => {
  interface TestCase {
    input: string;
    expected: string[];
  }
  const PROPERTY_ALLOWLIST = new Set([
    'background-color',
    'background',
    'background-image',
    'color',
  ]);
  const IDENTITY_RESOURCE_POLICY: ResourceUrlPolicy = (url) => url;
  const FUNCTION_ALLOWLIST = new Set(['rgb', 'rgba', 'url']);
  const TEST_CASES: TestCase[] = [
    {
      input: 'background-color: red;',
      expected: ['background-color: red;'],
    },
    {
      input: 'font-face: Tahoma;',
      expected: [''],
    },
    {
      input: 'background-color: red !important;',
      expected: ['background-color: red !important;'],
    },
    // Tests for the order of properties (should be sorted)
    {
      input: 'background-color: red; color: red;',
      expected: ['background-color: red;color: red;'],
    },
    {
      input: 'color: red; background-color: red;',
      expected: ['background-color: red;color: red;'],
    },
    // Tests for function allowlist
    {
      input: 'color: rgb(1, 2, 3);',
      expected: ['color: rgb(1, 2, 3);'],
    },
    {
      input: 'color: rgb(1 2 3 / 0.5);',
      expected: [
        // This expectation may be surprising but browsers tend to change
        // function names to different, equivalent ones in certain cases.
        'color: rgba(1, 2, 3, 0.5);',
      ],
    },
    {
      input: 'color: oklch(20% 0.123 0.456);',
      expected: [''],
    },
    {
      input: 'background-image: url("https://www.google.com")',
      expected: ['background-image: url("https://www.google.com/");'],
    },
  ];
  for (const testCase of TEST_CASES) {
    it(`sanitizes ${JSON.stringify(testCase.input)} correctly`, () => {
      const sanitized = sanitizeStyleAttribute(
        testCase.input,
        PROPERTY_ALLOWLIST,
        FUNCTION_ALLOWLIST,
        IDENTITY_RESOURCE_POLICY,
        [],
      );
      expect(testCase.expected).toContain(sanitized);
    });
  }

  describe('with a custom resource url policy', () => {
    it('calls the policy with a valid URL and hints', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(new URL('about:blank'));
      const propertyAllowlist = new Set([
        'background-image',
        'border-image-source',
        'cursor',
      ]);
      const functionAllowlist = new Set(['url']);

      sanitizeStyleAttribute(
        `
          background-image: url("https://www.google.com");
          border-image-source: url("file:///etc/passwd");
          cursor: url(/relative/path), pointer;
        `,
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        [],
      );

      expect(resourceUrlPolicy).toHaveBeenCalledTimes(3);
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('https://www.google.com'),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ATTRIBUTE,
          propertyName: 'background-image',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('file:///etc/passwd'),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ATTRIBUTE,
          propertyName: 'border-image-source',
        },
      );
      expect(resourceUrlPolicy).toHaveBeenCalledWith(
        new URL('/relative/path', document.baseURI),
        {
          type: ResourceUrlPolicyHintsType.STYLE_ATTRIBUTE,
          propertyName: 'cursor',
        },
      );
    });

    it('uses the returned URL if the policy returns a string', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(new URL('https://from-policy.com'));
      const propertyAllowlist = new Set(['background-image']);
      const functionAllowlist = new Set(['url']);

      const sanitized = sanitizeStyleAttribute(
        'background-image: url("https://www.google.com")',
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        [],
      );

      expect(sanitized).toEqual(
        'background-image: url("https://from-policy.com/");',
      );
    });

    it('deletes a property if the policy returns null', () => {
      const resourceUrlPolicy = jasmine
        .createSpy<ResourceUrlPolicy>()
        .and.returnValue(null);
      const propertyAllowlist = new Set(['background-image']);
      const functionAllowlist = new Set(['url']);

      const sanitized = sanitizeStyleAttribute(
        'background-image: url("https://www.google.com")',
        propertyAllowlist,
        functionAllowlist,
        resourceUrlPolicy,
        [],
      );

      expect(sanitized).toEqual('');
    });
  });

  describe('propertyDiscarders', () => {
    it('are called for each property which is in the allowlist', () => {
      const propertyAllowlist = new Set([
        'background-color',
        'background-image',
      ]);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      sanitizeStyleAttribute(
        'background-color: red; background-image: url("https://www.google.com"); color:red;',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        propertyDiscarders,
      );
      for (const discarder of propertyDiscarders) {
        expect(discarder).toHaveBeenCalledTimes(2);
        expect(discarder).toHaveBeenCalledWith('background-color');
        expect(discarder).toHaveBeenCalledWith('background-image');
        expect(discarder).not.toHaveBeenCalledWith('color');
      }
    });
    it('allow a property if none of the discarders disallow it', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      const sanitized = sanitizeStyleAttribute(
        'background-color: red;',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        propertyDiscarders,
      );
      expect(sanitized).toEqual('background-color: red;');
    });
    it('disallow a property if at least one of the discarders disallows it', () => {
      const propertyAllowlist = new Set(['background-color']);
      const functionAllowlist = new Set<string>();
      const propertyDiscarders = [
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(true),
        jasmine.createSpy<PropertyDiscarder>().and.returnValue(false),
      ];
      const sanitized = sanitizeStyleAttribute(
        'background-color: red;',
        propertyAllowlist,
        functionAllowlist,
        () => null,
        propertyDiscarders,
      );
      expect(sanitized).toEqual('');
    });
  });
});
