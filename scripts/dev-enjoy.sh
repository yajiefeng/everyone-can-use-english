#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

. ./scripts/setup-env.sh

if [ -r /dev/tty ]; then
  exec </dev/tty node ./scripts/dev-enjoy.cjs
else
  exec node ./scripts/dev-enjoy.cjs
fi
