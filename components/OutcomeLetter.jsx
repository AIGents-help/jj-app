// components/OutcomeLetter.jsx
//
// Write from the version of you who already arrived — NOT to summon it, to recognize it.
// The felt-sense free-write sits above two reflection fields (the soil, the patterns)
// so the letter stays awareness-conditioning, never manifestation scripting.
//
// Storage: single evolving doc at journey:outcomeLetter
//   { targetDate, body, conditions, patterns, updatedAt }

import { useState, useEffect } from 'react';

const NAVY="#16243C",NAVY2="#2A3B5C",PAPER="#FAF8F3",LINE="#C9D1DE",GRAY="#7A8190";

const KEY = 'journey:outcomeLetter';
const EMPTY = { targetDate: '', body: '', conditions: '', patterns: '', updatedAt: null };

const labelStyle = {fontSize:10.5,fontWeight:800,letterSpacing:".08em",color:NAVY2,textTransform:"uppercase",marginBottom:4,display:"block"};
const fieldStyle = {width:"100%",border:`1px solid ${LINE}`,borderRadius:2,fontSize:13.5,color:NAVY,background:"#fff",padding:"8px 12px",outline:"none",boxSizing:"border-box"};
const subStyle  = {fontSize:10.5,color:GRAY,marginBottom:6,lineHeight:1.5};

export default function OutcomeLetter() {
  const [doc, setDoc] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDoc({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const update = (field) => (e) => setDoc((d) => ({ ...d, [field]: e.target.value }));

  const save = () => {
    const next = { ...doc, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(next));
    setDoc(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
      <div>
        <div style={{fontSize:18,fontWeight:800,color:NAVY,letterSpacing:".04em"}}>The Outcome Letter</div>
        <div style={{marginTop:6,fontSize:12.5,color:GRAY,lineHeight:1.6}}>
          Write from the version of you who already arrived. Not to summon it — to recognize it.
          Reality doesn&rsquo;t deliver. Reality reveals.
        </div>
      </div>

      <div>
        <label style={labelStyle}>Writing from</label>
        <input
          type="date"
          value={doc.targetDate}
          onChange={update('targetDate')}
          style={fieldStyle}
        />
        <div style={{...subStyle,marginBottom:0,marginTop:4}}>The day you&rsquo;re standing on, looking back.</div>
      </div>

      <div>
        <label style={labelStyle}>It&rsquo;s done</label>
        <div style={subStyle}>Tell yourself how it feels — the rooms, the mornings, the body. Be specific. Vague is blind.</div>
        <textarea
          value={doc.body}
          onChange={update('body')}
          rows={9}
          placeholder="Dear me —"
          style={{...fieldStyle,resize:"vertical",lineHeight:1.6}}
        />
      </div>

      <div>
        <label style={labelStyle}>The soil</label>
        <div style={subStyle}>What you prepared that made this inevitable.</div>
        <textarea
          value={doc.conditions}
          onChange={update('conditions')}
          rows={4}
          style={{...fieldStyle,resize:"vertical",lineHeight:1.6}}
        />
      </div>

      <div>
        <label style={labelStyle}>The patterns you kept</label>
        <div style={subStyle}>Every day, with no applause.</div>
        <textarea
          value={doc.patterns}
          onChange={update('patterns')}
          rows={4}
          style={{...fieldStyle,resize:"vertical",lineHeight:1.6}}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          style={{background:NAVY,color:PAPER,fontWeight:800,fontSize:11,letterSpacing:".08em",
            textTransform:"uppercase",border:"none",borderRadius:2,padding:"8px 16px",cursor:"pointer"}}
        >
          Lock it in
        </button>
        {saved && <span style={{fontSize:11,color:GRAY}}>Locked.</span>}
        {doc.updatedAt && !saved && (
          <span style={{fontSize:11,color:GRAY}}>
            Last revised {new Date(doc.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div style={{borderTop:`1px solid ${LINE}`,paddingTop:12,fontSize:11,fontStyle:"italic",color:GRAY}}>
        A farmer does not pray for crops. He prepares for them.
      </div>
    </main>
  );
}
