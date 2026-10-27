"""Apollo 13 (April 1970): script and sound design.

Facts checked against NASA-derived coverage (History.com, CBS, EPFL, Universe Today): launch Apr 11, explosion Apr 13
~205,000 mi out, Mattingly exposed to German measles (rubella), Aquarius as lifeboat, free-return swing, splashdown
Apr 17 in the Pacific near the carrier Iwo Jima. The reentry blackout ran longer than planned, but sources disagree
on by how much, so no number is quoted. `say` text uses phonetic spellings where TTS may stumble (Haise -> Hayz).
"""
import numpy as np

ID = "apollo13"
TAG = "APOLLO 13 · 1970"
VOICE = "am_michael"
SPEED = 1.03
LEAD = 0.5
TAIL = 4.5  # end card

# (id, spoken text, on-screen caption, pause after in seconds)
LINES = [
    ("h1", "More than two hundred thousand miles from Earth, three astronauts heard a bang.", "200,000+ MILES FROM EARTH, THEY HEARD A BANG", 0.3),
    ("h2", "Their spacecraft was dying.", "THEIR SPACECRAFT WAS DYING", 0.25),
    ("h3", "The Moon landing was canceled.", "THE MOON LANDING WAS CANCELED", 0.25),
    ("h4", "Now the only goal was getting home alive.", "NOW THE ONLY GOAL WAS GETTING HOME ALIVE", 0.6),
    ("s1", "This is Apollo thirteen.", "THIS IS APOLLO 13", 0.3),
    ("s2", "It launched on April eleventh, nineteen seventy.", "IT LAUNCHED ON APRIL 11, 1970", 0.25),
    ("s3", "It was meant to be NASA's third landing on the Moon.", "IT WAS MEANT TO BE NASA'S THIRD MOON LANDING", 0.4),
    ("s4", "The crew was Jim Lovell, Fred Hayz, and Jack Swigert.", "THE CREW: LOVELL, HAISE, AND SWIGERT", 0.25),
    ("s5", "Swigert had joined just days before launch.", "SWIGERT JOINED JUST DAYS BEFORE LAUNCH", 0.25),
    ("s6", "Another astronaut had been exposed to German measles, so he was grounded.", "ANOTHER ASTRONAUT WAS EXPOSED TO GERMAN MEASLES", 0.4),
    ("s7", "Two days in, everything was going perfectly.", "TWO DAYS IN, EVERYTHING WAS GOING PERFECTLY", 0.6),
    ("e1", "Then, on April thirteenth, damaged wiring sparked inside an oxygen tank.", "THEN, ON APRIL 13, DAMAGED WIRING SPARKED INSIDE AN OXYGEN TANK", 0.3),
    ("e2", "The tank exploded.", "THE TANK EXPLODED", 0.4),
    ("e3", "Oxygen began leaking into space.", "OXYGEN BEGAN LEAKING INTO SPACE", 0.35),
    ("e4", "Lovell radioed Mission Control: Houston, we've had a problem.", "“HOUSTON, WE'VE HAD A PROBLEM”", 0.35),
    ("e5", "The spacecraft was losing power, and the oxygen was almost gone.", "POWER WAS FAILING. THE OXYGEN WAS ALMOST GONE", 0.6),
    ("l1", "So the crew did something nobody had planned for.", "SO THE CREW DID SOMETHING NOBODY PLANNED FOR", 0.3),
    ("l2", "They moved into the lunar module, Aquarius.", "THEY MOVED INTO THE LUNAR MODULE, AQUARIUS", 0.3),
    ("l3", "It was built to keep two men alive for two days.", "BUILT TO KEEP 2 MEN ALIVE FOR 2 DAYS", 0.3),
    ("l4", "Now it had to keep three men alive for four.", "NOW IT HAD TO KEEP 3 MEN ALIVE FOR 4", 0.4),
    ("l5", "They shut down almost everything to save power.", "THEY SHUT DOWN ALMOST EVERYTHING TO SAVE POWER", 0.3),
    ("l6", "It grew bitterly cold, close to freezing.", "IT GREW BITTERLY COLD, CLOSE TO FREEZING", 0.3),
    ("l7", "Water was strictly rationed.", "WATER WAS STRICTLY RATIONED", 0.6),
    ("t1", "Mission Control used the Moon's gravity to swing them around and back toward Earth.", "MISSION CONTROL USED THE MOON'S GRAVITY TO SWING THEM HOME", 0.3),
    ("t2", "They looped around the far side of the Moon.", "THEY LOOPED AROUND THE FAR SIDE OF THE MOON", 0.3),
    ("t3", "Farther from Earth than any humans have ever been.", "FARTHER FROM EARTH THAN ANY HUMANS HAVE EVER BEEN", 0.6),
    ("c1", "Then a new danger appeared: carbon dioxide.", "THEN A NEW DANGER APPEARED: CARBON DIOXIDE", 0.3),
    ("c2", "The lunar module's filters were filling up.", "THE LUNAR MODULE'S FILTERS WERE FILLING UP", 0.3),
    ("c3", "The spare filters from the command module were the wrong shape.", "THE SPARE FILTERS WERE THE WRONG SHAPE", 0.35),
    ("c4", "Engineers on the ground had to invent an adapter from things the crew had on board.", "ENGINEERS ON THE GROUND HAD TO INVENT AN ADAPTER", 0.3),
    ("c5", "A plastic bag, cardboard, a hose, and duct tape.", "A PLASTIC BAG, CARDBOARD, A HOSE, AND DUCT TAPE", 0.35),
    ("c6", "Mission Control read the steps over the radio, and the crew built it.", "MISSION CONTROL READ THE STEPS. THE CREW BUILT IT", 0.35),
    ("c7", "It worked.", "IT WORKED", 0.6),
    ("r1", "Meanwhile, the ground team wrote a plan to restart the cold command module.", "THE GROUND TEAM WROTE A PLAN TO RESTART THE COLD COMMAND MODULE", 0.3),
    ("r2", "Ken Mattingly, the astronaut who had been grounded, tested it in a simulator.", "KEN MATTINGLY, THE GROUNDED ASTRONAUT, TESTED IT IN A SIMULATOR", 0.35),
    ("r3", "Before reentry, the crew let go of the damaged service module.", "BEFORE REENTRY, THE CREW LET GO OF THE DAMAGED SERVICE MODULE", 0.3),
    ("r4", "They saw that an entire panel had been blown away.", "AN ENTIRE PANEL HAD BEEN BLOWN AWAY", 0.6),
    ("r5", "Then came reentry, and the radio went silent.", "THEN CAME REENTRY, AND THE RADIO WENT SILENT", 0.3),
    ("r6", "It stayed silent longer than anyone expected.", "IT STAYED SILENT LONGER THAN ANYONE EXPECTED", 0.3),
    ("r7", "Mission Control waited.", "MISSION CONTROL WAITED", 0.5),
    ("r8", "Then, finally, the parachutes opened.", "THEN, FINALLY, THE PARACHUTES OPENED", 0.6),
    ("r9", "On April seventeenth, Apollo thirteen splashed down in the Pacific.", "ON APRIL 17, APOLLO 13 SPLASHED DOWN IN THE PACIFIC", 0.35),
    ("r10", "All three astronauts were alive.", "ALL 3 ASTRONAUTS WERE ALIVE", 0.4),
    ("r11", "NASA called it a successful failure.", "NASA CALLED IT A “SUCCESSFUL FAILURE”", 0.5),
    ("r12", "Follow for the next story: thirteen people trapped in a flooded cave.", "NEXT: 13 TRAPPED IN A FLOODED CAVE. FOLLOW", 0.0),
]


