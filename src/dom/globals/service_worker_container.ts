/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TrustedResourceUrl,
  unwrapResourceUrl,
} from '../../internals/resource_url_impl.js';

/** Safely registers a service worker by URL */
export function serviceWorkerContainerRegister(
  container: ServiceWorkerContainer,
  scriptURL: TrustedResourceUrl,
  options?: RegistrationOptions,
): Promise<ServiceWorkerRegistration> {
  return container.register(unwrapResourceUrl(scriptURL) as string, options);
}
