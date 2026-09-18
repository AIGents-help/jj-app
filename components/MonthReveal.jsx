import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   MonthReveal — the Journey-completion reflection powered by REVEAL intelligence.
   Replaces the bare "START NEW MONTH" wipe with: Reveal → Reckoning → Reset.

   Reveal:    shows what the month surfaced (from journey:month + entries).
   Reckoning: each of the 3 Outcomes is consciously Carried or Refuzed.
              Nothing auto-rolls. Nothing is hard-deleted — released
              outcomes and the closed month are archived, not erased.
   Reset:     fresh container. Carried outcomes survive into Day 1.

   Additive. Self-contained. Reads/writes the same journey:* keys App.jsx
   uses, plus two new archive keys.
   ════════════════════════════════════════════════════════════════════ */

const NAVY="#16243C",NAVY2="#2A3B5C",PAPER="#FAF8F3",LINE="#C9D1DE",RED="#C8281C",GRAY="#7A8190",COAL="#0D1520",AMBER="#C8830A";

const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
async function sget(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}}
async function sset(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){console.error(e);return false;}}
async function sremove(k){try{localStorage.removeItem(k);}catch(e){console.error(e);}}
const blankOutcome=()=>({title:"",why:"",tasks:"",resourcesHave:"",resourcesNeed:"",people:""});

function Stat({label,value,suffix,accent}){
  return (
    <div style={{background:"#fff",border:`1px solid ${LINE}`,borderRadius:3,padding:"14px 12px",textAlign:"center"}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:28,lineHeight:1,color:accent||NAVY}}>
        {value}{suffix&&<span style={{fontSize:14,color:GRAY,marginLeft:1}}>{suffix}</span>}
      </div>
      <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:GRAY,marginTop:6}}>{label}</div>
    </div>
  );
}

