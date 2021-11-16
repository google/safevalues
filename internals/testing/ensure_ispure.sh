#! /usr/bin/env bash

# Copyright 2021 Google LLC.
# SPDX-License-Identifier: Apache-2.0

# Tests that argument files calls to pure() are prefixed with /* #__PURE__ */
# see ensure_ispure.bzl for more information.
#
  # This check is very naïve. If the directive is present on the same line,
# it is assumed to be well-formed.

set -e

if RESULTS="$(grep -H 'pure(' $@ | grep -v '/\* #__PURE__ \*/')"; then
  echo "Some calls to pure() are not marked in an uglifier compatible way."
  echo "All calls to pure() should be prefixed with /* #__PURE__ */"
  echo "In files":
  echo "$RESULTS"
  exit 1
fi
