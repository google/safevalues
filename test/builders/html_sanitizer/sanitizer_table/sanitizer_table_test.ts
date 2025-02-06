/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributePolicyAction,
  isCustomElement,
  SanitizerTable,
} from '../../../../src/builders/html_sanitizer/sanitizer_table/sanitizer_table';

const sanitizerTable = new SanitizerTable(
  new Set<string>([]),
  new Map([
    ['A', new Map([['href', {policyAction: AttributePolicyAction.KEEP}]])],
  ]),
  new Set<string>([]),
  new Map([
    ['href', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
  ]),
  new Set<string>(['test-allowed-attribute-prefix-']),
);

describe('sanitizer table test', () => {
  it('gets the policy of an element that exists', () => {
    expect(sanitizerTable.isAllowedElement('A')).toBeTrue();
  });

  it('returns a drop policy if the element does not exist', () => {
    expect(sanitizerTable.isAllowedElement('B')).toBeFalse();
  });

  it('returns the element specific policy for an attribute', () => {
    const policy = sanitizerTable.getAttributePolicy('href', 'A').policyAction;
    expect(policy).toBe(AttributePolicyAction.KEEP);
  });

  it('returns the global policy for prefixed attributes', () => {
    const policy = sanitizerTable.getAttributePolicy(
      'test-allowed-attribute-prefix-attr',
      'A',
    ).policyAction;
    expect(policy).toBe(AttributePolicyAction.KEEP);
  });

  it('returns the global policy for an attribute when no element specific one exists', () => {
    const policy = sanitizerTable.getAttributePolicy('href', 'B').policyAction;
    expect(policy).toBe(AttributePolicyAction.KEEP_AND_SANITIZE_URL);
  });

  it('returns a drop policy when the attribute does not exist', () => {
    const policy = sanitizerTable.getAttributePolicy(
      'nonexisten_attribute',
      'A',
    ).policyAction;
    expect(policy).toBe(AttributePolicyAction.DROP);
  });

  describe('isCustomElement', () => {
    it('returns true for custom element', () => {
      expect(isCustomElement('my-element')).toBeTrue();
    });

    it('returns false for standard element', () => {
      expect(isCustomElement('h1')).toBeFalse();
    });

    it('returns false for reserved non-custom element', () => {
      expect(isCustomElement('font-face')).toBeFalse();
    });
  });
});