def sound(c):
    """Return (bed, fx) arrays. `c` is the audiolib context: n, SR, tt, at, total, env(), lowpass_noise()."""
    n, SR, tt, at, total = c.n, c.SR, c.tt, c.at, c.total
    env, lowpass_noise = c.env, c.lowpass_noise
    def decay(t0, rate):
        """exp(-rate*(t-t0)) after t0, 0 before (avoids overflow before t0)."""
        return np.where(tt >= t0, np.exp(-np.clip(tt - t0, 0, None) * rate), 0.0).astype(np.float32)

    S = lambda i: at[i]["start"]  # noqa: E731
    E = lambda i: at[i]["end"]  # noqa: E731

    # deep-space bed: low drone + faint air, thinning out during the reentry blackout
    drone = (np.sin(2 * np.pi * 49 * tt) * 0.5 + np.sin(2 * np.pi * 73.4 * tt + 0.9) * 0.3 + np.sin(2 * np.pi * 98.0 * tt) * 0.1).astype(np.float32)
    drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.05 * tt)).astype(np.float32)
    air = lowpass_noise(700)
    air /= np.abs(air).max()
    bed = drone * 0.06 + air * 0.04
    bed *= np.minimum(1, tt / 2.0) * np.minimum(1, (total - tt) / 2.5)
    bed *= 1 - 0.8 * env(S("r5"), E("r7") - S("r5") + 0.6, 0.3, 0.5)

    fx = np.zeros(n, dtype=np.float32)
    rb = lowpass_noise(180)
    rb /= np.abs(rb).max()

    # launch rumble and roar under "It launched ..."
    fx += rb * env(S("s2") - 0.2, E("s3") - S("s2") + 0.6, 0.5, 1.2) * 0.5
    # the bang
    t0 = S("e2")
    fx += np.sin(2 * np.pi * 52 * tt).astype(np.float32) * decay(t0, 4) * 0.8
    burst = lowpass_noise(2500)
    burst /= np.abs(burst).max()
    fx += burst * env(t0, 1.6, 0.01, 1.4) * 0.35
    # oxygen leak hiss (high-passed noise)
    leak = lowpass_noise(6000)
    leak = (leak - np.convolve(leak, np.ones(8) / 8, mode="same")).astype(np.float32)
    leak /= np.abs(leak).max()
    fx += leak * env(S("e3"), E("e5") - S("e3") + 0.5, 0.2, 1.0) * 0.1
    # master alarm beeps
    a0, a1 = S("e4") + 0.5, E("e5") + 0.3
    gate = ((((tt - a0) % 0.5) < 0.18) & (tt >= a0) & (tt <= a1)).astype(np.float32)
    fx += (np.sin(2 * np.pi * 1000 * tt) * gate * 0.05).astype(np.float32)
    # radio clicks before "Houston" and when the crew builds the adapter
    for t_click in (S("e4") - 0.15, S("c6") - 0.1, S("c6") + 2.6):
        a = int(t_click * SR)
        m = int(0.06 * SR)
        fx[a : a + m] += (np.random.default_rng(int(t_click * 100)).standard_normal(m) * np.linspace(1, 0, m) * 0.08).astype(np.float32)
    # radio-blackout static
    st = lowpass_noise(4500)
    st /= np.abs(st).max()
    crackle = (np.random.default_rng(5).random(n) > 0.9992).astype(np.float32)
    crackle = np.convolve(crackle, np.hanning(40), mode="same").astype(np.float32)
    fx += (st * 0.05 + crackle * 0.25) * env(S("r5") + 0.8, E("r7") - S("r5") - 0.2, 0.3, 0.4)
    # parachute pops and splash
    for k, off in enumerate((0.15, 0.45, 0.75)):
        tp = S("r8") + off
        fx += np.sin(2 * np.pi * 70 * tt).astype(np.float32) * decay(tp, 12) * 0.5
    ts = S("r9") + 0.9
    sp = lowpass_noise(1800)
    sp /= np.abs(sp).max()
    fx += sp * env(ts, 1.6, 0.02, 1.4) * 0.3
    # warm resolve under "All three astronauts were alive"
    chord = (np.sin(2 * np.pi * 196 * tt) + np.sin(2 * np.pi * 247 * tt) + np.sin(2 * np.pi * 294 * tt)).astype(np.float32)
    fx += chord * env(S("r10") - 0.2, E("r11") - S("r10") + 1.0, 1.0, 1.2) * 0.012
    return bed, fx
