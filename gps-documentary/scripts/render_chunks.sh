#!/bin/bash
# Renders the film in 8 muted 30 s chunks (resilient to a crash), then concatenates them.
#   bash scripts/render_chunks.sh [chromium-path]
set -e
cd "$(dirname "$0")/.."
BROWSER="${1:-/opt/pw-browsers/chromium}"
mkdir -p out/chunks
FPS=30; CH=900; TOTAL=7200
for i in 0 1 2 3 4 5 6 7; do
  A=$((i*CH)); B=$((A+CH-1))
  f=out/chunks/c$i.mp4
  if [ -s "$f" ]; then echo "skip c$i"; continue; fi
  echo "=== chunk $i frames $A-$B $(date +%T)"
  npx remotion render src/index.ts GpsDocumentary "$f" --frames=$A-$B --muted --codec=h264 --crf=17 --concurrency=4 --timeout=180000 --browser-executable="$BROWSER" 2>&1 | grep -E "Rendered [0-9]+/[0-9]+$|Encoded [0-9]+/[0-9]+$|Error|error" | tail -2
done
: > out/chunks/list.txt
for i in 0 1 2 3 4 5 6 7; do echo "file 'c$i.mp4'" >> out/chunks/list.txt; done
npx remotion ffmpeg -y -v error -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_silent.mp4
echo "=== ALL DONE $(date +%T)"
