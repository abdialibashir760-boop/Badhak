#!/usr/bin/env bash
# usage: scripts/stills.sh frame [frame...]  -> work/stills/f<frame>.jpg (single bundle, many frames)
cd "$(dirname "$0")/.."
BE=${REMOTION_BROWSER_EXECUTABLE:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
for fr in "$@"; do
  npx remotion still src/index.ts ZihniOyunu work/stills/f$fr.jpg --frame=$fr --image-format=jpeg --browser-executable=$BE >/dev/null 2>&1 || echo "fail $fr"
done
