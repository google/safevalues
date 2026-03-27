/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* GENERATED CODE, DO NOT MODIFY */

/** Expected behavior of setAttribute. */
export enum SetAttributeAction {
  ALLOW,
  REJECT,
  REQUIRE_HTML,
  REQUIRE_RESOURCE_URL,
  SANITIZE_JAVASCRIPT_URL,
}

/** Represents a test case for an attribute contract on a specific element. */
export interface ElementAttributeContractVector {
  readonly elementName: string;
  readonly attributeName: string;
  readonly action: SetAttributeAction;
}

/** Represents a test case for an attribute contract that should apply to all elements. */
export interface GlobalAttributeContractVector {
  readonly attributeName: string;
  readonly action: SetAttributeAction;
}

/** Test vectors for element-specific attribute contracts. */
export const ELEMENT_ATTRIBUTE_CONTRACTS: ElementAttributeContractVector[] = [
  {
    elementName: 'A',
    attributeName: 'href',
    action: SetAttributeAction.SANITIZE_JAVASCRIPT_URL,
  },
  {
    elementName: 'AREA',
    attributeName: 'href',
    action: SetAttributeAction.SANITIZE_JAVASCRIPT_URL,
  },
  {
    elementName: 'LINK',
    attributeName: 'href',
    action: SetAttributeAction.REJECT,
  },
  {
    elementName: 'SOURCE',
    attributeName: 'src',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'SOURCE',
    attributeName: 'srcset',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'IMG',
    attributeName: 'src',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'IMG',
    attributeName: 'srcset',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'VIDEO',
    attributeName: 'src',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'AUDIO',
    attributeName: 'src',
    action: SetAttributeAction.ALLOW,
  },
  {
    elementName: 'USE',
    attributeName: 'href',
    action: SetAttributeAction.SANITIZE_JAVASCRIPT_URL,
  },
];

/** Test vectors for global attribute contracts. */
export const GLOBAL_ATTRIBUTE_CONTRACTS: GlobalAttributeContractVector[] = [
  {
    attributeName: 'title',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-atomic',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-autocomplete',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-busy',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-checked',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-current',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-disabled',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-dropeffect',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-expanded',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-haspopup',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-hidden',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-invalid',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-label',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-level',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-live',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-multiline',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-multiselectable',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-orientation',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-posinset',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-pressed',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-readonly',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-relevant',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-required',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-selected',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-setsize',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-sort',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-valuemax',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-valuemin',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-valuenow',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'aria-valuetext',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'alt',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'align',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'autocapitalize',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'autocomplete',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'autocorrect',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'autofocus',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'autoplay',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'bgcolor',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'border',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'cellpadding',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'cellspacing',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'checked',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'cite',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'color',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'cols',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'colspan',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'controls',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'controlslist',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'coords',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'crossorigin',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'datetime',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'disabled',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'download',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'draggable',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'enctype',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'face',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'formenctype',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'frameborder',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'height',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'hreflang',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'hidden',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'inert',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'ismap',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'label',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'lang',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'loop',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'max',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'maxlength',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'media',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'minlength',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'min',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'multiple',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'muted',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'nonce',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'open',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'playsinline',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'placeholder',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'poster',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'preload',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'rel',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'required',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'reversed',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'role',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'rows',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'rowspan',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'selected',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'shape',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'size',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'sizes',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'slot',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'span',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'spellcheck',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'start',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'step',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'summary',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'translate',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'type',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'usemap',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'valign',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'value',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'width',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'wrap',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'itemscope',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'itemtype',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'itemid',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'itemprop',
    action: SetAttributeAction.ALLOW,
  },
  {
    attributeName: 'itemref',
    action: SetAttributeAction.ALLOW,
  },
];
