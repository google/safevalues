/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Typings for Trusted Types APIs.
 * See https://w3c.github.io/trusted-types/dist/spec/ for details.
 * These definitions should be replaced by lib.dom.d.ts once it is available.
 */

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-html */
export declare class TrustedHTML {
  private constructor(); // To prevent instantiting with 'new'.
  private brand: true; // To prevent structural typing.
}

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-script */
export declare class TrustedScript {
  private constructor(); // To prevent instantiting with 'new'.
  private brand: true; // To prevent structural typing.
}

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-script-url */
export declare class TrustedScriptURL {
  private constructor(); // To prevent instantiting with 'new'.
  private brand: true; // To prevent structural typing.
}

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-types-policy */
export declare interface TrustedTypePolicy {
  createHTML(str: string): TrustedHTML;
  createScript(str: string): TrustedScript;
  createScriptURL(str: string): TrustedScriptURL;
}

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-types-policy-options */
export declare interface TrustedTypePolicyOptions {
  createHTML(str: string): string;
  createScript(str: string): string;
  createScriptURL(str: string): string;
}

/** https://w3c.github.io/trusted-types/dist/spec/#trusted-types-policy-factory */
export declare interface TrustedTypePolicyFactory {
  createPolicy(
    name: string,
    policy: TrustedTypePolicyOptions,
  ): TrustedTypePolicy;
  emptyHTML: TrustedHTML;
  emptyScript: TrustedScript;
}

/** https://w3c.github.io/trusted-types/dist/spec/#extensions-to-the-windoworworkerglobalscope-interface */
export declare type GlobalWithTrustedTypes = typeof globalThis & {
  trustedTypes: TrustedTypePolicyFactory | undefined;
};
