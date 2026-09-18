import { useEffect, useMemo, useState } from "react";

const NAVY="#16243C", PAPER="#FAF8F3", LINE="#C9D1DE", RED="#C8281C", GRAY="#7A8190", COAL="#0D1520", AMBER="#C8830A";

function speak(text){
  if(typeof window==="undefined"||!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text.replace(/→/g,""));
  utterance.rate=.96;
  window.speechSynthesis.speak(utterance);
}

export default function JourneyGuide({phase,entry,outcomes,onPatch,onTodoPatch,onOpenLetter}){
  const[open,setOpen]=useState(false);
  const[step,setStep]=useState(0);
  const activeTodos=useMemo(()=>(entry.todos??[]).map((todo,index)=>({...todo,index})).filter(todo=>todo.text?.trim()),[entry.todos]);
  const outcomeNames=outcomes.required.map(o=>o.title).filter(Boolean);

  const morningSteps=[
    {title:"Capture before influence",prompt:"What was already on your mind when you woke up? Capture it before anything else shapes the answer."},
    {title:"Name your state",prompt:"Choose one honest word and rate your waking state. We need the truth before we choose the direction."},
    {title:"Remember where you are going",prompt:outcomeNames.length?`Your required outcomes are: ${outcomeNames.join(". ")}. Do today's objectives move these forward?`:"Your Journey has no required outcomes yet. Set the three results that must be different when this Journey ends."},
    {title:"Equip the objectives",prompt:"Review each daily objective. Name the outcome it advances and the people, information, tools, money or materials it requires."},
    {title:"Commit",prompt:"What will be different before today ends? Commit to the three objectives, then act."},
  ];
  const eveningSteps=activeTodos.length?activeTodos.map(todo=>({
    title:`Verify objective ${todo.index+1}`,
    prompt:`You committed to: ${todo.text}. Is it complete? Record evidence if it is. If it is not, state what actually happened.`,
    todo,
  })):[{title:"No objectives were set",prompt:"You cannot verify a commitment that was never made. What prevented you from directing the day?"}];
  const steps=phase==="morning"?morningSteps:[...eveningSteps,{title:"Close the loop",prompt:"Extract the lesson, solve the obstacle, record gratitude and prepare tomorrow before you close today."}];
  const current=steps[Math.min(step,steps.length-1)];

  useEffect(()=>{setStep(0);setOpen(false);},[phase]);

  const start=()=>{setOpen(true);setStep(0);speak(steps[0].prompt);};
  const next=()=>{
    const nextStep=Math.min(step+1,steps.length-1);
    setStep(nextStep);speak(steps[nextStep].prompt);
  };
  const back=()=>{const nextStep=Math.max(0,step-1);setStep(nextStep);speak(steps[nextStep].prompt);};

  return <section style={{border:`2px solid ${NAVY}`,borderRadius:4,overflow:"hidden",marginBottom:18,background:"#fff"}}>
    <div style={{background:COAL,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
      <div>
        <div style={{color:AMBER,fontSize:9.5,fontWeight:900,letterSpacing:".14em"}}>JOURNEY GUIDE · {phase==="morning"?"MORNING DIRECTION":"EVENING RECKONING"}</div>
        <div style={{color:PAPER,fontFamily:"Georgia,serif",fontSize:14,marginTop:3}}>{phase==="morning"?"Decide before the day decides for you.":"What was completed—and what was merely explained?"}</div>
      </div>
      <button onClick={open?()=>setOpen(false):start} style={{background:AMBER,color:COAL,border:0,borderRadius:2,padding:"9px 12px",fontWeight:900,fontSize:10,letterSpacing:".08em",whiteSpace:"nowrap",cursor:"pointer"}}>{open?"CLOSE":"START →"}</button>
    </div>
    {open&&<div style={{padding:14}}>
      <div style={{fontSize:9.5,fontWeight:900,letterSpacing:".1em",color:RED,textTransform:"uppercase"}}>Step {step+1} of {steps.length} · {current.title}</div>
      <p style={{fontFamily:"Georgia,serif",fontSize:16,lineHeight:1.55,color:NAVY,margin:"8px 0 12px"}}>{current.prompt}</p>
      <button onClick={()=>speak(current.prompt)} style={{border:`1px solid ${LINE}`,background:"#fff",color:NAVY,padding:"6px 10px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🔊 READ ALOUD</button>

      {phase==="morning"&&step===0&&<textarea value={entry.wakingThoughts} onChange={e=>onPatch({wakingThoughts:e.target.value})} rows={3} placeholder="Speak with the microphone below or write what was already there…" style={{display:"block",width:"100%",marginTop:12,border:`1px solid ${LINE}`,padding:10,fontSize:13,color:NAVY}}/>}
      {phase==="morning"&&step===2&&outcomes.letter&&<button onClick={onOpenLetter} style={{display:"block",marginTop:10,border:`1px solid ${AMBER}`,background:"#FFF9EA",color:NAVY,padding:"8px 12px",fontSize:10,fontWeight:900,cursor:"pointer"}}>OPEN MY OUTCOME LETTER →</button>}

      {phase==="evening"&&current.todo&&<div style={{marginTop:12,borderTop:`1px solid ${LINE}`,paddingTop:12}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button onClick={()=>onTodoPatch(current.todo.index,{done:true})} style={{flex:1,border:`1.5px solid ${NAVY}`,background:current.todo.done?NAVY:"#fff",color:current.todo.done?PAPER:NAVY,padding:9,fontWeight:900,cursor:"pointer"}}>COMPLETE</button>
          <button onClick={()=>onTodoPatch(current.todo.index,{done:false})} style={{flex:1,border:`1.5px solid ${RED}`,background:!current.todo.done?RED:"#fff",color:!current.todo.done?"#fff":RED,padding:9,fontWeight:900,cursor:"pointer"}}>NOT COMPLETE</button>
        </div>
        {current.todo.done?<textarea value={current.todo.evidence||""} onChange={e=>onTodoPatch(current.todo.index,{evidence:e.target.value})} rows={2} placeholder="What evidence confirms completion?" style={{width:"100%",border:`1px solid ${LINE}`,padding:9,fontSize:13}}/>:<textarea value={current.todo.explanation||""} onChange={e=>onTodoPatch(current.todo.index,{explanation:e.target.value})} rows={2} placeholder="What actually prevented completion? Be precise." style={{width:"100%",border:`1px solid ${LINE}`,padding:9,fontSize:13}}/>}
        {!current.todo.done&&current.todo.explanation&&<div style={{marginTop:8,color:GRAY,fontSize:11,lineHeight:1.5}}>Is that an external obstacle, a missing resource, a poor plan, a changed priority—or avoidance?</div>}
      </div>}

      <div style={{display:"flex",justifyContent:"space-between",gap:8,marginTop:14}}>
        <button onClick={back} disabled={step===0} style={{border:`1px solid ${LINE}`,background:"#fff",color:GRAY,padding:"8px 12px",fontWeight:800,opacity:step===0?.4:1}}>← BACK</button>
        {step<steps.length-1?<button onClick={next} style={{border:0,background:NAVY,color:AMBER,padding:"9px 14px",fontWeight:900,cursor:"pointer"}}>NEXT →</button>:<button onClick={()=>setOpen(false)} style={{border:0,background:NAVY,color:AMBER,padding:"9px 14px",fontWeight:900,cursor:"pointer"}}>RETURN TO JOURNAL →</button>}
      </div>
    </div>}
  </section>;
}
