"""Quecreek mine rescue (Pennsylvania, July 2002): script and sound design.

Facts: channel-kit/videos/quecreek-facts.md. Numbers that sources disagree on (flood volume, depth, 77 vs 78 hours)
are phrased loosely ("tens of millions of gallons", "about 240 feet", "about 77 hours").
"""
import numpy as np

ID = "quecreek"
VOICE = "am_michael"
SPEED = 1.03
LEAD = 0.5
TAIL = 4.5  # end card

# (id, spoken text, on-screen caption, pause after in seconds)
LINES = [
    ("h1", "Nine miners were trapped two hundred forty feet underground.", "9 MINERS WERE TRAPPED 240 FEET UNDERGROUND", 0.3),
    ("h2", "Tens of millions of gallons of water had flooded the mine.", "TENS OF MILLIONS OF GALLONS OF WATER HAD FLOODED THE MINE", 0.3),
    ("h3", "Their only hope was a drill, and time was running out.", "THEIR ONLY HOPE WAS A DRILL, AND TIME WAS RUNNING OUT", 0.3),
    ("h4", "Then, from deep below, rescuers heard nine taps.", "THEN, FROM DEEP BELOW, RESCUERS HEARD 9 TAPS", 0.6),
    ("s1", "This is the Kweecreek mine rescue.", "THIS IS THE QUECREEK MINE RESCUE", 0.3),
    ("s2", "It happened in Somerset County, Pennsylvania, in July two thousand two.", "SOMERSET COUNTY, PENNSYLVANIA · JULY 2002", 0.25),
    ("s3", "Eighteen miners were working underground, in two crews of nine.", "18 MINERS, IN TWO CREWS OF 9", 0.3),
    ("s4", "Right next door was an old, abandoned mine.", "RIGHT NEXT DOOR WAS AN OLD, ABANDONED MINE", 0.3),
    ("s5", "Around nine o'clock that night, they broke into it.", "AROUND 9 P.M. ON JULY 24, THEY BROKE INTO IT", 0.6),
    ("f1", "Water poured in.", "WATER POURED IN", 0.35),
    ("f2", "One crew of nine got out.", "ONE CREW OF 9 GOT OUT", 0.3),
    ("f3", "The other nine were cut off, two hundred forty feet down.", "THE OTHER 9 WERE CUT OFF 240 FEET DOWN", 0.6),
    ("d1", "Rescuers raced to the surface above them.", "RESCUERS RACED TO THE SURFACE ABOVE THEM", 0.3),
    ("d2", "A mine safety expert studied old maps to pick the spot to drill.", "A MINE SAFETY EXPERT STUDIED MAPS TO PICK THE SPOT", 0.3),
    ("d3", "Drilling began the next morning, through about two hundred forty feet of rock.", "DRILLING BEGAN THE NEXT MORNING", 0.3),
    ("d4", "The first hole was narrow, but it could bring air.", "THE FIRST HOLE WAS NARROW, BUT IT COULD BRING AIR", 0.3),
    ("d5", "Air pumped down from above helped hold back the water.", "AIR PUMPED DOWN HELPED HOLD BACK THE WATER", 0.35),
    ("w1", "By noon, the water was within seventy feet of them.", "BY NOON, THE WATER WAS WITHIN 70 FEET OF THEM", 0.6),
    ("p1", "Rescuers tapped on the pipe.", "RESCUERS TAPPED ON THE PIPE", 0.3),
    ("p2", "Three strong bangs answered.", "THREE STRONG BANGS ANSWERED", 0.35),
    ("p3", "Later came nine taps. In miners' code: there are nine of us down here.", "9 TAPS: “THERE ARE NINE OF US DOWN HERE”", 0.6),
    ("b1", "But the hardest part was still ahead.", "BUT THE HARDEST PART WAS STILL AHEAD", 0.3),
    ("b2", "Early on July twenty-sixth, the drill bit broke.", "EARLY ON JULY 26, THE DRILL BIT BROKE", 0.3),
    ("b3", "Crews started a second hole while they worked to pull out the broken bit.", "CREWS STARTED A SECOND HOLE WHILE REMOVING THE BIT", 0.3),
    ("b4", "By afternoon, the bit was out and drilling started again.", "BY AFTERNOON, THE BIT WAS OUT AND DRILLING RESUMED", 0.6),
    ("g1", "A bigger drill finally broke through on July twenty-seventh.", "A BIGGER DRILL BROKE THROUGH ON JULY 27", 0.3),
    ("g2", "Twenty-four inches wide, just big enough for a rescue cage.", "24 INCHES WIDE: JUST BIG ENOUGH FOR A RESCUE CAGE", 0.3),
    ("g3", "Then crews heard that all nine were alive.", "THEN CREWS HEARD THAT ALL 9 WERE ALIVE", 0.6),
    ("r1", "A cage, only twenty-two inches wide, went down the shaft.", "A CAGE JUST 22 INCHES WIDE WENT DOWN THE SHAFT", 0.3),
    ("r2", "One at a time, the miners were pulled up.", "ONE AT A TIME, THE MINERS WERE PULLED UP", 0.35),
    ("r3", "By July twenty-eighth, all nine were out.", "BY JULY 28, ALL 9 WERE OUT", 0.3),
    ("r4", "About seventy-seven hours after the flood began.", "ABOUT 77 HOURS AFTER THE FLOOD BEGAN", 0.35),
    ("r5", "All nine survived.", "ALL 9 SURVIVED", 0.5),
    ("r6", "A flooded mine, a narrow hole, and nine taps on a pipe.", "A FLOODED MINE, A NARROW HOLE, AND 9 TAPS ON A PIPE", 0.5),
    ("r7", "Follow for the next story: the Thai cave rescue.", "NEXT: THE THAI CAVE RESCUE. FOLLOW", 0.0),
]


