#!/usr/bin/env bash
# Rebuilds every audio asset from the two supplied narration files + src/data/{storyboard,events}.json
set -euo pipefail
cd "$(dirname "$0")"
python3 align.py > ../work/alignment.log      # match script sentences to the recorded audio
python3 build_timing.py                       # global timeline, src/data/timing.json, work/vo.wav
python3 synth_audio.py                        # original music bed + sound effects (numpy)
mkdir -p ../public/audio
for n in narration music sfx; do
  ffmpeg -y -v error -i ../work/$n.wav -c:a libmp3lame -q:a 2 ../public/audio/$n.mp3
done
ffmpeg -hide_banner -nostats -i ../work/mix_preview.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
