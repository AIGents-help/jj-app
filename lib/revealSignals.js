// revealSignals.js
// Deterministic awareness-detection layer for The 1 Month Journey.
// Reads localStorage entries and computes "signals" — facts about the user's
// own behavior they can't see from a single day. These are the raw material
// the Reveal card renders instantly (no AI) and the api feeds the coach.
//
// Doctrine spine: "Reality doesn't deliver. Reality reveals."
// Each signal kind maps to a framework: activation-break, alignment-break,
// jeep, conducive-streak, fractal, proof-of-possibility.
//
// ── RECONCILE THIS FIRST ──────────────────────────────────────────────
// I built this from the documented entry schema, not the live entry object.
// The ENTRY_ADAPTER below is the ONE place field-name assumptions live.
// Open one real `journey:entry:YYYY-MM-DD` value, check the keys, and fix
// the adapter. Everything downstream reads through it, so this is the only
// edit needed to align with your actual shape.
// ──────────────────────────────────────────────────────────────────────

const KEY_PREFIX = "journey:entry:";

// Map your real entry fields -> the names this module uses.
// Left side = what the code expects. Right side = how to pull it from a raw entry.
const ENTRY_ADAPTER = {
  // The day's Top 3. Expected: array of { text, done }.
  top3: (e) =>
    normalizeItems(e.todos ?? []),

  // Evening's "Tomorrow's 3" — proof the next day was planned (soil prepared).
  tomorrowTop3: (e) =>
    normalizeItems(e.tomorrowTodos ?? null),

  // "Name It" word picker — single word object { word, score }. Wrap as array.
  nameIt: (e) =>
    (e.morningWordObj?.word ? [e.morningWordObj.word] : []),

  // Secondary activities below the Top 3. Each item is { id, text, done }.
  secondary: (e) =>
    toStringArray(e.secondaryActivities ?? []),

  // Free reflection — join all text fields so the Jeep detector has full signal.
  notes: (e) =>
    [e.wakingThoughts, e.reflect, e.corrections, e.ahHah, e.jeepEffect].filter(Boolean).join(" ").trim(),

  // Deep sleep percentage. Expected: number 0..100.
  deepSleepPct: (e) => numOrNull(e.deepSleepPct ?? e.deepSleep ?? null),

  // Morning wake time "HH:MM". Used only for the fractal sleep/outcome signal.
  wakeTime: (e) => (typeof e.wakeTime === "string" ? e.wakeTime : null),
};

// ── public API ────────────────────────────────────────────────────────

// Compute every signal we can from the last `windowDays` of entries.
// Returns { signals: [...], digest: {...} }.
//  - signals: ranked, doctrine-named facts for the card + the coach
//  - digest:  compact summary safe to send to the AI layer (no raw notes)
export function computeSignals({ windowDays = 31, today = new Date() } = {}) {
  const entries = loadEntries(windowDays, today);
  if (entries.length === 0) {
    return { signals: [], digest: emptyDigest() };
  }

  const signals = [
    detectActivationBreak(entries),
    detectAlignmentBreak(entries),
    detectJeep(entries),
    detectConduciveStreak(entries),
    detectFractalSleep(entries),
    detectProofMaterial(entries),
  ].filter(Boolean);

  // Rank: higher severity first, then more evidence behind it.
  signals.sort((a, b) => b.severity - a.severity || b.weight - a.weight);

  return { signals, digest: buildDigest(entries, signals) };
}

// Back-compat shim. If buildPatternSignals() already lives in your coach
// pipeline, replace its body with this so there's one source of truth and
// the evening-loop disrupts and the Reveal card never disagree.
export function buildPatternSignals(opts) {
  const { signals } = computeSignals(opts);
  return signals.filter((s) => s.kind === "activation-break" || s.kind === "alignment-break");
}

// ── detectors ───────────────────────────────────────────────────────────

// ACTIVATION BREAK — set it, walked past it. (A in A-A-A failed at Activation.)
function detectActivationBreak(entries) {
  const misses = [];
  for (const e of entries) {
    for (const item of e.top3) {
      if (item.text && item.done === false) misses.push({ date: e.date, text: item.text });
    }
  }
  if (misses.length < 2) return null;
  // Repeat offenders are the sharpest — same item set and skipped more than once.
  const byText = groupBy(misses, (m) => m.text.toLowerCase());
  const repeats = Object.entries(byText)
    .filter(([, arr]) => arr.length >= 2)
    .map(([, arr]) => arr[0].text);
  return {
    kind: "activation-break",
    severity: repeats.length ? 3 : 2,
    weight: misses.length,
    facts: { count: misses.length, repeats, sample: misses.slice(-3) },
  };
}

