#!/bin/bash
# Adds package.json files to cjs/mjs subtrees

echo '{
    "type": "commonjs"
}' > dist/cjs/package.json

echo '{
    "type": "module"
}' > dist/mjs/package.json

rm -rf dist/mjs/test
mv dist/mjs/src/* dist/mjs
rmdir dist/mjs/src

rm -rf dist/cjs/test
mv dist/cjs/src/* dist/cjs
rmdir dist/cjs/src

# Copy back the manual .d.ts files that tsc doesn't put in dist (https://stackoverflow.com/questions/56018167/typescript-does-not-copy-d-ts-files-to-build)
cp src/internals/trusted_types_typings.d.ts dist/cjs/internals/
cp src/internals/trusted_types_typings.d.ts dist/mjs/internals/
