#!/usr/bin/env python3
"""Generate one image per row of visual_prompts.csv with the Gemini API (run this on YOUR computer).

Setup (once):
    pip install google-genai pillow
    # create a key at https://aistudio.google.com/apikey, then:
    export GEMINI_API_KEY="your-key"          # Windows PowerShell: $env:GEMINI_API_KEY="your-key"

Usage:
    python generate_images.py --list-models              # see which image models your key can use
    python generate_images.py --dry-run                  # check the CSV, no API calls, no cost
    python generate_images.py --limit 4                  # TEST FIRST: only the first 4 prompts
    python generate_images.py --reference stickman.png   # keep the same character in every image
    python generate_images.py                            # everything (skips images that already exist)

Images are saved to ./images/001.png, 002.png ... and the script can be stopped and restarted.
The key is only read from the environment; never paste it into this file or share it.
"""
import argparse, csv, io, os, sys, time

DEFAULT_MODEL = os.environ.get("IMAGE_MODEL", "gemini-2.5-flash-image")  # change if Google renames/updates models


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="visual_prompts.csv")
    ap.add_argument("--out", default="images")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--reference", help="optional PNG/JPG of your stickman to keep the character consistent")
    ap.add_argument("--start", type=int, default=1, help="first row number to generate")
    ap.add_argument("--limit", type=int, default=0, help="stop after N images (0 = all)")
    ap.add_argument("--delay", type=float, default=4.0, help="seconds to wait between requests (rate limits)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--list-models", action="store_true")
    a = ap.parse_args()

    rows = list(csv.DictReader(open(a.csv, encoding="utf-8")))
    if a.dry_run:
        print(f"{len(rows)} prompts. First:\n  {rows[0]['prompt'][:200]}...\nModel would be: {a.model}")
        return

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Set GEMINI_API_KEY first (see the top of this file).")
    from google import genai
    from PIL import Image
    client = genai.Client(api_key=key)

    if a.list_models:
        for m in client.models.list():
            print(m.name)
        return

    ref = Image.open(a.reference) if a.reference else None
    os.makedirs(a.out, exist_ok=True)
    done = 0
    for r in rows:
        n = int(r["#"])
        path = os.path.join(a.out, f"{n:03d}.png")
        if n < a.start or os.path.exists(path):
            continue
        prompt = r["prompt"]
        contents = [ref, "Draw the SAME character as in the reference image. " + prompt] if ref else [prompt]
        for attempt in range(1, 5):
            try:
                resp = client.models.generate_content(model=a.model, contents=contents)
                img = None
                for part in resp.candidates[0].content.parts:
                    if getattr(part, "inline_data", None) and part.inline_data.data:
                        img = Image.open(io.BytesIO(part.inline_data.data))
                        break
                if img is None:
                    raise RuntimeError("no image in response (the prompt may have been refused)")
                img.save(path)
                print(f"saved {path}  ({r['narration'][:50]})")
                break
            except Exception as e:  # rate limit, refusal, network...
                print(f"  attempt {attempt} failed for #{n}: {e}")
                time.sleep(a.delay * attempt * 2)
        else:
            print(f"  giving up on #{n}; re-run the script to retry it")
        done += 1
        if a.limit and done >= a.limit:
            break
        time.sleep(a.delay)


if __name__ == "__main__":
    main()