// ALIGNMENT BREAK — started the day with no direction set the night before.
// (A in A-A-A failed at Alignment.) Inferred two ways depending on your schema.
function detectAlignmentBreak(entries) {
  let unplanned = 0;
  const dates = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const prev = entries[i - 1];
    const plannedExplicitly = prev && prev.tomorrowTop3 && prev.tomorrowTop3.length > 0;
    const startedWithDirection = e.top3.length > 0;
    // If we can see explicit evening planning, trust it. Otherwise treat an
    // empty Top-3 on a day with activity elsewhere as a started-blind day.
    const blind = prev
      ? !plannedExplicitly && !startedWithDirection
      : false;
    if (blind && hasActivity(e)) {
      unplanned++;
      dates.push(e.date);
    }
  }
  if (unplanned < 2) return null;
  return {
    kind: "alignment-break",
    severity: 2,
    weight: unplanned,
    facts: { count: unplanned, dates: dates.slice(-3) },
  };
}

// THE JEEP — something that keeps showing up and never gets moved on.
// The flagship reveal. A token recurring across entries (Name It / secondary /
// notes) that never converts into a COMPLETED Top-3 item.
function detectJeep(entries) {
  const mentions = {};
  const completedTokens = new Set();

  for (const e of entries) {
    for (const t of tokensOf(e)) {
      mentions[t] = mentions[t] || { count: 0, dates: [] };
      mentions[t].count++;
      mentions[t].dates.push(e.date);
    }
    for (const item of e.top3) {
      if (item.done) tokensFromText(item.text).forEach((t) => completedTokens.add(t));
    }
  }

  const candidates = Object.entries(mentions)
    .filter(([t, m]) => m.count >= 3 && !completedTokens.has(t) && !STOPWORDS.has(t))
    .sort((a, b) => b[1].count - a[1].count);

  if (candidates.length === 0) return null;
  const [token, m] = candidates[0];
  return {
    kind: "jeep",
    severity: 3,
    weight: m.count,
    facts: { token, count: m.count, dates: m.dates.slice(-4) },
  };
}

// CONDUCIVE STREAK — consecutive days the soil was prepared (tomorrow set
// before tomorrow arrived). Positive signal; reinforces the Conducive Principle.
function detectConduciveStreak(entries) {
  let best = 0;
  let run = 0;
  for (const e of entries) {
    const prepared = (e.tomorrowTop3 && e.tomorrowTop3.length > 0) || e.top3.length >= 1;
    run = prepared ? run + 1 : 0;
    best = Math.max(best, run);
  }
  if (best < 3) return null;
  return {
    kind: "conducive-streak",
    severity: 1,
    weight: best,
    facts: { streak: best, current: run },
  };
}

// FRACTAL — small condition predicts the outcome. Completion rate on
// best-slept days vs worst-slept days. "How you do small things..."
function detectFractalSleep(entries) {
  const withSleep = entries.filter((e) => e.deepSleepPct != null && e.top3.length > 0);
  if (withSleep.length < 6) return null;
  const sorted = [...withSleep].sort((a, b) => b.deepSleepPct - a.deepSleepPct);
  const half = Math.floor(sorted.length / 2);
  const topRate = completionRate(sorted.slice(0, half));
  const botRate = completionRate(sorted.slice(-half));
  const delta = topRate - botRate;
  if (delta < 0.2) return null; // need a meaningful gap to call it a pattern
  return {
    kind: "fractal",
    severity: 2,
    weight: Math.round(delta * 100),
    facts: {
      bestDaysRate: round2(topRate),
      worstDaysRate: round2(botRate),
      deltaPct: Math.round(delta * 100),
    },
  };
}

