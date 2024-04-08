/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// g3-format-clang

/**
 * Helper to detect if something should trigger an XSS or not,
 * this allows us to test that our code is not triggering XSS.
 */
export class XSSDetector {
  // Random id to make sure this detector is unique.
  private readonly RANDOM_ID = Math.random().toString(16).slice(2);

  // Conveniently casted version of window.
  private readonly global =
      window as unknown as {[x: string]: Function | undefined};

  // A promise to wait for things to load.
  private readonly promise: Promise<boolean>;

  // Whether this detector was triggered.
  private triggered = false;

  // Whether the payload was accessed, as a fail safe to make sure the test
  // doesn't accidentally forget to inject the payload.
  private payloadAccessed = false;

  constructor() {
    this.promise = new Promise<boolean>((resolve) => {
      // Wait some time, and assume the XSS will not trigger if it timesout.
      const timeoutId = setTimeout(() => {
        this.cleanup();
        resolve(false);
      }, 200);

      // NOTE: The 200ms wait time is a bit arbitrary, but seems to be large
      // enough for all the XSS in the tests to trigger. Increase it if you're
      // adding new vectors that don't reliably trigger.

      // If it does trigger, clear the timeout
      this.global[`XSS_${this.RANDOM_ID}`] = () => {
        this.cleanup();
        clearTimeout(timeoutId);
        this.triggered = true;
        resolve(true);
      };
    });
  }

  private cleanup() {
    delete this.global[`XSS_${this.RANDOM_ID}`];
  }

  /** The payload to use in the XSS vector. */
  get payload(): string {
    this.payloadAccessed = true;
    return `XSS_${this.RANDOM_ID}()`;
  }

  private ensurePayloadAccessed() {
    if (!this.payloadAccessed) {
      throw new Error('Payload was never accessed');
    }
  }

  wasTriggered(): boolean {
    this.ensurePayloadAccessed();
    return this.triggered;
  }

  async waitForTrigger(): Promise<boolean> {
    this.ensurePayloadAccessed();
    return this.promise;
  }
}