def sound(c):
    """Return (bed, fx) arrays. `c` is the audiolib context: n, SR, tt, at, total, env(), lowpass_noise()."""
    n, SR, tt, at, total = c.n, c.SR, c.tt, c.at, c.total
    env, lowpass_noise = c.env, c.lowpass_noise
    S = lambda i: at[i]["start"]  # noqa: E731
    E = lambda i: at[i]["end"]  # noqa: E731

    def decay(t0, rate):
        return np.where(tt >= t0, np.exp(-np.clip(tt - t0, 0, None) * rate), 0.0).astype(np.float32)

    # bed: low underground drone + faint air
    drone = (np.sin(2 * np.pi * 46 * tt) * 0.5 + np.sin(2 * np.pi * 69 * tt + 0.7) * 0.3 + np.sin(2 * np.pi * 92 * tt) * 0.1).astype(np.float32)
    drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.06 * tt)).astype(np.float32)
    air = lowpass_noise(600)
    air /= np.abs(air).max()
    bed = drone * 0.06 + air * 0.04
    bed *= np.minimum(1, tt / 2.0) * np.minimum(1, (total - tt) / 2.5)

    fx = np.zeros(n, dtype=np.float32)

    def knock(t0, f=340.0, amp=0.25):
        a = int(t0 * SR)
        m = int(0.4 * SR)
        if a + m > n:
            return
        x = np.arange(m) / SR
        fx[a : a + m] += ((np.sin(2 * np.pi * f * x) * np.exp(-x * 13) + 0.5 * np.sin(2 * np.pi * f * 2.3 * x) * np.exp(-x * 24)) * amp).astype(np.float32)

    # hook: nine taps under "heard nine taps"
    for k in range(9):
        knock(S("h4") + 1.3 + k * 0.3, 360, 0.2)
    # the flood: a rush of water, then a lasting trickle
    rush = lowpass_noise(1100)
    rush /= np.abs(rush).max()
    fx += rush * env(S("f1") - 0.2, E("f3") - S("f1") + 0.8, 0.1, 1.5) * 0.5
    fx += rush * env(S("f3"), E("w1") - S("f3") + 0.5, 0.5, 1.0) * 0.12
    fx += (np.sin(2 * np.pi * 40 * tt) * decay(S("f1") - 0.1, 3)).astype(np.float32) * 0.5
    # drill hum while the first hole is drilled
    hum = (np.sin(2 * np.pi * 85 * tt) + 0.5 * np.sin(2 * np.pi * 170 * tt + 0.6)).astype(np.float32)
    hum *= (0.7 + 0.3 * np.sin(2 * np.pi * 6.1 * tt)).astype(np.float32)
    fx += hum * env(S("d3") - 0.3, E("d5") - S("d3") + 0.8, 0.8, 1.0) * 0.05
    # air hiss
    hiss = lowpass_noise(5000)
    hiss = (hiss - np.convolve(hiss, np.ones(8) / 8, mode="same")).astype(np.float32)
    hiss /= np.abs(hiss).max()
    fx += hiss * env(S("d5"), E("d5") - S("d5") + 0.6, 0.3, 0.8) * 0.06
    # tapping on the pipe: 3 taps, 3 strong bangs, then 9 taps
    for k in range(3):
        knock(S("p1") + 0.5 + k * 0.45, 380, 0.22)
    for k in range(3):
        knock(S("p2") + 0.35 + k * 0.55, 190, 0.42)
    for k in range(9):
        knock(S("p3") + 1.0 + k * 0.33, 400, 0.22)
    # drill bit snaps
    tb = S("b2") + 1.1
    sn = lowpass_noise(3500)
    sn /= np.abs(sn).max()
    fx += sn * env(tb, 0.5, 0.005, 0.45) * 0.4
    fx += (np.sin(2 * np.pi * 60 * tt) * decay(tb, 7)).astype(np.float32) * 0.5
    # second drill, then the big drill breaking through
    fx += hum * env(S("b3"), E("b4") - S("b3") + 0.5, 0.8, 0.8) * 0.05
    rb = lowpass_noise(200)
    rb /= np.abs(rb).max()
    fx += rb * env(S("g1") + 0.5, 3.0, 0.5, 1.8) * 0.45
    # cage hoist: motor hum and clanks
    motor = (np.sin(2 * np.pi * 72 * tt) + 0.4 * np.sin(2 * np.pi * 144 * tt)).astype(np.float32)
    fx += motor * env(S("r1"), E("r3") - S("r1") + 0.6, 0.8, 0.8) * 0.05
    for k in range(5):
        knock(S("r2") + 0.3 + k * 1.1, 760, 0.12)
    # warm resolve under "All nine survived"
    chord = (np.sin(2 * np.pi * 196 * tt) + np.sin(2 * np.pi * 247 * tt) + np.sin(2 * np.pi * 294 * tt)).astype(np.float32)
    fx += chord * env(S("r5") - 0.2, E("r6") - S("r5") + 1.0, 1.0, 1.2) * 0.012
    return bed, fx
