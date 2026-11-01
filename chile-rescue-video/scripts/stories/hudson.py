"""Hudson River landing (US Airways Flight 1549, Jan 15, 2009) — narration supplied by the channel owner; sound design.

Build:  python3 -I scripts/make_audio.py hudson --supplied <narration.wav> <align.json>
`align.json` (start/end of each recorded line) comes from the ASR alignment step (see channel-kit/scripts).
Placeholder ALIAS entries cover lines that are not in the recording yet; a real recorded line overrides its alias.
"""
import numpy as np

ID = "hudson"
LEAD = 0.5
TAIL = 4.5

# (id, spoken text, on-screen caption, pause after) — pause is unused for supplied audio
LINES = [
    ('h1', 'Minutes after takeoff from New York, both engines lost power.', 'MINUTES AFTER TAKEOFF, BOTH ENGINES LOST POWER', 0.3),
    ('h2', 'There were one hundred fifty-five people on board.', '155 PEOPLE ON BOARD', 0.3),
    ('h3', 'No runway was close enough. The only flat place left was a river.', 'NO RUNWAY WAS CLOSE ENOUGH. ONLY A RIVER', 0.3),
    ('h4', 'And they had less than four minutes.', 'AND THEY HAD LESS THAN 4 MINUTES', 0.3),
    ('s1', 'This is US Airways Flight fifteen forty-nine.', 'THIS IS US AIRWAYS FLIGHT 1549', 0.3),
    ('s2', 'January fifteenth, two thousand nine.', 'JANUARY 15, 2009', 0.3),
    ('s3', 'An Airbus A320, leaving LaGuardia Airport for Charlotte.', 'AN AIRBUS A320, LAGUARDIA TO CHARLOTTE', 0.3),
    ('s4', 'In the cockpit: Captain Chesley Sullenberger, known as Sully, and First Officer Jeffrey Skiles.', 'CAPTAIN “SULLY” SULLENBERGER AND FIRST OFFICER JEFFREY SKILES', 0.3),
    ('b1', 'Around three twenty-five in the afternoon, they took off.', 'AROUND 3:25 P.M., THEY TOOK OFF', 0.3),
    ('b2', 'Then they hit a flock of Canada geese.', 'THEN THEY HIT A FLOCK OF CANADA GEESE', 0.3),
    ('b3', 'The first officer saw the birds only seconds before impact.', 'THE FIRST OFFICER SAW THE BIRDS SECONDS BEFORE IMPACT', 0.3),
    ('b4', 'Both engines swallowed birds, and thrust dropped almost to nothing.', 'BOTH ENGINES SWALLOWED BIRDS. THRUST DROPPED ALMOST TO NOTHING', 0.3),
    ('b5', 'Without thrust, the plane was now a glider.', 'WITHOUT THRUST, THE PLANE WAS A GLIDER', 0.3),
    ('d1', 'Sully took the controls.', 'SULLY TOOK THE CONTROLS', 0.3),
    ('d2', 'Skiles worked through the engine restart checklist.', 'SKILES WORKED THE ENGINE RESTART CHECKLIST', 0.3),
    ('d3', 'Air traffic control offered a runway at Teterboro, New Jersey.', 'AIR TRAFFIC CONTROL OFFERED A RUNWAY AT TETERBORO', 0.3),
    ('d4', 'But Sully knew they could not reach it.', 'BUT SULLY KNEW THEY COULD NOT REACH IT', 0.3),
    ('d5', 'There was only one place left to land: the Hudson River.', 'ONE PLACE LEFT: THE HUDSON RIVER', 0.3),
    ('c1', 'Sully told the cabin: brace for impact.', '“BRACE FOR IMPACT”', 0.3),
    ('c2', 'The flight attendants got the passengers ready.', 'THE FLIGHT ATTENDANTS GOT THE PASSENGERS READY', 0.3),
    ('l1', 'At about three thirty-one, the plane touched down on the Hudson.', 'AT ABOUT 3:31 P.M., IT TOUCHED DOWN ON THE HUDSON', 0.3),
    ('l2', 'Three and a half minutes after the birds.', '3½ MINUTES AFTER THE BIRDS', 0.3),
    ('l3', 'The plane stayed afloat, and passengers climbed out onto the wings.', 'THE PLANE STAYED AFLOAT. PASSENGERS CLIMBED ONTO THE WINGS', 0.3),
    ('r1', 'Within three minutes, the first ferry reached them.', 'WITHIN 3 MINUTES, THE FIRST FERRY REACHED THEM', 0.3),
    ('r2', 'Six more boats arrived within ten minutes.', '6 MORE BOATS ARRIVED WITHIN 10 MINUTES', 0.3),
    ('r3', 'Everyone was rescued.', 'EVERYONE WAS RESCUED', 0.3),
    ('r4', 'All one hundred fifty-five survived.', 'ALL 155 SURVIVED', 0.3),
    ('e1', 'Investigators later found birds in both engines.', 'INVESTIGATORS FOUND BIRDS IN BOTH ENGINES', 0.3),
    ('e2', 'They also asked: could the plane have turned back to the airport?', 'COULD THE PLANE HAVE TURNED BACK?', 0.3),
    ('e3', 'Simulations that said yes left out the time it takes to realize what has happened.', 'SIMULATIONS LEFT OUT THE TIME TO REALIZE WHAT HAD HAPPENED', 0.3),
    ('e4', 'The head of the NTSB said that with just one thing different, it could have been a tragedy instead of a miracle.', 'WITH ONE THING DIFFERENT, IT COULD HAVE BEEN A TRAGEDY', 0.3),
    ('e5', 'Skill, training, and quick decisions made the difference.', 'SKILL, TRAINING, AND QUICK DECISIONS', 0.3),
    ('n1', 'Follow for the next story: the Thai cave rescue.', 'NEXT: THE THAI CAVE RESCUE. FOLLOW', 0.3),
]

