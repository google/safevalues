/**
 * @license
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
      tsconfig: './tsconfig.esm.json',
      compilerOptions: {
        module: 'commonjs',
      },
    },
    files: [
      {pattern: 'src/**/*.ts'},
      {pattern: 'test/**/*.ts'},
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
    client: {
      jasmine: {
        failSpecWithNoExpectations: true,
      },
    },
  })
}
