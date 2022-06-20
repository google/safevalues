/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';

// We can't depend on WorkerGlobalScope directly, as lib.webworker.d.ts alters
// the global scope typing.

/**
 * ScopeWithImportScripts is an {@link WindowOrWorkerGlobalScope} that also
 * has {@link WorkerGlobalScope.importScripts} as {@link WorkerGlobalScope} in
 * some cases cannot be depended on directly.
 */
export interface ScopeWithImportScripts extends WindowOrWorkerGlobalScope {
  importScripts: (...url: string[]) => void;
}

/**
 * Safely creates a Web Worker.
 *
 * Example usage:
 *   const trustedResourceUrl = trustedResourceUrl`/safe_script.js`;
 *   safedom.safeWorker.create(trustedResourceUrl);
 * which is a safe alternative to
 *   new Worker(url);
 * The latter can result in loading untrusted code.
 */
export function create(url: TrustedResourceUrl, options?: {}): Worker {
  return new Worker(unwrapResourceUrl(url) as string, options);
}

/** Safely creates a shared Web Worker. */
export function createShared(
    url: TrustedResourceUrl, options?: string|WorkerOptions): SharedWorker {
  return new SharedWorker(unwrapResourceUrl(url) as string, options);
}

/** Safely calls importScripts */
export function importScripts(
    scope: ScopeWithImportScripts, ...urls: TrustedResourceUrl[]): void {
  scope.importScripts(...urls.map(url => unwrapResourceUrl(url) as string));
}
