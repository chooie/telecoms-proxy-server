#!/usr/bin/env bash

if [ ! -f "./node_modules/.bin/jake" ] ; then
  echo "NPM is rebuilding: "
  npm rebuild
fi

./node_modules/.bin/jake -f "build/scripts/Jakefile.js"
