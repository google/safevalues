/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {safeAttrPrefix} from '../../src/builders/attribute_builders';

describe('SafeAttributePrefix builders', () => {
  it('converts to lower cases', () => {
    const prefix = safeAttrPrefix`ARIa-`;
    expect(prefix.toString()).toEqual('aria-');
  });

  it('throws given values in blocklist', () => {
    const buildPrefix = () => safeAttrPrefix`Sr`;
    const err = `Prefix 'Sr' does not guarantee the attribute ` +
        `to be safe as it is also a prefix for ` +
        `the security sensitive attribute 'src'. ` +
        `Please use native or safe DOM APIs to set the attribute.`;

    expect(buildPrefix).toThrowError(err);
  });

  it('disallows event handler attributes', () => {
    const buildPrefix = () => safeAttrPrefix`OnCli`;
    const err = `Prefix 'OnCli' does not guarantee the attribute ` +
        `to be safe as it is also a prefix for event handler attributes` +
        `Please use 'addEventListener' to set event handlers.`;

    expect(buildPrefix).toThrowError(err);
  });
});
