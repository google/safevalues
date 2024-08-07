#!/bin/bash

set -e
# Remove any stale version of safevalues from the cache
yarn cache clean --all

yarn
yarn build
yarn test
# Packs safevalues using a local build
yarn pack --filename safevalues.local.tgz

# Use the local version of safevalues to run integration tests
(cd integration_tests/basic_import/ && yarn add ../../safevalues.local.tgz && yarn test)
(cd integration_tests/import_fully_specified_webpack && yarn add ../../safevalues.local.tgz && yarn build)
(cd integration_tests/jest/ && yarn add ../../safevalues.local.tgz && yarn test)
