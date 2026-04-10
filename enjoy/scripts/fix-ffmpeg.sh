#!/bin/bash
# Fix ffmpeg/ffprobe binaries that have corrupted code signatures on macOS
# Replace them with symlinks to Homebrew-installed versions

set -e

FFPROBE_PATH="node_modules/@andrkrn/ffprobe-static/ffprobe"
FFMPEG_PATH="node_modules/ffmpeg-static/ffmpeg"

# Check Homebrew ffmpeg is installed
if ! command -v ffprobe &>/dev/null || ! command -v ffmpeg &>/dev/null; then
  echo "Error: ffmpeg/ffprobe not found. Install with: brew install ffmpeg"
  exit 1
fi

SYS_FFPROBE=$(command -v ffprobe)
SYS_FFMPEG=$(command -v ffmpeg)

for pair in "$FFPROBE_PATH|$SYS_FFPROBE" "$FFMPEG_PATH|$SYS_FFMPEG"; do
  target="${pair%%|*}"
  source="${pair##*|}"
  if [ -f "$target" ] && [ ! -L "$target" ]; then
    mv "$target" "$target.bak"
    ln -s "$source" "$target"
    echo "Linked $target -> $source"
  elif [ -L "$target" ]; then
    echo "Already a symlink: $target"
  fi
done

echo "Done."
