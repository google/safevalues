/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {htmlEscape} from '../../../src/builders/html_builders';
import {SafeHtml} from '../../../src/internals/html_impl';

import {documentExecCommand} from '../../../src/dom/globals/document';

describe('Document API wrappers', () => {
  describe('documentExecCommand', () => {
    it('accepts any argument for safe commands', () => {
      expect(() =>
        documentExecCommand(document, 'insertText', 'text'),
      ).not.toThrow();
      expect(() =>
        documentExecCommand(document, 'insertText', htmlEscape('text')),
      ).not.toThrow();
    });
    it('rejects string argument for insertHtml', () => {
      expect(() =>
        documentExecCommand(
          document,
          'insertHtml',
          'text' as unknown as SafeHtml,
        ),
      ).toThrow();
    });
    it('rejects string argument for variants of insertHtml', () => {
      expect(() =>
        documentExecCommand(
          document,
          'InSerThtMl',
          'text' as unknown as SafeHtml,
        ),
      ).toThrow();
    });
    it('accepts SafeHtml argument for insertHtml', () => {
      const cmd = 'insertHtml';
      expect(() =>
        documentExecCommand(document, cmd, htmlEscape('text')),
      ).not.toThrow();
    });
  });
});
