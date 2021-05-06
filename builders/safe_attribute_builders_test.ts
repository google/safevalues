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

import {SECURITY_SENSITIVE_ATTRIBUTES as SECURITY_SENSITIVE_ATTRIBUTES_GOLDEN} from './safe_attribute_blocklist_golden';
import {safeAttrPrefix, SECURITY_SENSITIVE_ATTRIBUTES} from './safe_attribute_builders';

describe('sensitive attribute name blocklist', () => {
  it('is updated', () => {
    expect(SECURITY_SENSITIVE_ATTRIBUTES)
        .toEqual(SECURITY_SENSITIVE_ATTRIBUTES_GOLDEN);
  });
});

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
});
