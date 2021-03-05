#!/bin/bash

blaze query 'filter(".*_golden", :all)' | while read target; do
  touch "goldens/$(echo "$target" | sed -r 's/^.*:(.*)_golden$/\1/').txt"
  blaze run "$target" -- --update
done