// PROOF MATERIAL — raw material for a Proof-of-Possibility callback.
// Deterministic part: collect early doubt-words + total completions + the
// best day. The coach assembles the "you said impossible on Day 4 / here's
// Day 19" callback, which needs semantic matching the client can't do well.
function detectProofMaterial(entries) {
  const doubt = [];
  let completed = 0;
  let bestDay = null;
  let bestDone = -1;
  entries.forEach((e, i) => {
    const done = e.top3.filter((t) => t.done).length;
    completed += done;
    if (done > bestDone) { bestDone = done; bestDay = { date: e.date, dayIndex: i + 1, done }; }
    if (i < entries.length / 2) {
      for (const w of e.nameIt) if (DOUBT_WORDS.has(w.toLowerCase())) doubt.push({ date: e.date, dayIndex: i + 1, word: w });
    }
  });
  if (doubt.length === 0 || completed < 3) return null;
  return {
    kind: "proof-of-possibility",
    severity: 2,
    weight: completed,
    facts: { earlyDoubt: doubt.slice(0, 3), totalCompleted: completed, bestDay },
  };
}

// ── digest (what's safe to send to the AI) ──────────────────────────────
// Send signals + thin counts. Do NOT ship raw notes/reflections off-device
// beyond the tokens already surfaced — keeps the privacy surface small.
function buildDigest(entries, signals) {
  return {
    daysLogged: entries.length,
    span: { first: entries[0]?.date, last: entries[entries.length - 1]?.date },
    completion: round2(completionRate(entries)),
    signalKinds: signals.map((s) => s.kind),
    signals: signals.map((s) => ({ kind: s.kind, facts: s.facts })),
  };
}

function emptyDigest() {
  return { daysLogged: 0, span: {}, completion: 0, signalKinds: [], signals: [] };
}

// ── loading + helpers ───────────────────────────────────────────────────

function loadEntries(windowDays, today) {
  if (typeof localStorage === "undefined") return [];
  const out = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = ymd(d);
    const raw = localStorage.getItem(KEY_PREFIX + date);
    if (!raw) continue;
    let parsed;
    try { parsed = JSON.parse(raw); } catch { continue; }
    out.push(adapt(parsed, date));
  }
  return out; // chronological, oldest -> newest
}

function adapt(raw, date) {
  return {
    date,
    top3: ENTRY_ADAPTER.top3(raw),
    tomorrowTop3: ENTRY_ADAPTER.tomorrowTop3(raw),
    nameIt: ENTRY_ADAPTER.nameIt(raw),
    secondary: ENTRY_ADAPTER.secondary(raw),
    notes: ENTRY_ADAPTER.notes(raw),
    deepSleepPct: ENTRY_ADAPTER.deepSleepPct(raw),
    wakeTime: ENTRY_ADAPTER.wakeTime(raw),
  };
}

function tokensOf(e) {
  const bag = [
    ...e.nameIt,
    ...e.secondary,
    ...tokensFromText(e.notes),
  ];
  return uniq(bag.map((s) => String(s).toLowerCase().trim()).filter((s) => s.length > 2));
}
function tokensFromText(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}
function hasActivity(e) {
  return e.top3.length > 0 || e.secondary.length > 0 || e.nameIt.length > 0 || e.notes.length > 0;
}
function completionRate(entries) {
  let total = 0, done = 0;
  for (const e of entries) for (const t of e.top3) { total++; if (t.done) done++; }
  return total ? done / total : 0;
}

function normalizeItems(v) {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((it) =>
        typeof it === "string"
          ? { text: it, done: false }
          : { text: String(it.text ?? it.label ?? "").trim(), done: !!(it.done ?? it.complete ?? it.checked) }
      )
      .filter((it) => it.text);
  }
  return [];
}
function toStringArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : x?.text ?? "")).filter(Boolean);
  if (typeof v === "string") return v.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  return [];
}
function numOrNull(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function groupBy(arr, fn) { return arr.reduce((a, x) => { const k = fn(x); (a[k] = a[k] || []).push(x); return a; }, {}); }
function uniq(a) { return [...new Set(a)]; }
function round2(n) { return Math.round(n * 100) / 100; }
function ymd(d) { return d.toISOString().slice(0, 10); }

const STOPWORDS = new Set([
  "this","that","with","from","have","will","just","they","them","then","than",
  "your","yours","about","into","over","some","more","most","very","what","when",
  "today","tomorrow","really","being","there","their","because","could","would",
  "should","still","again","much","many","like","want","need","done","didnt","didn",
]);
const DOUBT_WORDS = new Set([
  "stuck","impossible","cant","can't","overwhelmed","afraid","scared","doubt",
  "lost","blocked","stalled","hopeless","exhausted","drained","defeated","anxious",
]);
