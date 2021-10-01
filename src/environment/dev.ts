/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ensure process.env.NODE_ENV is set even when not running under Webpack or
 * Node. Terser will strip this out of production binaries.
 */
/*#__PURE__*/ (() => {
  if (typeof process === 'undefined') {
    (window.process as unknown) = {env: {NODE_ENV: 'development'}};
  }
})();
