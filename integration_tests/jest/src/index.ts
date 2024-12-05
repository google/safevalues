/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeHtml} from 'safevalues';
import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

export function foo(): SafeHtml {
  return htmlSafeByReview('', {justification: 'Jest demo'});
}
