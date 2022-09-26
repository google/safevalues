#!/bin/bash

# Moves ES Module transpiled JS files, changing their .js in .mjs extension
find ./dist/esm/src/ -type f -name "*js" |
  while read path; do
    mv "${path}" "${path/.js/.mjs}"
  done
cp -r ./dist/esm/src/* .

# Moves CommonJS files, preserving the .js extension
cp -r ./dist/cjs/src/* .
