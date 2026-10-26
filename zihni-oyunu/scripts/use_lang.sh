#!/usr/bin/env bash
# usage: scripts/use_lang.sh en|tr  — selects on-screen text and rebuilds timeline + audio for that language
set -euo pipefail
cd "$(dirname "$0")/.."
export LANG_ID="${1:-en}"
cp "src/data/strings.$LANG_ID.json" src/data/strings.json
scripts/build_audio.sh
