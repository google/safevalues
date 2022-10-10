/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as safeWorker from '../../../src/dom/globals/worker';
import {TrustedResourceUrl} from '../../../src/internals/resource_url_impl';
import {testonlyResourceUrl} from '../../conversions';

interface State {
  importedScripts: TrustedResourceUrl[];
  scope: safeWorker.ScopeWithImportScripts;
}

function cleanState(): State {
  const importedScripts: TrustedResourceUrl[] = [];
  return {
    importedScripts,
    scope: {
      importScripts: (...urls: TrustedResourceUrl[]) => {
        importedScripts.push(...urls);
      },
    } as unknown as safeWorker.ScopeWithImportScripts,
  };
}

describe('safeWorker', () => {
  const workerObj = {marker: Symbol('Worker')} as unknown as Worker;
  const sharedWorkerObj = {marker: Symbol('SharedWorker')} as unknown as
      SharedWorker;
  let state: State;

  beforeEach(() => {
    state = cleanState();
    spyOn(globalThis, 'Worker').and.returnValue(workerObj);
    spyOn(globalThis, 'SharedWorker').and.returnValue(sharedWorkerObj);
  });

  describe('with TS safe types', () => {
    it('can create a simple worker', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(safeWorker.create(url)).toBe(workerObj);
    });

    it('can create a worker with options', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(safeWorker.create(url, {type: 'module'})).toBe(workerObj);
    });

    it('can create a shared worker', () => {
      const url = testonlyResourceUrl('/some-url.js');
      expect(safeWorker.createShared(url)).toBe(sharedWorkerObj);
    });

    it('can call importScripts', () => {
      const url = testonlyResourceUrl('/some-url.js');
      const secondUrl = testonlyResourceUrl('/other-url.js');
      safeWorker.importScripts(state.scope, url, secondUrl);
      expect(state.importedScripts.map(
                 (url: TrustedResourceUrl) => url.toString()))
          .toEqual(['/some-url.js', '/other-url.js']);
    });
  });
});
