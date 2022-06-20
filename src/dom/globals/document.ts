/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl';

/**
 * write safely calls {@link Document.write} on the given {@link Document} with
 * the given {@link SafeHtml}.
 */
export function write(doc: Document, text: SafeHtml) {
  doc.write(unwrapHtml(text) as string);
}

type ValueType<Cmd extends string> =
    Lowercase<Cmd> extends 'inserthtml' ? SafeHtml : SafeHtml|string;

/**
 * Safely calls {@link Document.execCommand}. When command is insertHtml, a
 * SafeHtml must be passed in as value.
 */
export function execCommand<Cmd extends string>(
    doc: Document, command: Cmd, value?: ValueType<Cmd>): boolean {
  const commandString = String(command);
  let valueArgument = value as string;
  if (commandString.toLowerCase() === 'inserthtml') {
    valueArgument = unwrapHtml(value as SafeHtml) as string;
  }
  return doc.execCommand(commandString, /* showUi= */ false, valueArgument);
}

/**
 * Safely calls {@link Document.execCommand}('insertHtml').
 * @deprecated Use safeDocument.execCommand.
 */
export function execCommandInsertHtml(doc: Document, html: SafeHtml): boolean {
  return doc.execCommand(
      'insertHTML', /* showUi= */ false, unwrapHtml(html) as string);
}
