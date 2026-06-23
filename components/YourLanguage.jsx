// components/YourLanguage.jsx
//
// Two layers:
//   1. AUTO — "What you keep saying": repeated words mined from your entries,
//      each with a sparkline so the pattern visibly evolves over time.
//      (The Jeep Effect, turned inward. The words were always there.)
//   2. MANUAL — "Words I'm conditioning": words you choose on purpose,
//      tagged Serves / Limits. ("Choose your words wisely.")
//
// Storage:
//   journey:language  ->  { tracked: [{ word, tag, addedAt }] }   // tag: 'serves' | 'limits'
//
// Depends on lib/languageSignals.js (buildLanguageSignals).

import { useState, useEffect, useMemo } from 'react';
import { buildLanguageSignals } from '../lib/languageSignals';

const NAVY="#16243C",NAVY2="#2A3B5C",PAPER="#FAF8F3",LINE="#C9D1DE",GRAY="#7A8190",RED="#C8281C";

const KEY = 'journey:language';

function loadTracked() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw).tracked || []) : [];
  } catch {
    return [];
  }
}

function saveTracked(tracked) {
  localStorage.setItem(KEY, JSON.stringify({ tracked }));
}

function Sparkline({ timeline }) {
  if (!timeline || timeline.length < 2) return null;
  const values = timeline.map(([, c]) => c);
  const max = Math.max(...values, 1);
  const w = 64, h = 16, step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} style={{opacity:.6,color:NAVY}} aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function YourLanguage() {
  const [tracked, setTracked] = useState([]);
  const [draft, setDraft] = useState('');
  const [draftTag, setDraftTag] = useState('serves');

  useEffect(() => { setTracked(loadTracked()); }, []);

  const { ranked, totalEntries } = useMemo(
    () => buildLanguageSignals({ minCount: 2, limit: 30 }),
    []
  );

  const add = () => {
    const word = draft.trim().toLowerCase();
    if (!word) return;
    if (tracked.some((t) => t.word === word)) { setDraft(''); return; }
    const next = [{ word, tag: draftTag, addedAt: new Date().toISOString() }, ...tracked];
    setTracked(next); saveTracked(next); setDraft('');
  };

  const remove = (word) => {
    const next = tracked.filter((t) => t.word !== word);
    setTracked(next); saveTracked(next);
  };

  const toggle = (word) => {
    const next = tracked.map((t) =>
      t.word === word ? { ...t, tag: t.tag === 'serves' ? 'limits' : 'serves' } : t
    );
    setTracked(next); saveTracked(next);
  };

  const labelStyle = {fontSize:10.5,fontWeight:800,letterSpacing:".08em",color:NAVY2,textTransform:"uppercase",marginBottom:4,display:"block"};
  const subStyle   = {fontSize:10.5,color:GRAY,marginBottom:10,lineHeight:1.5};
  const fieldStyle = {border:`1px solid ${LINE}`,borderRadius:2,fontSize:13.5,color:NAVY,background:"#fff",padding:"8px 12px",outline:"none"};

  return (
    <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
      <div>
        <div style={{fontSize:18,fontWeight:800,color:NAVY,letterSpacing:".04em"}}>Your Language</div>
        <div style={{marginTop:6,fontSize:12.5,color:GRAY,lineHeight:1.6}}>
          What you say outwardly, you internalize inwardly. These are the words you keep
          reaching for. Most people never hear themselves.
        </div>
      </div>

      {/* AUTO — mined from entries */}
      <div>
        <label style={labelStyle}>What you keep saying</label>
        <div style={subStyle}>The words were always there. You just started listening.</div>

        {ranked.length === 0 ? (
          <div style={{border:`1px dashed ${LINE}`,borderRadius:2,padding:"12px",fontSize:11.5,color:GRAY}}>
            Write a few days of entries and your patterns surface here.
          </div>
        ) : (
          <div style={{border:`1px solid ${LINE}`,borderRadius:2,background:"#fff"}}>
            {ranked.map(({ word, count, timeline }, i) => (
              <div key={word} className="flex items-center justify-between px-3 py-2"
                style={{borderTop:i>0?`1px solid ${LINE}`:"none"}}>
                <span style={{fontSize:13.5,color:NAVY}}>{word}</span>
                <span className="flex items-center gap-3" style={{color:GRAY}}>
                  <Sparkline timeline={timeline} />
                  <span style={{width:28,textAlign:"right",fontSize:11,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{count}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {totalEntries > 0 && (
          <div style={{marginTop:6,fontSize:10.5,color:GRAY}}>Across {totalEntries} entries.</div>
        )}
      </div>

      {/* MANUAL — words chosen on purpose */}
      <div>
        <label style={labelStyle}>Words I&rsquo;m conditioning</label>
        <div style={subStyle}>
          Choose your words wisely. Priming isn&rsquo;t optional — it&rsquo;s happening whether you
          direct it or not.
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            placeholder="A word you're choosing on purpose…"
            style={{...fieldStyle,flex:1}}
          />
          <button
            onClick={() => setDraftTag((t) => (t === 'serves' ? 'limits' : 'serves'))}
            style={{
              border:`1px solid ${draftTag==='serves'?'#1A6B3A':RED}`,
              borderRadius:2,padding:"8px 10px",fontSize:11,fontWeight:800,cursor:"pointer",
              background:draftTag==='serves'?'#E8F4EC':'#FAE8E8',
              color:draftTag==='serves'?'#1A6B3A':RED,
              letterSpacing:".06em",textTransform:"uppercase",
            }}
          >
            {draftTag === 'serves' ? 'Serves' : 'Limits'}
          </button>
          <button onClick={add}
            style={{...fieldStyle,background:NAVY,color:PAPER,fontWeight:800,fontSize:11,
              letterSpacing:".06em",textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap"}}>
            Add
          </button>
        </div>

        {tracked.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{marginTop:12}}>
            {tracked.map(({ word, tag }) => (
              <div
                key={word}
                className="flex items-center gap-1"
                style={{
                  borderRadius:2,padding:"4px 10px",fontSize:11,fontWeight:700,
                  border:`1px solid ${tag==='serves'?'#1A6B3A':RED}`,
                  background:tag==='serves'?'#E8F4EC':'#FAE8E8',
                  color:tag==='serves'?'#1A6B3A':RED,
                }}
              >
                <button onClick={() => toggle(word)} title="Toggle Serves / Limits"
                  style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"inherit",fontWeight:800,fontSize:11}}>
                  {word}
                </button>
                <button onClick={() => remove(word)} style={{background:"none",border:"none",cursor:"pointer",opacity:.5,color:"inherit",fontSize:13,lineHeight:1,padding:"0 0 0 2px"}} aria-label={`Remove ${word}`}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
