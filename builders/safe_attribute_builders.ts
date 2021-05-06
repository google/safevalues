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

import {createSafeAttributePrefix, SafeAttributePrefix} from '../implementation/safe_attribute_impl';
import {assertIsTemplateObject} from '../implementation/safe_string_literal';

/**
 * Security sensitive attribute names that should not be set through
 * `setAttribute` or similar functions.
 */
export const SECURITY_SENSITIVE_ATTRIBUTES = [
  'href',
  'rel',
  'src',
  'srcdoc',
  'action',
  'formaction',
  'sandbox',
  'cite',
  'srccite',
  'poster',
  'icon',
  'style',
] as const;

/**
 * Creates a SafeAttributePrefix object from a template literal with no
 * interpolations for attributes that share a common prefix guaranteed to be not
 * security sensitive.
 *
 * The template literal is a prefix that makes it obvious this attribute is not
 * security sensitive. If it doesn't, this function will throw.
 */
export function safeAttrPrefix(templ: TemplateStringsArray):
    SafeAttributePrefix {
  assertIsTemplateObject(
      templ, true,
      'safeAttr is a template literal tag function ' +
          'and should be called using the tagged template syntax. ' +
          'For example, safeAttr`foo`;');

  const attrPrefix = templ[0].toLowerCase();

  for (const sensitiveAttr of SECURITY_SENSITIVE_ATTRIBUTES) {
    if (sensitiveAttr.startsWith(attrPrefix)) {
      throw new Error(
          `Prefix '${templ[0]}' does not guarantee the attribute ` +
          `to be safe as it is also a prefix for ` +
          `the security sensitive attribute '${sensitiveAttr}'. ` +
          `Please use native or safe DOM APIs to set the attribute.`);
    }
  }

  return createSafeAttributePrefix(attrPrefix);
}
