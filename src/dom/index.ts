/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file re-exports all of the wrappers to ensure that we have
 * a clearly defined interface.
 */

// Old names. These are deprecated. Use the function directly defined on safevalues.dom instead.
export * as safeAnchorEl from './elements/anchor.js';
export * as safeAreaEl from './elements/area.js';
export * as safeBaseEl from './elements/base.js';
export * as safeButtonEl from './elements/button.js';
export * as safeElement from './elements/element.js';
export * as safeEmbedEl from './elements/embed.js';
export * as safeFormEl from './elements/form.js';
export * as safeIframeEl from './elements/iframe.js';
export * as safeInputEl from './elements/input.js';
export * as safeLinkEl from './elements/link.js';
export * as safeObjectEl from './elements/object.js';
export * as safeScriptEl from './elements/script.js';
export * as safeStyleEl from './elements/style.js';
export * as safeSvgEl from './elements/svg.js';
export * as safeSvgUseEl from './elements/svg_use.js';
export * as safeDocument from './globals/document.js';
export * as safeDomParser from './globals/dom_parser.js';
export * as safeGlobal from './globals/global.js';
export * as safeLocation from './globals/location.js';
export * as safeRange from './globals/range.js';
export * as safeServiceWorkerContainer from './globals/service_worker_container.js';
export * as safeUrl from './globals/url.js';
export * as safeWindow from './globals/window.js';
export * as safeWorker from './globals/worker.js';

// Re-export functions with new names that don't conflict with browser APIs.
export {
  setHref as setAnchorHref,
  setHrefLite as setAnchorHrefLite,
} from './elements/anchor.js';
export {setHref as setAreaHref} from './elements/area.js';
export {setHref as setBaseHref} from './elements/base.js';
export {setFormaction as setButtonFormaction} from './elements/button.js';
export {
  buildPrefixedAttributeSetter,
  insertAdjacentHtml as elementInsertAdjacentHtml,
  setInnerHtml as setElementInnerHtml,
  setOuterHtml as setElementOuterHtml,
  setPrefixedAttribute as setElementPrefixedAttribute,
} from './elements/element.js';
export {setSrc as setEmbedSrc} from './elements/embed.js';
export {setAction as setFormAction} from './elements/form.js';
export {
  setSrc as setIframeSrc,
  setSrcdoc as setIframeSrcdoc,
  setSrcdocWithIntent as setIframeSrcdocWithIntent,
} from './elements/iframe.js';
export {setFormaction as setInputFormaction} from './elements/input.js';
export {
  setHrefAndRel as setLinkHrefAndRel,
  setHrefAndRelWithTrustedResourceUrl as setLinkWithResourceUrlHrefAndRel,
} from './elements/link.js';
export {setData as setObjectData} from './elements/object.js';
export {
  setSrc as setScriptSrc,
  setTextContent as setScriptTextContent,
} from './elements/script.js';
export {setTextContent as setStyleTextContent} from './elements/style.js';
export {setAttribute as setSvgAttribute} from './elements/svg.js';
export {setHref as setSvgUseHref} from './elements/svg_use.js';
export {
  execCommand as documentExecCommand,
  execCommandInsertHtml as documentExecCommandInsertHtml,
  write as documentWrite,
} from './globals/document.js';
export {
  parseFromString as domParserParseFromString,
  parseHtml as domParserParseHtml,
  parseXml as domParserParseXml,
} from './globals/dom_parser.js';
export {
  fetchResourceUrl,
  globalEval,
  type SafeResponse,
} from './globals/global.js';
export {
  assign as locationAssign,
  replace as locationReplace,
  setHref as setLocationHref,
} from './globals/location.js';
export {createContextualFragment as rangeCreateContextualFragment} from './globals/range.js';
export {register as serviceWorkerContainerRegister} from './globals/service_worker_container.js';
export {objectUrlFromSafeSource as objectUrlFromSafeSource} from './globals/url.js';
export {
  getScriptNonce,
  getStyleNonce,
  open as windowOpen,
} from './globals/window.js';
export {
  createShared as createSharedWorker,
  create as createWorker,
  importScripts as workerGlobalScopeImportScripts,
} from './globals/worker.js';
