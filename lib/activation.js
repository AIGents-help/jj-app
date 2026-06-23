// lib/activation.js
// Scores a day, a week, and a month by Activation (completion), not participation
// (journaling). The A-A-A loop made visible: writing = Awareness/Alignment (earns
// no color); completing the committed Top 3 = Activation (earns the fill).
// "Getting it done gets it done." Only 100% of the Top 3 turns a day green.

// ── FIELD MAP ──────────────────────────────────────────────
// Confirmed from schema: todoTop3. Map the rest to your real entry shape here,
// in ONE place. isDone is the load-bearing accessor — it's the line between
// "wrote it" and "did it." Wire it to your real completion flag.
const FIELDS = {
  top3:        (e) => e?.todos ?? [],
  secondary:   (e) => e?.secondaryActivities ?? [],
  isCommitted: (item) => !!(typeof item === 'string' ? item.trim() : item?.text?.trim()),
  isDone:      (item) => (typeof item === 'object' ? !!item?.done : false),
  isJournaled: (e) => !!e,
};

const W_TOP3 = 3;   // committed outcomes — weighted heavier
const W_SEC  = 1;   // secondaries — bonus, can't pad a day to green

export const STATE = {
  FUTURE:    'future',
  INACTION:  'inaction',   // committed to nothing — the "live average" failure
  BREAK:     'break',      // committed, did 0% — the Activation Break
  PARTIAL:   'partial',
  ACTIVATED: 'activated',  // 100% — the only green
};

// ── DAY ────────────────────────────────────────────────────
export function computeDayActivation(entry, opts = {}) {
  if (opts.isFuture) {
    return { state: STATE.FUTURE, rate: null, journaled: !!entry,
             committed: 0, done: 0, committedWeight: 0, doneWeight: 0 };
  }
  const journaled = FIELDS.isJournaled(entry);
  const top3 = (FIELDS.top3(entry) || []).filter(FIELDS.isCommitted);
  const sec  = (FIELDS.secondary(entry) || []).filter(FIELDS.isCommitted);

  const committedWeight = top3.length * W_TOP3 + sec.length * W_SEC;
  if (committedWeight === 0) {
    return { state: STATE.INACTION, rate: null, journaled,
             committed: 0, done: 0, committedWeight: 0, doneWeight: 0 };
  }
  const top3Done = top3.filter(FIELDS.isDone).length;
  const secDone  = sec.filter(FIELDS.isDone).length;
  const doneWeight = top3Done * W_TOP3 + secDone * W_SEC;
  const rate = doneWeight / committedWeight;

  let state;
  if (rate >= 1)      state = STATE.ACTIVATED;
  else if (rate <= 0) state = STATE.BREAK;
  else                state = STATE.PARTIAL;

  return { state, rate, journaled,
           committed: top3.length + sec.length, done: top3Done + secDone,
           committedWeight, doneWeight };
}

// ── MONTH ──────────────────────────────────────────────────
// days: array of { entry, isFuture } for the month (any order)
export function computeMonthActivation(days) {
  let cw = 0, dw = 0;
  let activatedDays = 0, breakDays = 0, partialDays = 0, inactionDays = 0,
      journaledDays = 0, committedDays = 0;
  for (const d of days) {
    if (d.isFuture) continue;
    const r = computeDayActivation(d.entry, { isFuture: false });
    if (r.journaled) journaledDays++;
    if (r.state === STATE.INACTION) { inactionDays++; continue; }
    committedDays++;
    cw += r.committedWeight; dw += r.doneWeight;
    if (r.state === STATE.ACTIVATED) activatedDays++;
    else if (r.state === STATE.BREAK) breakDays++;
    else partialDays++;
  }
  return {
    rate: cw > 0 ? dw / cw : null,   // % of committed work actually closed
    committedDays, activatedDays, breakDays, partialDays, inactionDays, journaledDays,
  };
}

// ── TREND (week over week) ─────────────────────────────────
// chronoDays: chronological (oldest → newest) array of { entry, isFuture }
export function activationTrend(chronoDays, win = 7) {
  const past = chronoDays.filter((d) => !d.isFuture);
  const rateOf = (arr) => {
    let cw = 0, dw = 0;
    for (const d of arr) {
      const r = computeDayActivation(d.entry, { isFuture: false });
      cw += r.committedWeight; dw += r.doneWeight;
    }
    return cw > 0 ? dw / cw : null;
  };
  const recent = rateOf(past.slice(-win));
  const prior  = rateOf(past.slice(-win * 2, -win));
  const delta  = (recent != null && prior != null) ? recent - prior : null;
  return { recent, prior, delta };
}

// Consecutive fully-activated days ending today — fractal conduct, proven.
export function currentStreak(chronoDays) {
  const past = chronoDays.filter((d) => !d.isFuture);
  let n = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    const r = computeDayActivation(past[i].entry, { isFuture: false });
    if (r.state === STATE.ACTIVATED) n++; else break;
  }
  return n;
}

// ── STYLE HELPERS ──────────────────────────────────────────
export function activationStyle(result) {
  switch (result.state) {
    case STATE.ACTIVATED: return { bg: 'var(--color-background-success)',  fg: 'var(--color-text-success)'  };
    case STATE.PARTIAL:   return { bg: 'var(--color-background-warning)',  fg: 'var(--color-text-warning)'  };
    case STATE.BREAK:     return { bg: 'var(--color-background-danger)',   fg: 'var(--color-text-danger)'   };
    case STATE.INACTION:  return { bg: 'var(--color-background-tertiary)', fg: 'var(--color-text-tertiary)' };
    case STATE.FUTURE:    return { bg: 'transparent', fg: 'var(--color-text-tertiary)', dashed: true };
  }
}
export function activationPercent(result) {
  return result.rate == null ? null : Math.round(result.rate * 100);
}
