/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = (config) => {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-typescript',
      'karma-spec-reporter',
    ],
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'commonjs',
      },
        bundlerOptions: {
            transforms: [
                require("karma-typescript-es6-transform")()
            ]
        }
    },
    files: [
      {pattern: 'main.ts'},
    ],
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },
    reporters: ['spec', 'karma-typescript'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'],
    singleRun: false,
  })
}
