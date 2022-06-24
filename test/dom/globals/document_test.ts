/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlEscape} from '../../../src/builders/html_builders';
import * as safeDocument from '../../../src/dom/globals/document';
import {SafeHtml} from '../../../src/internals/html_impl';

describe('safeDocument', () => {
  describe('execCommand', () => {
    it('accepts any argument for safe commands', () => {
      expect(() => safeDocument.execCommand(document, 'insertText', 'text'))
          .not.toThrow();
      expect(
          () => safeDocument.execCommand(
              document, 'insertText', htmlEscape('text')))
          .not.toThrow();
    });
    it('rejects string argument for insertHtml', () => {
      expect(
          () => safeDocument.execCommand(
              document, 'insertHtml', 'text' as unknown as SafeHtml))
          .toThrow();
    });
    it('rejects string argument for variants of insertHtml', () => {
      expect(
          () => safeDocument.execCommand(
              document, 'InSerThtMl', 'text' as unknown as SafeHtml))
          .toThrow();
    });
    it('accepts SafeHtml argument for insertHtml', () => {
      const cmd: string = 'insertHtml';
      expect(() => safeDocument.execCommand(document, cmd, htmlEscape('text')))
          .not.toThrow();
    });
  });
});
