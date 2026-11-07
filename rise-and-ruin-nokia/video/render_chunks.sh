#!/bin/bash
# Resumable chunked render: skips chunks that already exist.
cd "$(dirname "$0")"
TOTAL=17115; N=6; SIZE=$(( (TOTAL + N - 1) / N ))
for i in $(seq 0 $((N-1))); do
  a=$(( i * SIZE )); b=$(( a + SIZE - 1 )); [ $b -ge $TOTAL ] && b=$(( TOTAL - 1 ))
  f=out/chunks/c$i.mp4
  if [ -s "$f" ]; then echo "chunk $i exists"; continue; fi
  npx remotion render src/index.ts Film "$f.part.mp4" --codec=h264 --crf=21 --frames=$a-$b --log=error && mv "$f.part.mp4" "$f" && echo "chunk $i done"
done
echo ALLDONE
