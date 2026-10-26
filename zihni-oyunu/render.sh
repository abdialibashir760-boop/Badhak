#!/usr/bin/env bash
# Repeatable render of the finished film.
#   ./render.sh            -> dist/zihni-oyunu-people-pleasing.mp4 (1920x1080, 30 fps, H.264 + AAC)
#   ./render.sh preview    -> dist/preview-540p.mp4 (half resolution, fast check)
#   ./render.sh audio      -> rebuild narration/music/sfx first, then render
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:-final}"
if [ "$MODE" = "audio" ]; then scripts/build_audio.sh; MODE=final; fi
[ -d node_modules ] || npm install
# Remotion normally downloads its own Chrome. If that is not possible (offline sandbox), fall back to a system Chromium.
if [ -z "${REMOTION_BROWSER_EXECUTABLE:-}" ] && [ -x /opt/pw-browsers/chromium-1243/chrome-linux64/chrome ]; then
  export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
fi
BROWSER_ARGS=()
if [ -n "${REMOTION_BROWSER_EXECUTABLE:-}" ]; then BROWSER_ARGS=(--browser-executable="$REMOTION_BROWSER_EXECUTABLE"); fi
mkdir -p dist
if [ "$MODE" = "preview" ]; then
  npx remotion render src/index.ts ZihniOyunu dist/preview-540p.mp4 --scale=0.5 --crf=30 --concurrency=4 "${BROWSER_ARGS[@]}"
else
  npx remotion render src/index.ts ZihniOyunu dist/zihni-oyunu-people-pleasing.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k --concurrency=4 "${BROWSER_ARGS[@]}"
fi
