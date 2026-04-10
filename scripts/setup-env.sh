#!/bin/sh

if [ -x /opt/homebrew/opt/node@22/bin/node ]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

if [ -z "${npm_config_python:-}" ] && [ -x /opt/homebrew/opt/python@3.11/bin/python3.11 ]; then
  export npm_config_python="/opt/homebrew/opt/python@3.11/bin/python3.11"
fi

if [ -z "${ELECTRON_MIRROR:-}" ]; then
  export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
fi