export default function MonthReveal({dayN=1,duration=30,monthMap={},outcomes,onClose,onComplete}){
  const [step,setStep]=useState("reveal");          // "reveal" | "reckoning"
  const [monthNum,setMonthNum]=useState(1);
  const [decisions,setDecisions]=useState({});      // outcomeIndex -> "carry" | "release"
  const [working,setWorking]=useState(false);

  useEffect(()=>{(async()=>{const n=await sget("journey:monthNum");setMonthNum(n||1);})();},[]);

  // ── Reveal stats (derived from existing data — no new tracking) ──
  const days=Object.values(monthMap||{});
  const logged=days.length;
  const complete=days.filter(d=>d&&d.complete).length;
  const rate=dayN>0?Math.round(complete/dayN*100):0;
  const scores=days.map(d=>d&&d.dayScore).filter(Boolean);
  const avgScore=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10:null;
  const rates=days.map(d=>d&&d.rate).filter(Boolean);
  const efforts=days.map(d=>d&&d.effortRate).filter(Boolean);
  const avgRate=rates.length?Math.round(rates.reduce((a,b)=>a+b,0)/rates.length*10)/10:null;
  const avgEffort=efforts.length?Math.round(efforts.reduce((a,b)=>a+b,0)/efforts.length*10)/10:null;

  const liveOutcomes=(outcomes?.required||[]).map((o,i)=>({...o,_i:i})).filter(o=>o.title&&o.title.trim());
  const setD=(i,v)=>setDecisions(p=>({...p,[i]:v}));
  const carriedCount=liveOutcomes.filter(o=>decisions[o._i]==="carry").length;
  const allDecided=liveOutcomes.every(o=>decisions[o._i]);
  const releaseRemaining=()=>setDecisions(p=>{const n={...p};liveOutcomes.forEach(o=>{if(!n[o._i])n[o._i]="release";});return n;});

  async function finish(){
    if(working)return;
    setWorking(true);
    const prevNum=monthNum, nextNum=prevNum+1;

    // Archive the closed month + a reveal snapshot (archive, never delete)
    const entries={};
    const currentMeta=await sget("journey:meta");
    if(currentMeta?.start){
      for(let i=0;i<duration;i++){
        const date=new Date(`${currentMeta.start}T12:00:00`);date.setDate(date.getDate()+i);
        const key=date.toISOString().slice(0,10),value=await sget(`journey:entry:${key}`);
        if(value)entries[key]=value;
      }
    }
    const archiveSaved=await sset(`journey:archive:month:${prevNum}`,{duration,monthMap,entries,outcomes,stats:{logged,complete,rate,avgScore,avgRate,avgEffort},ts:Date.now()});
    if(!archiveSaved){setWorking(false);alert("This Journey could not be archived. Nothing was reset. Free device storage and try again.");return;}
    await sset(`journey:reveal:month:${prevNum}`,{rate,complete,logged,avgScore,avgRate,avgEffort,ts:Date.now()});
    for(const key of Object.keys(entries))await sremove(`journey:entry:${key}`);

    // Carry the chosen outcomes; blank the released slots
    const carried=(outcomes?.required||[]).map((o,i)=>{
      if(!o.title||!o.title.trim())return blankOutcome();
      return decisions[i]==="carry"?{...o}:blankOutcome();
    });
    const newOutcomes={required:carried,letter:outcomes?.letter||"",mode:"main",needs:outcomes?.needs||{}};
    const newMeta={start:todayKey(),duration};

    await sset("journey:meta",newMeta);
    await sset("journey:month",{});
    await sset("journey:outcomes",newOutcomes);
    await sset("journey:monthNum",nextNum);

    onComplete&&onComplete(newMeta,newOutcomes,nextNum);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:60,overflowY:"auto"}}
      onClick={e=>{e.target===e.currentTarget&&!working&&onClose&&onClose();}}>
      <div style={{background:PAPER,maxWidth:500,margin:"20px auto",borderRadius:4,overflow:"hidden"}}>

        {/* Header */}
        <div style={{background:NAVY,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#8FA0BC",fontSize:9.5,letterSpacing:".2em"}}>JOURNEY {monthNum} · DAY {dayN}/{duration}</div>
            <div style={{color:PAPER,fontFamily:"Georgia,serif",fontWeight:800,fontSize:20}}>
              {step==="reveal"?"The Reveal":"The Reckoning"}
            </div>
          </div>
          {!working&&<button onClick={onClose} style={{color:"#8FA0BC",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>}
        </div>

        {/* ── STEP 1: THE REVEAL ── */}
        {step==="reveal"&&(
          <div style={{padding:20}}>
            <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:15,color:NAVY2,marginBottom:16}}>
              This is what default living kept hidden.
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Stat label="Completion" value={rate} suffix="%" accent={rate>=70?AMBER:NAVY}/>
              <Stat label="Days closed" value={complete} suffix={`/${dayN}`}/>
              <Stat label="Avg language" value={avgScore??"—"} suffix={avgScore?"/10":""} accent={avgScore&&avgScore>=7?AMBER:avgScore&&avgScore<5?RED:NAVY}/>
              <Stat label="Logged" value={logged} suffix={`/${dayN}`}/>
            </div>

            {avgRate!=null&&avgEffort!=null&&(
              <div style={{background:COAL,borderLeft:`3px solid ${AMBER}`,borderRadius:3,padding:"12px 14px",marginTop:14}}>
                <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em",marginBottom:4}}>THE 50/50, OVER A MONTH</div>
                <div style={{color:"#D4DDE8",fontSize:13,lineHeight:1.55}}>
                  Outcome averaged <b style={{color:PAPER}}>{avgRate}</b> · effort averaged <b style={{color:PAPER}}>{avgEffort}</b>.{" "}
                  {avgEffort>=avgRate+1?"You brought more than the days gave back. The math catches up."
                    :avgRate>=avgEffort+1?"The days rated higher than what you brought. Where was the gap?"
                    :"Effort and outcome tracked together. Steady."}
                </div>
              </div>
            )}

            <div style={{fontFamily:"Georgia,serif",fontSize:13.5,color:NAVY2,marginTop:16,lineHeight:1.6}}>
              The patterns were always there. This Journey didn't deliver them—it revealed them.
            </div>

            <button onClick={()=>setStep("reckoning")}
              style={{width:"100%",marginTop:18,padding:"13px 0",background:NAVY,color:AMBER,fontWeight:800,fontSize:12,letterSpacing:".1em",border:"none",borderRadius:2,cursor:"pointer"}}>
              CONTINUE TO THE RECKONING →
            </button>
          </div>
        )}

        {/* ── STEP 2: THE RECKONING ── */}
        {step==="reckoning"&&(
          <div style={{padding:20}}>
            <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:15,color:NAVY2,marginBottom:6}}>
              Carry what serves you. Refuze what doesn't.
            </div>
            <div style={{fontSize:11.5,color:GRAY,marginBottom:16}}>
              Each outcome is a decision—on purpose. Nothing rolls into the next Journey in the dark.
            </div>

            {liveOutcomes.length===0?(
              <div style={{border:`1px dashed ${LINE}`,borderRadius:3,padding:"18px 16px",textAlign:"center",color:GRAY,fontSize:13}}>
                No outcomes were set for this Journey. Nothing to carry—the next Journey starts clean.
              </div>
            ):liveOutcomes.map(o=>{
              const d=decisions[o._i];
              return (
                <div key={o._i} style={{border:`1.5px solid ${d==="carry"?NAVY:d==="release"?LINE:LINE}`,borderRadius:3,padding:"12px 14px",marginBottom:10,background:"#fff",opacity:d==="release"?.6:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:NAVY,marginBottom:2,textDecoration:d==="release"?"line-through":"none"}}>{o.title}</div>
                  {o.why&&<div style={{fontSize:11,color:GRAY,marginBottom:10}}>{o.why}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setD(o._i,"carry")}
                      style={{flex:1,padding:"8px 0",borderRadius:2,fontWeight:800,fontSize:11,letterSpacing:".06em",cursor:"pointer",
                        border:`1.5px solid ${NAVY}`,background:d==="carry"?NAVY:"transparent",color:d==="carry"?PAPER:NAVY}}>
                      CARRY →
                    </button>
                    <button onClick={()=>setD(o._i,"release")}
                      style={{flex:1,padding:"8px 0",borderRadius:2,fontWeight:800,fontSize:11,letterSpacing:".06em",cursor:"pointer",
                        border:`1.5px solid ${RED}`,background:d==="release"?RED:"transparent",color:d==="release"?"#fff":RED}}>
                      REFUZE
                    </button>
                  </div>
                </div>
              );
            })}

            {liveOutcomes.length>0&&!allDecided&&(
              <button onClick={releaseRemaining}
                style={{display:"block",margin:"4px auto 14px",background:"none",border:"none",color:GRAY,fontSize:11,fontWeight:700,letterSpacing:".05em",cursor:"pointer",textDecoration:"underline"}}>
                Refuze all remaining
              </button>
            )}

            <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}>
              <button onClick={()=>setStep("reveal")} disabled={working}
                style={{padding:"13px 16px",background:"transparent",border:`1.5px solid ${LINE}`,borderRadius:2,color:GRAY,fontWeight:800,fontSize:11,letterSpacing:".06em",cursor:working?"default":"pointer"}}>
                ← BACK
              </button>
              <button onClick={finish} disabled={!allDecided||working}
                style={{flex:1,padding:"13px 0",border:"none",borderRadius:2,fontWeight:800,fontSize:12,letterSpacing:".1em",
                  background:allDecided&&!working?NAVY:"#B9C2CF",color:allDecided&&!working?AMBER:"#fff",cursor:allDecided&&!working?"pointer":"default"}}>
                {working?"RESETTING…":liveOutcomes.length?`RESET TO DAY 1 — CARRY ${carriedCount} →`:"RESET TO DAY 1 →"}
              </button>
            </div>

            <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",color:NAVY2,fontSize:13,textAlign:"center",marginTop:16}}>
              {"“"}Everyday is Day 1.{"”"} — Tony Kates
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
