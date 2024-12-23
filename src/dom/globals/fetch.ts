/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 * Functions which allow fetch() on resourceUrls to be
 * interpreted as SafeHtml or SafeScript.
 */

import {createHtmlInternal, SafeHtml} from '../../internals/html_impl.js';
import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';
import {createScriptInternal, SafeScript} from '../../internals/script_impl.js';
import {
  createStyleSheetInternal,
  SafeStyleSheet,
} from '../../internals/style_sheet_impl.js';

/**
 * IncorrectTypeError represents an error that can occur with {@link
 * fetchResourceUrl} when the server responds with a content type that would be
 * unsafe for the type of content requested.
 */
export class IncorrectContentTypeError extends Error {
  constructor(
    readonly url: string,
    readonly typeName: string,
    readonly contentType: string,
  ) {
    super(
      `${url} was requested as a ${typeName}, but the response Content-Type, "${contentType} is not appropriate for this type of content.`,
    );
  }
}

/**
 * A SafeResponse is the response value of a {@link fetchResourceUrl} call.
 */
export interface SafeResponse {
  /**
   * html returns this {@link Response} as a SafeHtml, or throws an error.
   */
  html(): Promise<SafeHtml>;

  /**
   * script returns the fetch response as a {@link SafeScript}, or returns an
   * error.
   */
  script(): Promise<SafeScript>;

  /**
   * styleSheet returns the fetch response as a {@link SafeStyleSheet}, or
   * returns an error.
   */
  styleSheet(): Promise<SafeStyleSheet>;
}

/**
 * This causes the compiler to better optimize `createHtmlInternal` calls, where
 * previously it was building and including the whole module without
 * tree-shaking.
 *
 */
function privatecreateHtmlInternal(html: string): SafeHtml {
  return createHtmlInternal(html);
}

/**
 * fetches a given {@link TrustedResourceUrl},
 * and returns a value which can be turned into a given safe type.
 */
export async function fetchResourceUrl(
  u: TrustedResourceUrl,
  init?: RequestInit,
): Promise<SafeResponse> {
  const response = await fetch(unwrapResourceUrl(u).toString(), init);
  /**
   * the content type type of the response, excluding any MIME params
   */
  const mimeType = response.headers
    .get('Content-Type')
    ?.split(';', 2)?.[0]
    ?.toLowerCase();

  return {
    async html(): Promise<SafeHtml> {
      if (mimeType !== 'text/html') {
        throw new IncorrectContentTypeError(
          response.url,
          'SafeHtml',
          'text/html',
        );
      }

      const text = await response.text();
      return privatecreateHtmlInternal(text);
    },

    async script(): Promise<SafeScript> {
      // see:
      // https://html.spec.whatwg.org/multipage/scripting.html#scriptingLanguages
      if (
        mimeType !== 'text/javascript' &&
        mimeType !== 'application/javascript'
      ) {
        throw new IncorrectContentTypeError(
          response.url,
          'SafeScript',
          'text/javascript',
        );
      }

      const text = await response.text();
      return createScriptInternal(text);
    },

    async styleSheet(): Promise<SafeStyleSheet> {
      if (mimeType !== 'text/css') {
        throw new IncorrectContentTypeError(
          response.url,
          'SafeStyleSheet',
          'text/css',
        );
      }

      const text = await response.text();
      return createStyleSheetInternal(text);
    },
  };
}
