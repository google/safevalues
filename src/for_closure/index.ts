/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Re-exports some functions from safevalues that the Closure Safe
 * type that are not migrated yet need. These types can't import these functions
 * directly from safevalues because it would create a cyclic dependency.
 */

export {sanitizeUrl} from '../builders/url_builders';
export {SafeUrl, unwrapUrl} from '../internals/url_impl';

goog.tsMigrationNamedExportsShim('safevalues.for_closure');
goog.tsMigrationExportsShimDeclareLegacyNamespace();
