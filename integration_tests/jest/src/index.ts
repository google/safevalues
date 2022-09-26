import {SafeHtml} from 'safevalues'
import {htmlSafeByReview} from 'safevalues/restricted/reviewed'

export function foo(): SafeHtml {
  return htmlSafeByReview('', 'Jest demo');
}
