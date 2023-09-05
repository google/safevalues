#!/bin/bash
# Adds package.json files to cjs/mjs subtrees

echo '{
    "type": "commonjs"
}' > dist/cjs/package.json

echo '{
    "type": "module"
}' > dist/mjs/package.json

find src -name '*.d.ts' -exec cp {} dist/mjs \;
find src -name '*.d.ts' -exec cp {} dist/cjs \;

rm -rf dist/mjs/test
mv dist/mjs/src/* dist/mjs
rmdir dist/mjs/src

rm -rf dist/cjs/test
mv dist/cjs/src/* dist/cjs
rmdir dist/cjs/src
