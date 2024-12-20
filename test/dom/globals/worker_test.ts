/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {TrustedResourceUrl} from '../../../src/internals/resource_url_impl';
import {testonlyResourceUrl} from '../../testing/conversions';

import {
  createSharedWorker,
  createWorker,
  workerGlobalScopeImportScripts,
  WorkerGlobalScopeWithImportScripts,
} from '../../../src/dom/globals/worker';

interface State {
  importedScripts: TrustedResourceUrl[];
  scope: WorkerGlobalScopeWithImportScripts;
}

function cleanState(): State {
  const importedScripts: TrustedResourceUrl[] = [];
  return {
    importedScripts,
    scope: {
      importScripts: (...urls: TrustedResourceUrl[]) => {
        importedScripts.push(...urls);
      },
    } as unknown as WorkerGlobalScopeWithImportScripts,
  };
}

describe('worker API wrappers', () => {
  const workerObj = {marker: Symbol('Worker')} as unknown as Worker;
  const sharedWorkerObj = {
    marker: Symbol('SharedWorker'),
  } as unknown as SharedWorker;
  let state: State;

  beforeEach(() => {
    state = cleanState();
    spyOn(globalThis, 'Worker').and.returnValue(workerObj);
    spyOn(globalThis, 'SharedWorker').and.returnValue(sharedWorkerObj);
  });

  describe('createWorker', () => {
    it('can create a simple worker', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(createWorker(url)).toBe(workerObj);
    });

    it('can create a worker with options', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(createWorker(url, {type: 'module'})).toBe(workerObj);
    });
  });
  describe('createSharedWorker', () => {
    it('can create a shared worker', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(createSharedWorker(url)).toBe(sharedWorkerObj);
    });
  });
  describe('workerGlobalScopeImportScripts', () => {
    it('can call importScripts', () => {
      const url = testonlyResourceUrl('/some-url.js');
      const secondUrl = testonlyResourceUrl('/other-url.js');
      workerGlobalScopeImportScripts(state.scope, url, secondUrl);
      expect(
        state.importedScripts.map((url: TrustedResourceUrl) => url.toString()),
      ).toEqual(['/some-url.js', '/other-url.js']);
    });
  });
});
