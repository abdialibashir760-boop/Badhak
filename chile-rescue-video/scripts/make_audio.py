"""Build narration, sound bed, timeline and captions for one story.

Usage:
  python3 -I scripts/make_audio.py <story> <kokoro.onnx> <voices.bin>
  <story> is a module in scripts/stories/ (san_jose, apollo13, ...).

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
    audiolib.build(story, sys.argv[2], sys.argv[3])
