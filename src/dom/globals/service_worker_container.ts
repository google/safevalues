/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

import {TrustedResourceUrl, unwrapResourceUrl} from '../../internals/resource_url_impl';

/** Safely registers a service worker by URL */
export function register(
    container: ServiceWorkerContainer, scriptURL: TrustedResourceUrl,
    options?: RegistrationOptions): Promise<ServiceWorkerRegistration> {
  return container.register(unwrapResourceUrl(scriptURL) as string, options);
}
