/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// The any type matches the Trusted Types Web API
// tslint:disable-next-line:no-any
export type CreateFn = (value: string, ...args: any[]) => string;

/** All supported Trusted Types */
export type TrustedType = TrustedHTML|TrustedScript|TrustedScriptURL;

/** Factory for Trusted Types */
export type Factory<T extends TrustedType, Fn extends CreateFn> =
    (...args: Parameters<Fn>) => T;

/** Returns its input. Only use with trusted data. */
export const IDENTITY = (input: string): string => input;

const factoryWrap = <T extends TrustedType, Fn extends CreateFn>(
    createType: (...args: Parameters<Fn>) => T): Factory<T, Fn> => {
  const factory: Factory<T, Fn> = (...args) => {
    args[0] = '' + args[0];
    return createType(...args);
  };
  // factory.wrapFunction = wrapInFactory.bind(null, factory) as
  // Factory<T,CreateFn>['wrapFunction'];
  return factory;
};

const fakeFactory = <T extends TrustedType, Fn extends CreateFn>(
    unused: string, sanitizer: Fn) => {
  const makeTrustedType = (arg: string, ...args: unknown[]) => {
    const value = '' + sanitizer(arg, ...args);
    return ({
      toString: () => value,
    } as T);
  };
  return factoryWrap<T, Fn>(makeTrustedType);
};

const trustedTypes = window.trustedTypes;
const createPolicy: TrustedTypePolicyFactory['createPolicy']|undefined =
    trustedTypes?.createPolicy?.bind(trustedTypes);

const realCreateFactory =
    <T extends TrustedType>(createFnName: keyof TrustedTypePolicyOptions) => {
      const getTypeFactory = ((name: string, sanitizer: CreateFn) => {
        const policy = createPolicy!(name, {[createFnName]: sanitizer});
        // Trusted Type policy objects are not string-key indexable upstream.
        // tslint:disable-next-line:no-any
        return (policy as any)[createFnName].bind(policy);
      });

      return <Fn extends CreateFn>(policyName: string, sanitizer: Fn) => {
        return factoryWrap<T, Fn>(getTypeFactory(policyName, sanitizer));
      };
    };

const createFactory = (createPolicy ? realCreateFactory : () => fakeFactory);


/**
 * Factory for TrustedHTML objects.
 * @param Trusted Types policy name to use to create a factory function.
 * @param Sanitizer function
 */
export const trustedHTMLFactory = createFactory<TrustedHTML>('createHTML');

/**
 * Factory for TrustedScript objects.
 * @param Trusted Types policy name to use to create a factory function.
 * @param Sanitizer function
 */
export const trustedScriptFactory =
    createFactory<TrustedScript>('createScript');

/**
 * Factory for TrustedScriptURL objects.
 * @param Trusted Types policy name to use to create a factory function.
 * @param Sanitizer function
 */
export const trustedScriptURLFactory =
    createFactory<TrustedScriptURL>('createScriptURL');
