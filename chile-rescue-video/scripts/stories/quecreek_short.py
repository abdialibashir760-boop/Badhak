"""Quecreek mine rescue — SHORT cut (~55 s) for Shorts / Reels / TikTok.

Reuses the scenes of the full story. Beats the short script skips are mapped onto kept lines via ALIAS
(id -> (target id, offset seconds)), so the scenes (keyed to the full story's ids) still find their cues.
"""
from stories.quecreek import sound  # noqa: F401  (same sound design, keyed by line id)

ID = "quecreek-short"
SRC_DIR = "quecreek"
TIMELINE_FILE = "timeline.short.ts"
VOICE = "am_michael"
SPEED = 1.05
LEAD = 0.5
TAIL = 3.5

ALIAS = {
    "h3": ("h2", 1.8),
    "s1": ("s5", -0.3), "s2": ("s5", -0.1), "s3": ("s5", 0.7), "s4": ("s5", 1.5),
    "d1": ("d3", -0.3), "d2": ("d3", 0.0), "d4": ("d3", 1.0), "d5": ("d3", 1.6), "w1": ("d3", 2.0),
    "p2": ("p1", 1.0),
    "b1": ("b2", -0.3), "b3": ("b2", 1.6), "b4": ("b2", 2.4),
    "g1": ("g2", -0.1), "g3": ("g2", 3.6),
    "r1": ("r2", -0.4), "r3": ("r2", 2.2), "r5": ("r4", 2.6), "r6": ("r7", -0.1),
}

# (id, spoken text, on-screen caption, pause after in seconds)
LINES = [
    ("h1", "Nine miners were trapped two hundred forty feet underground.", "9 MINERS WERE TRAPPED 240 FEET UNDERGROUND", 0.25),
    ("h2", "Tens of millions of gallons of water had flooded the mine.", "TENS OF MILLIONS OF GALLONS OF WATER HAD FLOODED THE MINE", 0.25),
    ("h4", "Then, from deep below, rescuers heard nine taps.", "THEN, FROM DEEP BELOW, RESCUERS HEARD 9 TAPS", 0.9),
    ("s5", "On July twenty-fourth, they broke into an old, abandoned mine.", "ON JULY 24, THEY BROKE INTO AN OLD, ABANDONED MINE", 0.3),
    ("f1", "Water poured in.", "WATER POURED IN", 0.25),
    ("f2", "One crew of nine got out.", "ONE CREW OF 9 GOT OUT", 0.25),
    ("f3", "The other nine were cut off.", "THE OTHER 9 WERE CUT OFF", 0.4),
    ("d3", "Rescuers drilled a narrow hole, and pumped air down.", "A NARROW HOLE BROUGHT AIR DOWN", 0.4),
    ("p1", "Rescuers tapped. Three bangs answered.", "RESCUERS TAPPED. 3 BANGS ANSWERED", 0.3),
    ("p3", "Then came nine taps. In miners' code: there are nine of us down here.", "9 TAPS: “THERE ARE NINE OF US DOWN HERE”", 0.5),
    ("b2", "On July twenty-sixth, the drill bit broke.", "ON JULY 26, THE DRILL BIT BROKE", 0.4),
    ("g2", "A bigger drill opened a hole twenty-four inches wide, just big enough for a rescue cage.", "A BIGGER DRILL OPENED A 24-INCH HOLE FOR A RESCUE CAGE", 0.4),
    ("r2", "One at a time, the miners were pulled up.", "ONE AT A TIME, THE MINERS WERE PULLED UP", 0.3),
    ("r4", "About seventy-seven hours after the flood began, all nine were out, alive.", "ABOUT 77 HOURS AFTER THE FLOOD, ALL 9 WERE OUT, ALIVE", 0.3),
    ("r7", "Follow for the next story: the Thai cave rescue.", "NEXT: THE THAI CAVE RESCUE. FOLLOW", 0.0),
]
