#!/bin/sh
command -v npm >/dev/null 2>&1 || { echo >&2 "I require npm but it's not installed. Aborting."; exit 1; }

echo "Installing Zaqar renderers..."
[[ -z "$RENDERER_LIST" ]] && echo "List is empty, using default..." && RENDERER_LIST="zaqar-renderer-mustache zaqar-renderer-ejs"

echo "Found renderer list: $RENDERER_LIST"

echo "Starting..."
npm i --no-save $RENDERER_LIST
