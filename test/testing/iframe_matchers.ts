/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  isIE,
  isSafari,
} from 'google3/third_party/javascript/closure/labs/useragent/browser';
import {isMobile} from 'google3/third_party/javascript/closure/labs/useragent/device';
import {isSafariDesktopOnMobile} from 'google3/third_party/javascript/closure/labs/useragent/extra';

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeCrossOrigin(): void;
    }
  }
}

/** Custom matchers for checking the security state of iframes. */
export const customIframeMatchers: jasmine.CustomMatcherFactories = {
  toBeCrossOrigin(util: jasmine.MatchersUtil) {
    const isCrossOriginIframe = (iframe: HTMLIFrameElement) => {
      if (isSafariDesktopOnMobile() || (isSafari() && isMobile())) {
        // Our infra seems to disable same origin policy on the mobile safari
        // tests, so we check that the origin is 'null' instead.
        return iframe.contentWindow!.origin === 'null';
      } else {
        try {
          (iframe.contentWindow as typeof globalThis | null)?.parseInt('');
          return false;
        } catch (e: unknown) {
          // IE throws a very generic 'Permission denied' error
          const marker = isIE() ? 'Permission denied' : 'cross-origin';
          return e instanceof Error && e.message.includes(marker);
        }
      }
    };

    return {
      compare(iframe: HTMLIFrameElement) {
        const pass = isCrossOriginIframe(iframe);
        return {
          pass,
          message: `Expected iframe to${
            pass ? ' not ' : ' '
          }be cross-origin: \n\n${util.pp(iframe)}`,
        };
      },
    };
  },
};
