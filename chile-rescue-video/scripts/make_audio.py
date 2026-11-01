"""Build narration, sound bed, timeline and captions for one story.

Usage:
  python3 -I scripts/make_audio.py <story> <kokoro.onnx> <voices.bin>      (English stories, Kokoro)
  python3 -I scripts/make_audio.py <story> <tr_TR-voice-medium.onnx> -        (Piper stories, e.g. apollo13_tr)
  <story> is a module in scripts/stories/ (san_jose, apollo13, apollo13_tr, ...).

  python3 -I scripts/make_audio.py <story> --supplied <narration.wav> <align.json>   (your own recording)

Writes: public/<id>.mp3, src/<id>/timeline.ts, out/<id>.srt, out/<id>.wav
Needs: pip install kokoro-onnx soundfile numpy ; ffmpeg on PATH.
"""
import importlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audiolib  # noqa: E402

if __name__ == "__main__":
    story = importlib.import_module(f"stories.{sys.argv[1]}")
    if len(sys.argv) > 4 and sys.argv[2] == "--supplied":
        # python3 -I scripts/make_audio.py <story> --supplied <narration.wav> <align.json>
        audiolib.build_supplied(story, sys.argv[3], sys.argv[4])
    else:
        audiolib.build(story, sys.argv[2], sys.argv[3])
