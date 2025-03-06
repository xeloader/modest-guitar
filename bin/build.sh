#!/bin/sh
mkdir -p build
zip -r build/modest-guitar . -x '*bin*' -x '*build*' -x '*.DS_Store*' -x '*.git*' -x '.*'