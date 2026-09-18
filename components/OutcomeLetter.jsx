import { useEffect, useState } from "react";

const NAVY="#16243C", NAVY2="#2A3B5C", PAPER="#FAF8F3", LINE="#C9D1DE", GRAY="#7A8190", AMBER="#C8830A";

export default function OutcomeLetter({value="",outcomes=[],onChange}){
  const[saved,setSaved]=useState(false);
  useEffect(()=>()=>{if(typeof window!=="undefined")window.speechSynthesis?.cancel();},[]);

  const readAloud=()=>{
    if(!value.trim()||typeof window==="undefined"||!("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(value);
    utterance.rate=.94;
    window.speechSynthesis.speak(utterance);
  };
  const save=()=>{onChange(value);setSaved(true);setTimeout(()=>setSaved(false),1400);};

  return <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
    <div>
      <div style={{fontSize:18,fontWeight:800,color:NAVY,letterSpacing:".04em"}}>The Outcome Letter</div>
      <div style={{marginTop:6,fontSize:12.5,color:GRAY,lineHeight:1.6}}>Write from the perspective of having achieved your three required outcomes. Describe what changed, what it feels like and who you became. Read it daily—not to wish, but to direct your awareness and conduct.</div>
    </div>
    <div style={{border:`1px solid ${LINE}`,background:"#fff",padding:12}}>
      <div style={{fontSize:9.5,fontWeight:900,letterSpacing:".1em",color:AMBER,marginBottom:8}}>THE OUTCOMES THIS LETTER SERVES</div>
      {outcomes.map((o,i)=><div key={i} style={{fontSize:12,color:o.title?NAVY:GRAY,marginTop:4}}>{i+1}. {o.title||"Outcome not yet defined"}</div>)}
    </div>
    <div>
      <label style={{fontSize:10.5,fontWeight:800,letterSpacing:".08em",color:NAVY2,textTransform:"uppercase",display:"block",marginBottom:5}}>Letter from the completed Journey</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={15} placeholder="Dear me—these three outcomes are now complete…" style={{width:"100%",border:`1px solid ${LINE}`,borderRadius:2,fontSize:13.5,color:NAVY,background:"#fff",padding:"10px 12px",outline:"none",boxSizing:"border-box",lineHeight:1.65}}/>
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <button onClick={save} style={{background:NAVY,color:PAPER,fontWeight:800,fontSize:11,letterSpacing:".08em",border:0,borderRadius:2,padding:"9px 16px",cursor:"pointer"}}>LOCK IT IN</button>
      <button onClick={readAloud} disabled={!value.trim()} style={{background:"#fff",color:NAVY,fontWeight:800,fontSize:11,letterSpacing:".06em",border:`1px solid ${AMBER}`,borderRadius:2,padding:"8px 14px",cursor:value.trim()?"pointer":"default",opacity:value.trim()?1:.45}}>🔊 RECITE MY LETTER</button>
      {saved&&<span style={{fontSize:11,color:GRAY}}>Saved.</span>}
    </div>
    <div style={{borderTop:`1px solid ${LINE}`,paddingTop:12,fontSize:11,fontStyle:"italic",color:GRAY}}>A farmer does not pray for crops. He prepares for them.</div>
  </main>;
}
