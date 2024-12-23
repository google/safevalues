/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeHtml, unwrapHtml} from '../../internals/html_impl.js';

/**
 * documentWrite safely calls {@link Document.write} on the given
 * {@link Document} with the given {@link SafeHtml}.
 */
export function documentWrite(doc: Document, text: SafeHtml): void {
  doc.write(unwrapHtml(text) as string);
}

type ValueType<Cmd extends string> =
  Lowercase<Cmd> extends 'inserthtml' ? SafeHtml : SafeHtml | string;

/**
 * Safely calls {@link Document.execCommand}. When command is insertHtml, a
 * SafeHtml must be passed in as value.
 */
export function documentExecCommand<Cmd extends string>(
  doc: Document,
  command: Cmd,
  value?: ValueType<Cmd>,
): boolean {
  const commandString = String(command);
  let valueArgument = value as string;
  if (commandString.toLowerCase() === 'inserthtml') {
    valueArgument = unwrapHtml(value as SafeHtml) as string;
  }
  return doc.execCommand(commandString, /* showUi= */ false, valueArgument);
}
