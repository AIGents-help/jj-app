# Reveal — App Build Brief (Phase 1)

**For:** Claude Code on Djinn → GitHub → Vercel
**Scope:** Rename + the Day-31 mechanic. **No backend.** Operates on existing localStorage only.
**Out of scope this phase:** paywall/entitlement gating, cloud sync, Resend, Stripe. Those wait for the Supabase phase.

> Claude Code: **read the actual source first.** File/variable names below are inferred from prior context — map them to the real code before editing. The *logic and end-state* are what's authoritative, not the names.

---

## PART A — Rename to Reveal

**Find/replace across the app (UI strings, metadata, branding):**

- "The 1 Month Journey" / "1 Month Journey" → **Reveal**
- Descriptive subtitle where a tagline appears → **The Awareness Journal**
- Brand line for hero/splash/empty states → **"Reality doesn't deliver. Reality reveals."**
- Wordmark: `REVEAL` (treat the middle "A" as the accent character if you carry the sales-page styling)

**Touch these (verify real paths):**
- `index.html` `<title>` + meta description
- `manifest.json` / PWA manifest: `name`, `short_name` ("Reveal"), theme color → `#15171A`, accent `#D9962B`
- Any splash/onboarding/header component rendering the old name
- DashNav / top-of-app wordmark

**Do NOT rename** localStorage keys (`journey:*`) in this pass — keep data continuity. Brand is display-layer only here.

---

## PART B — The Day-31 Mechanic

Three sequential screens, fired when a month completes. All read/write localStorage.

### Trigger
When the active day rolls past Day 31 of the current `journey:month` (or user taps a "Complete the month" affordance that appears on Day 31), enter the Reveal flow instead of advancing silently.

### Screen 1 — The Reveal (read-only)
A graduation screen. Render the existing pattern data — **no new tracking required:**
- Completion rate for the month
- Alignment breaks and Activation breaks from `buildPatternSignals()`
- What got noticed vs. what was set (Top-3 outcomes hit/missed)

Copy register (Tony voice): heading **"The Reveal"**, lede *"This is what default living kept hidden."* One primary action → **Continue to the Reckoning**.

### Screen 2 — The Reckoning (the conscious choice)
Enumerate every **open** item from the month: `todoTop3` plus any secondary/unfinished entries still active.

For each item, two explicit actions — **no defaults, no batch auto-anything:**
- **Carry** → marked to survive into next month
- **Release** ("Refuze") → marked to archive, not active

Rules (these are the moat — enforce them):
- Nothing auto-rolls forward (that's the to-do graveyard).
- Nothing is hard-deleted (data loss + no awareness applied).
- User must act on each item (or an explicit "Release all remaining" they tap on purpose).

### Screen 3 — The Reset
On confirm:
1. Increment `journey:month` (N → N+1).
2. Write **only Carried items** into Day 1 of the new month's active state.
3. Archive everything else — Released items **and** the completed month's entries — into a history key, e.g. `journey:archive:month:N`. (Archive, don't delete — feeds a future "past Reveals" view.)
4. Snapshot the Reveal summary to `journey:reveal:month:N` for history.
5. Land the user on **Day 1**, clean container. Copy: *"Everyday is Day 1."*

---

## PART C — Proof of Pass (Playwright, Djinn)

"Proof of pass" = verified assertion of actual end state, not absence of error. Assert:

1. **Rename:** document title and visible wordmark read "Reveal"; no "1 Month Journey" string remains in rendered DOM.
2. **Reveal screen:** with seeded month data, the Reveal renders the completion rate and at least one Alignment/Activation break from `buildPatternSignals()`.
3. **Reckoning — Carry:** seed an open Top-3 item, choose Carry, run Reset → assert that exact item is present and active on Day 1 of month N+1.
4. **Reckoning — Release:** seed a second open item, choose Release, run Reset → assert it is **absent** from active Day-1 state **and present** in `journey:archive:month:N`.
5. **Reset integrity:** assert `journey:month` incremented by exactly 1; assert `journey:reveal:month:N` snapshot exists; assert prior month's entries moved to archive, not active.
6. **No data loss:** total item count before = (carried active) + (archived). Nothing vanished.

---

## Guardrails (your hard-won lessons — don't relearn them)

- **One file per commit.** No multi-file batches.
- **Never use the GitHub web editor for `.tsx`/`.jsx`** — it corrupts JSX. Use the GitHub upload page with the DataTransfer injection method.
- Every Claude Code `!` command resets shell cwd to the launch dir — **prefix every command with the project path.**
- **No secrets in chat.** Dashboard-to-file only; rotate if exposed. (N/A this phase — no new secrets — but holds.)
- Brand colors for any app styling carried from the sales page: ink `#15171A`, paper `#E8E9EB`, amber `#D9962B`, amber-deep `#B5781A`.

---

## Build order
1. **Part A (rename)** first — lowest risk, instant win, easy to verify.
2. **Part B Screen 1 (Reveal)** — read-only, reuses existing data, can't corrupt state.
3. **Part B Screens 2–3 (Reckoning + Reset)** — the only state-mutating part; gate behind the full proof-of-pass suite before it touches main.
