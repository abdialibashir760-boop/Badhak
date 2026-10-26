import os
LANG = os.environ.get("LANG_ID", "en")
FILES = {"en": ["public/audio/vo1.mp3", "public/audio/vo2.mp3"], "tr": ["tr/audio/a2.mp3", "tr/audio/a3.mp3", "tr/audio/a4.mp3"]}[LANG]