ALIAS = {
    "r4": ("r3", 1.6), "e1": ("r3", 3.2), "e2": ("r3", 4.8), "e3": ("r3", 6.4),
    "e4": ("r3", 8.0), "e5": ("r3", 9.6), "n1": ("r3", 11.2),
}


def sound(c):
    """Return (bed, fx). Engines hum until both fail at b4; then wind; splash, ferry horn, warm resolve."""
    n, SR, tt, at, total = c.n, c.SR, c.tt, c.at, c.total
    env, lowpass_noise = c.env, c.lowpass_noise
    S = lambda i: at[i]["start"]  # noqa: E731
    E = lambda i: at[i]["end"]  # noqa: E731

    def decay(t0, rate):
        return np.where(tt >= t0, np.exp(-np.clip(tt - t0, 0, None) * rate), 0.0).astype(np.float32)

    # engine drone until the birds hit, then almost nothing; wind after
    t_out = S("b4") + 0.4
    gain = np.clip(1 - (tt - t_out) / 1.2, 0.04, 1.0).astype(np.float32)
    eng = (np.sin(2 * np.pi * 108 * tt) * 0.5 + np.sin(2 * np.pi * 162 * tt + 0.8) * 0.3 + np.sin(2 * np.pi * 216 * tt) * 0.15).astype(np.float32)
    eng *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.7 * tt)).astype(np.float32)
    rumble = lowpass_noise(380)
    rumble /= np.abs(rumble).max()
    bed = (eng * 0.05 + rumble * 0.05) * gain
    wind = lowpass_noise(1400)
    wind /= np.abs(wind).max()
    bed = bed + wind * env(t_out, E("l1") - t_out + 0.5, 1.5, 1.0) * 0.045
    bed *= np.minimum(1, tt / 1.5) * np.minimum(1, (total - tt) / 2.5)

    fx = np.zeros(n, dtype=np.float32)
    # bird strike thumps and feathers
    for k, off in enumerate((0.9, 1.15)):
        fx += (np.sin(2 * np.pi * 75 * tt) * decay(S("b2") + off, 9)).astype(np.float32) * 0.5
    feather = lowpass_noise(4000)
    feather /= np.abs(feather).max()
    fx += feather * env(S("b2") + 0.9, 0.7, 0.01, 0.6) * 0.25
    # engines spooling down: falling tone
    t0 = S("b4") + 0.3
    f = np.clip(320 - (tt - t0) * 200, 70, 320)
    phase = 2 * np.pi * np.cumsum(f) / c.SR
    fx += (np.sin(phase) * env(t0, 1.6, 0.05, 1.2)).astype(np.float32) * 0.07
    # impact swell on "brace for impact"
    sw = (np.sin(2 * np.pi * 98 * tt) + np.sin(2 * np.pi * 147 * tt)).astype(np.float32)
    fx += sw * env(S("c1") - 0.2, E("c2") - S("c1") + 1.2, 1.0, 0.8) * 0.03
    # splash, then water lapping
    ts = S("l1") + 1.0
    sp = lowpass_noise(1800)
    sp /= np.abs(sp).max()
    fx += sp * env(ts, 1.8, 0.02, 1.5) * 0.4
    fx += (np.sin(2 * np.pi * 52 * tt) * decay(ts, 5)).astype(np.float32) * 0.6
    lap = lowpass_noise(500)
    lap /= np.abs(lap).max()
    fx += lap * env(ts + 1.0, E("r3") - ts + 1.0, 1.0, 1.0) * 0.07
    # ferry horn
    th = S("r1") + 0.6
    horn = (np.sin(2 * np.pi * 148 * tt) + 0.5 * np.sin(2 * np.pi * 222 * tt)).astype(np.float32)
    fx += horn * env(th, 1.4, 0.08, 0.5) * 0.05
    # warm resolve when everyone is safe
    chord = (np.sin(2 * np.pi * 196 * tt) + np.sin(2 * np.pi * 247 * tt) + np.sin(2 * np.pi * 294 * tt)).astype(np.float32)
    fx += chord * env(S("r3") - 0.1, E("r4") - S("r3") + 1.5, 1.0, 1.2) * 0.014
    return bed, fx
