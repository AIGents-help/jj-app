// lib/languageSignals.js
// Surfaces the words you keep reaching for, mined from your journal entries.
//
// Doctrine: "What I say outwardly, I am internalizing inwardly." The words were
// always there — this just makes you hear yourself. The Jeep Effect, turned inward.
//
// Resilient by design: it recursively scans EVERY string value inside each
// entry object, so it keeps working no matter which text fields you add later.

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','so','to','of','in','on','at','for','with','by',
  'is','am','are','was','were','be','been','being','do','does','did','done','have','has','had',
  'i','me','my','we','us','our','you','your','he','him','his','she','her','it','its','they','them','their',
  'this','that','these','those','here','there','what','which','who','whom','when','where','why','how',
  'not','no','yes','can','will','just','dont','cant','wont','im','ive','id','ill','youre','its',
  'as','from','up','out','off','too','very','can','get','got','one','also','than','more','some','any',
  'about','into','over','again','because','while','all','each','few','most','other','such','only','own',
]);

function collectStrings(value, bag) {
  if (typeof value === 'string') { bag.push(value); return; }
  if (Array.isArray(value)) { for (const v of value) collectStrings(v, bag); return; }
  if (value && typeof value === 'object') { for (const v of Object.values(value)) collectStrings(v, bag); }
}

// Pull every journey:entry:YYYY-MM-DD out of localStorage, oldest first.
export function readAllEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('journey:entry:')) continue;
    try {
      const date = key.slice('journey:entry:'.length);
      entries.push({ date, data: JSON.parse(localStorage.getItem(key)) });
    } catch { /* skip unparseable */ }
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

// Returns { ranked: [{ word, count, timeline: [[date, count], ...] }], totalEntries }
export function buildLanguageSignals({ minCount = 2, minLen = 3, limit = 40 } = {}) {
  const entries = readAllEntries();
  const counts = new Map();   // word -> total
  const byDate = new Map();   // word -> Map(date -> count)

  for (const { date, data } of entries) {
    const bag = [];
    collectStrings(data, bag);
    const words = bag.join(' ').toLowerCase().match(/[a-z][a-z'-]*[a-z]|[a-z]/g) || [];
    for (let w of words) {
      w = w.replace(/^['-]+|['-]+$/g, '');
      if (w.length < minLen || STOP_WORDS.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
      if (!byDate.has(w)) byDate.set(w, new Map());
      const dm = byDate.get(w);
      dm.set(date, (dm.get(date) || 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({
      word,
      count,
      timeline: [...(byDate.get(word) || new Map()).entries()].sort((a, b) => a[0].localeCompare(b[0])),
    }));

  return { ranked, totalEntries: entries.length };
}

// For the AI coach: a compact line you can append to the coach context, the same
// way buildPatternSignals() feeds Alignment/Activation breaks. Flags the top words
// you keep saying so the coach can mirror them back ("you wrote 'tired' 6 times").
export function languageSummaryForCoach({ top = 6 } = {}) {
  const { ranked, totalEntries } = buildLanguageSignals({ minCount: 2, limit: top });
  if (!ranked.length) return '';
  const list = ranked.map(r => `${r.word} (${r.count})`).join(', ');
  return `LANGUAGE SIGNAL — across ${totalEntries} entries the words reached for most: ${list}.`;
}
