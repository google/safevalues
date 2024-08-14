/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev.js';
import {
  createAttributePrefixInternal,
  SafeAttributePrefix,
} from '../internals/attribute_impl.js';
import {assertIsTemplateObject} from '../internals/string_literal.js';

import {SECURITY_SENSITIVE_ATTRIBUTES} from './sensitive_attributes.js';

/**
 * Creates a SafeAttributePrefix object from a template literal with no
 * interpolations for attributes that share a common prefix guaranteed to be not
 * security sensitive.
 *
 * The template literal is a prefix that makes it obvious this attribute is not
 * security sensitive. If it doesn't, this function will throw.
 */
export function safeAttrPrefix(
  templ: TemplateStringsArray,
): SafeAttributePrefix {
  if (process.env.NODE_ENV !== 'production') {
    assertIsTemplateObject(templ, 0);
  }

  const attrPrefix = templ[0].toLowerCase();

  if (process.env.NODE_ENV !== 'production') {
    if (attrPrefix.indexOf('on') === 0 || 'on'.indexOf(attrPrefix) === 0) {
      throw new Error(
        `Prefix '${templ[0]}' does not guarantee the attribute ` +
          `to be safe as it is also a prefix for event handler attributes` +
          `Please use 'addEventListener' to set event handlers.`,
      );
    }

    SECURITY_SENSITIVE_ATTRIBUTES.forEach((sensitiveAttr) => {
      if (sensitiveAttr.indexOf(attrPrefix) === 0) {
        throw new Error(
          `Prefix '${templ[0]}' does not guarantee the attribute ` +
            `to be safe as it is also a prefix for ` +
            `the security sensitive attribute '${sensitiveAttr}'. ` +
            `Please use native or safe DOM APIs to set the attribute.`,
        );
      }
    });
  }

  return createAttributePrefixInternal(attrPrefix);
}
