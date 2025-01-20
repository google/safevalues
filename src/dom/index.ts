/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file re-exports all of the wrappers to ensure that we have
 * a clearly defined interface.
 */

export {setAnchorHref} from './elements/anchor.js';
export {setAreaHref} from './elements/area.js';
export {setBaseHref} from './elements/base.js';
export {setButtonFormaction} from './elements/button.js';
export {
  buildPrefixedAttributeSetter,
  elementInsertAdjacentHtml,
  setElementAttribute,
  setElementInnerHtml,
  setElementOuterHtml,
  setElementPrefixedAttribute,
} from './elements/element.js';
export {setEmbedSrc} from './elements/embed.js';
export {setFormAction} from './elements/form.js';
export {setIframeSrc, setIframeSrcdoc} from './elements/iframe.js';
export {setInputFormaction} from './elements/input.js';
export {
  setLinkHrefAndRel,
  setLinkWithResourceUrlHrefAndRel,
} from './elements/link.js';
export {setObjectData} from './elements/object.js';
export {setScriptSrc, setScriptTextContent} from './elements/script.js';
export {setStyleTextContent} from './elements/style.js';
export {setSvgAttribute} from './elements/svg.js';
export {setSvgUseHref} from './elements/svg_use.js';
export {documentExecCommand, documentWrite} from './globals/document.js';
export {
  domParserParseFromString,
  domParserParseHtml,
  domParserParseXml,
} from './globals/dom_parser.js';
export {fetchResourceUrl, globalEval} from './globals/global.js';
export {
  locationAssign,
  locationReplace,
  setLocationHref,
} from './globals/location.js';
export {rangeCreateContextualFragment} from './globals/range.js';
export {serviceWorkerContainerRegister} from './globals/service_worker_container.js';
export {objectUrlFromSafeSource} from './globals/url.js';
export {getScriptNonce, getStyleNonce, windowOpen} from './globals/window.js';
export {
  createSharedWorker,
  createWorker,
  workerGlobalScopeImportScripts,
  type WorkerGlobalScopeWithImportScripts,
} from './globals/worker.js';
