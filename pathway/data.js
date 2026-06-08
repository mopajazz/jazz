// Beginner Pathway — module data, glossary, practice tips.
// Plain JS attached to window so all babel scripts can read it.

window.PATHWAY = {
  meta: {
    title: "Foundations of the Jazz Language",
    eyebrow: "Beginner Pathway",
    intro:
      "Welcome to your first steps in speaking jazz. This pathway introduces the core building blocks before diving into Coker's full devices. Each module follows the same See, Hear, Play, Apply flow you'll find throughout the site. Take your time, listen deeply, and play along daily. You'll be ready to explore the full vocabulary in no time.",
    estTime: "4–6 hours",
    moduleCount: 6,
    level: "Beginner",
    audience: [
      { label: "Complete beginners", note: "New to improvisation entirely" },
      { label: "Returning adult learners", note: "Coming back to music after a break" },
      { label: "University students", note: "First exposure to jazz language" },
    ],
  },

  // Consistent across every module
  tips: [
    { head: "Sing before you play", body: "If you can hear it in your voice, your hands will find it faster." },
    { head: "Start slow", body: "Accuracy over speed. Tempo is the last thing you add, never the first." },
    { head: "10 minutes daily", body: "Ten focused minutes a day beats two hours once a week. Consistency wins." },
  ],

  // Glossary terms surfaced as pop-ups wherever they appear in copy
  glossary: {
    "swing": "Playing eighth notes unevenly — long-then-short — so the line feels like it's bouncing rather than marching. The heartbeat of jazz time feel.",
    "chord tones": "The notes that actually build a chord (root, 3rd, 5th, 7th). Landing on them makes a line sound 'inside' the harmony.",
    "key center": "The home note and scale a passage is organized around — the gravity every phrase is pulled back toward.",
    "ii–V–I": "The most common chord progression in jazz: a three-chord move that resolves home. Most standards are built from chains of it.",
    "triplet": "Three evenly-spaced notes in the space of one beat. Swung eighths borrow their long-short shape from the triplet.",
    "ghost note": "A note played so softly it's felt more than heard — adds groove and texture without changing the line.",
    "blues scale": "A six-note scale (1 ♭3 4 ♭5 5 ♭7) whose 'blue notes' carry the vocal, crying sound at the root of jazz.",
    "pentatonic": "A five-note scale with no half-steps — open, forgiving, and impossible to play a wrong note in. A beginner's best friend.",
    "comping": "Accompanying — playing chords rhythmically behind a soloist to support and propel them.",
    "the head": "The main written melody of a tune, played at the top and bottom of a performance, framing the solos in between.",
    "voice leading": "Connecting one chord to the next by the smallest possible melodic moves, so lines flow instead of jump.",
  },

  modules: [
    // ── 01 ───────────────────────────────────────────────────────────────
    {
      num: 1,
      slug: "swing-basics",
      kind: "standard",
      title: "Jazz Rhythm & Swing Basics",
      titleWord: "Swing",
      difficulty: "All levels",
      time: "10 min",
      goal: "Develop authentic time feel before adding notes.",
      summary:
        "Before a single note matters, the *feel* does. Learn how jazz eighth notes breathe, and why that 'swing' is what makes the music come alive.",
      see: {
        intro:
          "Jazz isn't played exactly on the beat — it breathes. This {{swing}} is what makes it feel alive. Watch how even eighth notes turn into the long-short pulse that drives the music.",
        diagrams: ["swing", "triplet", "comping"],
        points: [
          "Straight eighths divide the beat evenly — correct, but stiff.",
          "Swung eighths borrow the long-short shape of a {{triplet}}.",
          "Comping rhythms like the Charleston give the groove its skeleton.",
        ],
      },
      hear: {
        intro: "Hear the same simple blues groove played straight, then swung. Your ear will lock onto the difference instantly.",
        clips: [
          { label: "Blues groove — straight", desc: "Even eighths. Notice how mechanical it feels.", dur: "0:12", feel: "straight" },
          { label: "Blues groove — swung", desc: "Same notes, long-short feel. Now it moves.", dur: "0:12", feel: "swung" },
          { label: "Slow demonstration", desc: "Bass and drums isolated at a relaxed tempo.", dur: "0:20", feel: "swung" },
        ],
      },
      play: {
        prompt: "Tap or clap first, then bring in your instrument. Toggle between feels and hear your own time tighten up.",
        keys: ["C", "F", "B♭"],
        variations: ["Straight 8ths", "Swing", "Add Ghost Notes"],
        backing: "Simple blues — bass, drums, light piano",
        tempoMin: 40,
        tempoMax: 120,
        tempoStart: 80,
        record: true,
      },
      apply: {
        tryAtHome: "Play along with a favorite blues recording. Don't worry about notes — match the time feel only.",
        context:
          "Listen to early Miles Davis or any blues-based player. Notice how the line leans back, never rushing. That lean is swing.",
        prompt: "Record yourself playing a simple line over the track. Focus only on making it {{swing}}.",
      },
    },

    // ── 02 ───────────────────────────────────────────────────────────────
    {
      num: 2,
      slug: "major-blues-scale",
      kind: "standard",
      title: "The Major Blues Scale",
      titleWord: "Blues",
      difficulty: "Beginner",
      time: "12 min",
      goal: "Get one expressive scale under your fingers that sounds great over the whole blues.",
      summary:
        "One scale. Twelve bars. The {{blues scale}} is the most forgiving sound in jazz — learn its shape and you can already say something true.",
      see: {
        intro:
          "The {{blues scale}} adds 'blue notes' to a simple major idea — the bent, vocal tones that give the music its cry. Six notes, and almost nothing sounds wrong.",
        diagrams: ["bluesscale"],
        points: [
          "Built from scale degrees 1, ♭3, 4, ♭5, 5, ♭7.",
          "The ♭5 is the signature 'blue note' — pass through it, don't sit on it.",
          "The same shape works over the I, IV, and V of a blues.",
        ],
      },
      hear: {
        intro: "Hear the scale ascending, then heard as a lazy melodic phrase over a shuffle. Same notes — two very different uses.",
        clips: [
          { label: "Scale, ascending", desc: "All six notes, slow and clear.", dur: "0:08", feel: "straight" },
          { label: "As a phrase", desc: "The same notes shaped into a singing line.", dur: "0:14", feel: "swung" },
          { label: "Over a shuffle", desc: "Phrase placed over bass and drums.", dur: "0:18", feel: "swung" },
        ],
      },
      play: {
        prompt: "Pick a key, set a slow tempo, and noodle. There are no wrong notes here — listen for the ones that feel like they're crying.",
        keys: ["C", "F", "B♭"],
        variations: ["Ascending", "Descending", "Free"],
        backing: "12-bar shuffle in one key",
        tempoMin: 50,
        tempoMax: 140,
        tempoStart: 90,
        record: true,
      },
      apply: {
        tryAtHome: "Put on a slow blues and use only these six notes for one whole chorus. Resist adding anything else.",
        context:
          "Almost every blues-based solo you love leans on this scale. The restraint is the lesson — great players say a lot with few notes.",
        prompt: "Record one 12-bar chorus using only the {{blues scale}}. Aim for one phrase per four bars — leave space.",
      },
    },

    // ── 03 ───────────────────────────────────────────────────────────────
    {
      num: 3,
      slug: "change-running",
      kind: "standard",
      title: "Change-Running — Chord Tones",
      titleWord: "Chord Tones",
      difficulty: "Beginner",
      time: "12 min",
      goal: "Outline the harmony in real time by spelling chords as melody.",
      summary:
        "Spell the chord, make a melody. Landing on {{chord tones}} is how you sound 'inside' the changes — the foundation everything else is built on.",
      linksTo: { label: "Full Change-Running device", note: "This is the beginner-friendly on-ramp to the live module." },
      see: {
        intro:
          "Change-running means arpeggiating — spelling out the notes of a chord as a melodic phrase. It orients your ear, outlines the harmony, and connects one chord to the next.",
        diagrams: ["chordtones"],
        points: [
          "A phrase doesn't have to start on the root — skip tones, move both ways.",
          "Target a {{chord tones}} on the strong beats; pass through the rest.",
          "Practiced daily, the chord lives in your ear and your hands.",
        ],
      },
      hear: {
        intro: "Hear a plain arpeggio, then the same chord tones shaped musically over a ii–V–I.",
        clips: [
          { label: "Straight arpeggio", desc: "Root–3–5–7, up and down.", dur: "0:08", feel: "straight" },
          { label: "Shaped as melody", desc: "Same tones, rhythm and direction added.", dur: "0:12", feel: "swung" },
          { label: "Over ii–V–I", desc: "Chord tones connecting three chords.", dur: "0:16", feel: "swung" },
        ],
      },
      play: {
        prompt: "Tap chord tones to build a phrase, then play it back. Try starting somewhere other than the root.",
        keys: ["C", "F", "B♭"],
        variations: ["Ascending", "Descending", "Skip tones"],
        backing: "ii–V–I in one key",
        tempoMin: 50,
        tempoMax: 160,
        tempoStart: 100,
        record: true,
      },
      apply: {
        tryAtHome: "Over a slow ii–V–I loop, play only chord tones for a full chorus. Make it sing, not just spell.",
        context:
          "J.J. Johnson, Freddie Hubbard, and John Coltrane all used change-running to make the harmony unmistakably clear before getting more adventurous.",
        prompt: "Record a phrase that outlines each chord using only its {{chord tones}}, moving smoothly between them.",
      },
    },

    // ── 04 ───────────────────────────────────────────────────────────────
    {
      num: 4,
      slug: "seven-three",
      kind: "standard",
      title: "Simple 7–3 Resolutions",
      titleWord: "7–3",
      difficulty: "Beginner",
      time: "10 min",
      goal: "Feel the single voice-leading move that powers bebop harmony.",
      summary:
        "One note falls a half step — and the whole progression resolves. The 7–3 move is the smallest gesture with the biggest payoff.",
      see: {
        intro:
          "The ♭7 of the ii chord pulls down a half step to the 3 of the V chord. This tiny {{voice leading}} move is the engine of how jazz harmony resolves.",
        diagrams: ["seventhree"],
        points: [
          "Find the ♭7 of the ii chord. It wants to fall.",
          "Let it drop a half step — you've landed on the 3 of the V.",
          "Your ear hears 'tension, then home.' That's the whole trick.",
        ],
      },
      hear: {
        intro: "Hear the two notes alone, then the full resolution inside a ii–V.",
        clips: [
          { label: "Two notes", desc: "The ♭7 falling to the 3, isolated.", dur: "0:06", feel: "straight" },
          { label: "Inside a ii–V", desc: "The same move, in harmonic context.", dur: "0:10", feel: "swung" },
          { label: "Looped", desc: "ii–V repeated so the pull sinks in.", dur: "0:16", feel: "swung" },
        ],
      },
      play: {
        prompt: "Hold the ♭7, then resolve it down a half step on the chord change. Feel where it wants to go before you move it.",
        keys: ["C", "F", "B♭"],
        variations: ["Two notes", "Add a lead-in", "Full ii–V"],
        backing: "ii–V loop in one key",
        tempoMin: 50,
        tempoMax: 150,
        tempoStart: 90,
        record: true,
      },
      apply: {
        tryAtHome: "On any standard, find every ii–V and play just the 7–3 resolution as the chords go by. Nothing else.",
        context:
          "This single move shows up in nearly every bebop line ever played. Once you hear it, you can't un-hear it.",
        prompt: "Record yourself resolving 7 to 3 across a few ii–V changes. Aim for smooth, connected {{voice leading}}.",
      },
    },

    // ── 05 ───────────────────────────────────────────────────────────────
    {
      num: 5,
      slug: "pentatonic-patterns",
      kind: "standard",
      title: "Pentatonic & Digital Patterns",
      titleWord: "Patterns",
      difficulty: "Beginner → Intermediate",
      time: "12 min",
      goal: "Turn a safe five-note scale into motion with simple numbered cells.",
      summary:
        "The {{pentatonic}} is forgiving; numbered {{patterns}} make it move. This is the bridge from 'noodling' to lines that go somewhere.",
      bridge: true,
      see: {
        intro:
          "The {{pentatonic}} has five notes and no half-steps — open and forgiving. Layer simple 'digital' cells like 1-2-3-5 on top and the scale starts to drive forward.",
        diagrams: ["pentatonic"],
        points: [
          "Five notes, zero half-steps — hard to sound wrong.",
          "Number the notes and play cells: 1-2-3-5, 5-3-2-1.",
          "Sequencing one cell up the scale is how lines build momentum.",
        ],
      },
      hear: {
        intro: "Hear the bare scale, then a 1-2-3-5 cell sequenced through it over a groove.",
        clips: [
          { label: "Pentatonic scale", desc: "Five notes, up and down.", dur: "0:08", feel: "straight" },
          { label: "1-2-3-5 cell", desc: "The cell on its own.", dur: "0:06", feel: "swung" },
          { label: "Sequenced", desc: "The cell climbing the scale over bass and drums.", dur: "0:16", feel: "swung" },
        ],
      },
      play: {
        prompt: "Choose a cell and sequence it up, then down. Notice how a tiny pattern fills a lot of space.",
        keys: ["C", "F", "B♭"],
        variations: ["1-2-3-5", "5-3-2-1", "Free"],
        backing: "Modal vamp in one key",
        tempoMin: 50,
        tempoMax: 180,
        tempoStart: 110,
        record: true,
      },
      apply: {
        tryAtHome: "Over a one-chord vamp, pick a single cell and sequence it through the whole scale, up and back.",
        context:
          "Coltrane built a huge share of his improvisations on digital {{patterns}} like these. Small cells, endless mileage.",
        prompt: "Record one cell sequenced up and down the {{pentatonic}}. Keep the rhythm steady and let the pattern speak.",
      },
    },

    // ── 06 ── CAPSTONE ─────────────────────────────────────────────────────
    {
      num: 6,
      slug: "short-blues-solo",
      kind: "capstone",
      title: "Putting It Together — Short Blues Solo",
      titleWord: "Together",
      difficulty: "Beginner",
      time: "15 min",
      goal: "Combine everything into one honest 12-bar solo.",
      summary:
        "Everything you've learned, in twelve bars. Build a short blues solo from the devices you now own — swing, the scale, chord tones, and a 7–3 or two.",
      see: {
        intro:
          "A blues is twelve bars in three four-bar phrases, built on just three chords: I, IV, and V. Learn the map and you always know where you are.",
        diagrams: ["bluesform"],
        points: [
          "Bars 1–4: the I chord — establish home.",
          "Bars 5–6: the IV — a fresh color, then back to I.",
          "Bars 9–10: the V (and IV) — the turnaround that sends you home.",
        ],
      },
      hear: {
        intro: "Hear a full short solo built only from the devices in this pathway — nothing you haven't already met.",
        clips: [
          { label: "Full short solo", desc: "One chorus, using only pathway devices.", dur: "0:30", feel: "swung" },
          { label: "Phrase by phrase", desc: "Each four-bar phrase isolated.", dur: "0:24", feel: "swung" },
          { label: "Backing only", desc: "The track with the solo removed — your turn.", dur: "0:30", feel: "swung" },
        ],
      },
      play: {
        prompt: "Loop any section — head, or a solo chorus — and layer in ideas from earlier modules. Build one phrase at a time.",
        keys: ["C", "F", "B♭"],
        variations: ["Full chorus", "Loop 1–4", "Loop turnaround"],
        backing: "12-bar blues — head + solo choruses, loopable",
        tempoMin: 50,
        tempoMax: 160,
        tempoStart: 100,
        record: true,
        sections: true,
      },
      apply: {
        tryAtHome: "Write a single four-bar phrase. Start on the root, use {{chord tones}}, and swing the rhythm. Then play it three times to fill a chorus.",
        context:
          "This is what every device was for. A great first solo isn't busy — it's clear, it swings, and it means something.",
        prompt: "Record one 12-bar chorus of your own. Start on the root, lean on {{chord tones}}, and make it {{swing}}.",
      },
    },
  ],
};
