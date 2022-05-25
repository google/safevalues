#!/bin/bash

# Remove any stale version of safevalues from the cache
yarn cache clean --all

# Packs safevalues using a local build
yarn pack --filename safevalues.local.tgz

# Use the local version of safevalues to run integration tests
(cd integration_test/ && yarn add ../safevalues.local.tgz && yarn test)
