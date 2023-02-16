/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* GENERATED CODE, DO NOT MODIFY */

/* g3_import_pure from '../../../internals/pure' */

import {AttributePolicy, AttributePolicyAction, ElementPolicy, SanitizerTable} from './sanitizer_table';

const ALLOWED_ELEMENTS: readonly string[] = [
  'ARTICLE',  'SECTION',    'NAV',    'ASIDE',    'H1',         'H2',
  'H3',       'H4',         'H5',     'H6',       'HEADER',     'FOOTER',
  'ADDRESS',  'P',          'HR',     'PRE',      'BLOCKQUOTE', 'OL',
  'UL',       'LH',         'LI',     'DL',       'DT',         'DD',
  'FIGURE',   'FIGCAPTION', 'MAIN',   'DIV',      'EM',         'STRONG',
  'SMALL',    'S',          'CITE',   'Q',        'DFN',        'ABBR',
  'RUBY',     'RB',         'RT',     'RTC',      'RP',         'DATA',
  'TIME',     'CODE',       'VAR',    'SAMP',     'KBD',        'SUB',
  'SUP',      'I',          'B',      'U',        'MARK',       'BDI',
  'BDO',      'SPAN',       'BR',     'WBR',      'INS',        'DEL',
  'PICTURE',  'PARAM',      'TRACK',  'MAP',      'TABLE',      'CAPTION',
  'COLGROUP', 'COL',        'TBODY',  'THEAD',    'TFOOT',      'TR',
  'TD',       'TH',         'SELECT', 'DATALIST', 'OPTGROUP',   'OPTION',
  'OUTPUT',   'PROGRESS',   'METER',  'FIELDSET', 'LEGEND',     'DETAILS',
  'SUMMARY',  'MENU',       'DIALOG', 'SLOT',     'CANVAS',     'FONT',
  'CENTER',
];

const ELEMENT_POLICIES: ReadonlyArray<[string, ElementPolicy]> = [
  [
    'A', new Map<string, AttributePolicy>([
      ['href', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],
  [
    'AREA', new Map<string, AttributePolicy>([
      ['href', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],
  [
    'LINK', new Map<string, AttributePolicy>([
      [
        'href', {
          policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL,
          conditions: new Map<string, Set<string>>([[
            'rel', new Set<string>([
              'alternate',
              'author',
              'bookmark',
              'canonical',
              'cite',
              'help',
              'icon',
              'license',
              'next',
              'prefetch',
              'dns-prefetch',
              'prerender',
              'preconnect',
              'preload',
              'prev',
              'search',
              'subresource',
            ])
          ]])
        }
      ],
    ])
  ],
  [
    'SOURCE', new Map<string, AttributePolicy>([
      ['src', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],
  [
    'IMG', new Map<string, AttributePolicy>([
      ['src', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],
  [
    'VIDEO', new Map<string, AttributePolicy>([
      ['src', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],
  [
    'AUDIO', new Map<string, AttributePolicy>([
      ['src', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
    ])
  ],

];

const ALLOWED_GLOBAL_ATTRIBUTES: readonly string[] = [
  'title',
  'aria-atomic',
  'aria-autocomplete',
  'aria-busy',
  'aria-checked',
  'aria-current',
  'aria-disabled',
  'aria-dropeffect',
  'aria-expanded',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-label',
  'aria-level',
  'aria-live',
  'aria-multiline',
  'aria-multiselectable',
  'aria-orientation',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-relevant',
  'aria-required',
  'aria-selected',
  'aria-setsize',
  'aria-sort',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
  'aria-valuetext',
  'alt',
  'align',
  'autocapitalize',
  'autocomplete',
  'autocorrect',
  'autofocus',
  'autoplay',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'checked',
  'color',
  'cols',
  'colspan',
  'controls',
  'datetime',
  'disabled',
  'download',
  'draggable',
  'enctype',
  'face',
  'formenctype',
  'frameborder',
  'height',
  'hreflang',
  'hidden',
  'ismap',
  'label',
  'lang',
  'loop',
  'max',
  'maxlength',
  'media',
  'minlength',
  'min',
  'multiple',
  'muted',
  'nonce',
  'open',
  'placeholder',
  'preload',
  'rel',
  'required',
  'reversed',
  'role',
  'rows',
  'rowspan',
  'selected',
  'shape',
  'size',
  'sizes',
  'slot',
  'span',
  'spellcheck',
  'start',
  'step',
  'summary',
  'translate',
  'type',
  'valign',
  'value',
  'width',
  'wrap',
  'itemscope',
  'itemtype',
  'itemid',
  'itemprop',
  'itemref',
];

const GLOBAL_ATTRIBUTE_POLICIES: ReadonlyArray<[string, AttributePolicy]> = [
  [
    'dir', {
      policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE,
      conditions: /* #__PURE__ */ (() => {
        return new Map<string, Set<string>>([[
          'dir', new Set<string>([
            'auto',
            'ltr',
            'rtl',
          ])
        ]]);
      })()
    }
  ],
  [
    'async', {
      policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE,
      conditions: /* #__PURE__ */ (() => {
        return new Map<string, Set<string>>([[
          'async', new Set<string>([
            'async',
          ])
        ]]);
      })()
    }
  ],
  ['cite', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
  [
    'loading', {
      policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE,
      conditions: /* #__PURE__ */ (() => {
        return new Map<string, Set<string>>([[
          'loading', new Set<string>([
            'eager',
            'lazy',
          ])
        ]]);
      })()
    }
  ],
  ['poster', {policyAction: AttributePolicyAction.KEEP_AND_SANITIZE_URL}],
  [
    'target', {
      policyAction: AttributePolicyAction.KEEP_AND_NORMALIZE,
      conditions: /* #__PURE__ */ (() => {
        return new Map<string, Set<string>>([[
          'target', new Set<string>([
            '_self',
            '_blank',
          ])
        ]]);
      })()
    }
  ],
];

/**
 * Sanitizer table for the default sanitizer configuration
 *
 */
export const defaultSanitizerTable = new SanitizerTable(
    new Set(ALLOWED_ELEMENTS),
    new Map(ELEMENT_POLICIES),
    new Set(ALLOWED_GLOBAL_ATTRIBUTES),
    new Map(GLOBAL_ATTRIBUTE_POLICIES),
);
