import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   THE 1 MONTH JOURNEY — v3 AI Edition
   Kates Doctrine · All Tony Kates Quotes · Voice Input · Word Picker
   Daily Photo · Pre-Planned Morning Todos · Pattern Coach
   ═══════════════════════════════════════════════════════════════════ */

const NAVY="#16243C",NAVY2="#2A3B5C",PAPER="#FAF8F3",LINE="#C9D1DE";
const RED="#C8281C",GRAY="#7A8190",COAL="#0D1520",AMBER="#C8830A";

const stripes={backgroundImage:`repeating-linear-gradient(90deg,${NAVY} 0 9px,#8FA0BC 9px 12px,${PAPER} 12px 20px)`};

/* ── Doctrine Prompt ─────────────────────────────────────────────── */
const DOCTRINE_PROMPT=`You are the Awareness Coach — the AI layer of The 1 Month Journey, built on the Kates Doctrine by Tony Kates (REFUZE / YNOT.LIFE).

DOCTRINE:
• Law of Awareness: Affirmations condition awareness — NOT the universe. "Potential is ubiquitous." "Reality doesn't deliver. Reality reveals." You didn't attract it. You conditioned yourself to see it. The Jeep Effect: see one Jeep, see Jeeps everywhere. The opportunity was always there.
• 50/50 Paradox: "We don't make the right answers, we make our answers right." Rate the day AND rate the effort — they tell two different stories. A 10-effort day with a 5 outcome is still a win.
• REFUZE OS: Reset · Equip · Forward · Unique · monetiZe Value · Empower.
• L.I.F.E.: Little Incidents Finding Expression. Events are neutral until awareness assigns meaning.
• A-A-A: Awareness → Alignment → Activation. In that order. Every time.

VOICE — non-negotiable:
Direct. Street level. No self-help filler. Max 160 words total. Questions are weapons.
Never say: "manifest", "the universe will provide", "great job", "I can see that..."
End EVERY response with ONE surgical closing question on its own line.
FORMAT: 2–3 tight paragraphs + one closing question.`;

/* ── Tony Kates Morning Quotes (31) ─────────────────────────────── */
// Format: [text, attr] OR [before, "REFUZE_word", after, attr]
const MQ=[
  ["I ","REFUZE"," to allow society to dictate my limitations.","Tony Kates"],
  ["Reality doesn’t deliver. Reality reveals.","Tony Kates"],
  ["Do you wake up FOR something or BECAUSE of something?","Tony Kates"],
  ["Life by default is blindness. Life by design is awareness.","Tony Kates"],
  ["A farmer does not pray for crops. He prepares for them.","Tony Kates"],
  ["Failure is the tuition of awareness. Pain is the microscope. Mistakes are the lenses.","Tony Kates"],
  ["The Jeeps were always on the road. The question is: What else are you blind to right now?","Tony Kates"],
  ["Luck is the story the blind tell themselves to explain what the aware prepared for.","Tony Kates"],
  ["Everyday is Day 1.","Tony Kates"],
  ["What if you DID know? Then what?","Tony Kates"],
  ["Awareness does not beg. Awareness does not hope. Awareness sees, aligns, and acts.","Tony Kates"],
  ["Break the model. Break the rules. Break the version of yourself that believes ignorance is safety.","Tony Kates"],
  ["A wait-ed life is a wasted life.","Tony Kates"],
  ["Humans have no purpose, only potential.","Tony Kates"],
  ["Rooms become available to you, when you open the door…","Tony Kates"],
  ["Don’t pray and wish, do and create…","Tony Kates"],
  ["Our every advancement has been at the result of someone first deciding to ","REFUZE",".","Tony Kates"],
  ["When conditions are made conducive, potential becomes reality.","Kates Doctrine"],
  ["Awareness, Alignment, Activation. In that order. Every time.","Kates Doctrine"],
  ["If one man can, then so can another.","Tony Kates"],
  ["Stress my body, FREE my mind.","Tony Kates"],
  ["Pursue your desires with the heart of a true Refuz-eneur.","Tony Kates"],
  ["Opportunities are not drawn to you. They already exist, everywhere, constantly.","Tony Kates"],
  ["You stop asking, Why me? and start asking, What does this mean?","Tony Kates"],
  ["Events are clay. Awareness is the sculptor.","Tony Kates"],
  ["I don’t compete, I combine!!!","Tony Kates"],
  ["I represent freedom.","Tony Kates"],
  ["Pain doesn’t have to hurt.","Tony Kates"],
  ["","REFUZE"," to live average. Push the needle, raise the bar…","Tony Kates"],
  ["Every accomplishment you admire is not proof of someone else’s superiority. It is proof of your possibility.","Tony Kates"],
  ["Seek, Learn, Apply, Master. SLAM it.","Kates Doctrine"],
];

/* ── Tony Kates Evening Quotes (31) ─────────────────────────────── */
const EQ=[
  ["Never let the truth get in the way of a good story.","Tony Kates"],
  ["We don’t make the right answers, we make our answers right.","Kates Doctrine"],
  ["Do you want to wish you had or BE GLAD YOU DID?!!","Tony Kates"],
  ["If all good things come to an end then all bad things will also…","Tony Kates"],
  ["Even a broken clock is right more times than a wrong one…","Tony Kates"],
  ["L.I.F.E. — Little Incidents Finding Expression. No good or bad. You give it meaning.","Kates Doctrine"],
  ["How old would you be if you didn’t know how old you are?","Tony Kates"],
  ["This is not a revolution, it’s an inevitable evolution…","Tony Kates"],
  ["Have a heart, use your brain, trust your gut, try to stay sane.","Tony Kates"],
  ["Silence is also an answer.","Tony Kates"],
  ["That isn’t wisdom. That’s anesthesia.","Tony Kates"],
  ["I was told I think differently than 80% of the men on the planet. I want it to be 90%.","Tony Kates"],
  ["Just because you get loud, doesn’t make you right!","Tony Kates"],
  ["That’s just the way that one went.","Tony Kates"],
  ["I bled for this knowledge.","Tony Kates"],
  ["What are they exposing about themselves?","Tony Kates"],
  ["I am Curious, Creative, and Consistent.","Tony Kates"],
  ["Lead with generosity.","Tony Kates"],
  ["Not polished. Not sugar-coated. Just truth, as I lived it.","Tony Kates"],
  ["My story is not about me…","Tony Kates"],
  ["I chose to bleed, break, and rebuild so I could become a father of value.","Tony Kates"],
  ["Pain is the microscope. Use it.","Tony Kates"],
  ["Reset, Equip, Forward, Unique, monetiZe Value, Empower. This is the OS.","REFUZE"],
  ["F.E.A.R. — Find Examples And Repeat. Just keep going!!","Kates Doctrine"],
  ["'Luck' is the language of the unaware. They don’t see the soil. They only see the harvest.","Tony Kates"],
  ["An unexamined life is a waste of potential.","Kates Doctrine"],
  ["Go break shit.","Tony Kates"],
  ["I don’t want to live forever… I want to exist for all eternity!","Tony Kates"],
  ["What you notice at night is what you’ll see tomorrow.","Tony Kates"],
  ["Not even death will kill me.","Tony Kates"],
  ["What else are you blind to right now?","Tony Kates"],
];

/* ── Day Word Sets (31 × 10, score 10→1 top to bottom) ─────────── */
const DW=[
  ["Luminous","Galvanized","Steady","Balanced","Tepid","Scattered","Drained","Defeated","Despondent","Hollow"],
  ["Incandescent","Resolute","Capable","Even-keeled","Flat","Uncertain","Overwhelmed","Anxious","Hopeless","Done"],
  ["Triumphant","Purposeful","Present","Stable","Ordinary","Hesitant","Burdened","Frustrated","Isolated","Extinguished"],
  ["Sovereign","Decisive","Moving","Measured","Routine","Wavering","Taxed","Discouraged","Desolate","Crushed"],
  ["Ascendant","Intentional","Advancing","Contained","Standard","Unfocused","Weary","Regretful","Forsaken","Shattered"],
  ["Radiant","Bold","Building","Moderate","Usual","Distracted","Pressured","Withdrawn","Abandoned","Obliterated"],
  ["Indomitable","Composed","Growing","Reasonable","Average","Tentative","Resistant","Stalled","Bereft","Paralyzed"],
  ["Magnetic","Energized","Contributing","Adequate","Passable","Unsettled","Reactive","Lost","Emptied","Annihilated"],
  ["Electrified","Aligned","Consistent","Functional","Middling","Fragmented","Troubled","Spiraling","Unraveling","Surrendered"],
  ["Unstoppable","Clear","Active","Grounded","Common","Adrift","Stuck","Broken","Diminished","Erased"],
  ["Blazing","Poised","Reliable","Level","So-so","Cloudy","Frayed","Collapsed","Gutted","Voided"],
  ["Formidable","Sharp","Aware","Temperate","Bland","Muddled","Depleted","Devastated","Bereft","Hollow"],
  ["Transcendent","Deliberate","Progressing","Organized","Tepid","Irresolute","Strained","Disheartened","Forsaken","Done"],
  ["Catalytic","Forward","Productive","Stable","Forgettable","Vacillating","Fatigued","Dispirited","Desolate","Broken"],
  ["Boundless","Ready","Prepared","Settled","Unremarkable","Drifting","Battered","Discouraged","Isolated","Crushed"],
  ["Phenomenal","Grounded","Engaged","Methodical","Generic","Detached","Beaten","Anxious","Emptied","Extinguished"],
  ["Masterful","Fortified","Diligent","Patient","Lackluster","Noncommittal","Dispirited","Regretful","Abandoned","Shattered"],
  ["Exceptional","Focused","Committed","Prudent","Insipid","Unmoored","Worn","Frustrated","Bereft","Obliterated"],
  ["Dominant","Calibrated","Invested","Careful","Muted","Foggy","Spent","Defeated","Desolate","Surrendered"],
  ["Flourishing","Primed","Resourceful","Mindful","Colorless","Divided","Sapped","Withdrawn","Gutted","Paralyzed"],
  ["Victorious","Locked in","Thorough","Tactful","Conventional","Faltering","Haggard","Lost","Unraveling","Annihilated"],
  ["Resplendent","Charged","Conscientious","Systematic","Pedestrian","Lukewarm","Flagging","Spiraling","Diminished","Erased"],
  ["Commanding","Rooted","Tenacious","Circumspect","Uninspired","Ambivalent","Languishing","Collapsed","Bereft","Voided"],
  ["Unshakeable","Anchored","Faithful","Even","Nondescript","Conflicted","Deteriorating","Devastated","Forsaken","Hollow"],
  ["Invincible","Steadfast","Solid","Balanced","Mediocre","Hesitant","Enervated","Disheartened","Isolated","Done"],
  ["Stalwart","Vigilant","Earnest","Measured","Bland","Unsettled","Jaded","Dispirited","Abandoned","Broken"],
  ["Impervious","Unrelenting","Constructive","Stable","Flat","Scattered","Resigned","Frustrated","Desolate","Crushed"],
  ["Fervent","Earnest","Responsive","Contained","Tepid","Wavering","Atrophied","Defeated","Emptied","Shattered"],
  ["Superlative","Crystalline","Systematic","Moderate","Ordinary","Tentative","Frayed","Withdrawn","Bereft","Obliterated"],
  ["Effulgent","Dialed in","Committed","Even-keeled","Average","Fragmented","Burdened","Anxious","Desolate","Surrendered"],
  ["Consummate","Lit","Purposive","Grounded","Passable","Adrift","Drained","Lost","Gutted","Hollow"],
];

const WC=["#C8830A","#7A9A2A","#2A8A5A","#2A7A8A","#3A6A8A","#4A5A6A","#5A4A70","#7A3A4A","#8A2222","#2A0808"];

/* ── Challenges ─────────────────────────────────────────────────── */
const CHALLENGES=[
  "Find out something new about someone you already know","Talk to a stranger",
  "Get out of breath","Empty your email inbox to zero",
  "Fast for 24 hours","Track everything you eat today",
  "Call a distant friend just to say Hi","Take an alternate route",
  "Write an “I Like This About You” note and mail it","Take a selfie with a stranger",
  "Talk to someone about your passion","Complete a bucket list item",
  "Do something FUN","Post a secret on social media",
  "Take a 30 minute walk / run","Try something random — food, drink, music",
  "Watch a documentary","Read an entire chapter of a non-fiction book",
  "Research a topic you know nothing about","24 Hour Media Blackout",
  "No meat for a day","Do something that scares you",
  "Photograph something you’re grateful for","Meditate at least 20 minutes",
  "Start a new habit you’ve been putting off","Do something totally self-less",
  "Meet someone out for lunch","Don’t lie all day",
  "Do something for YOU","Don’t complain entire day",
];

/* ── Needs Taxonomy ─────────────────────────────────────────────── */
const NEEDS_TAXONOMY=[
  {key:"certainty",label:"Certainty"},{key:"variety",label:"Variety"},
  {key:"significance",label:"Significance"},{key:"connection",label:"Connection"},
  {key:"growth",label:"Growth"},{key:"contribution",label:"Contribution"},
];

/* ── Schema ──────────────────────────────────────────────────────── */
const blankTodo=()=>({text:"",done:false});
const blankEntry=()=>({
  wakingThoughts:"",morningWordObj:null,morningRate:0,morningRoutine:false,
  wakeTime:"",deepSleepPct:null,sleepSource:"manual",
  nameItCollapsed:true,
  challenge:"",challengeDone:false,
  todos:[blankTodo(),blankTodo(),blankTodo()],secondaryActivities:[],
  focusMorning:"",focusMidday:"",focusEvening:"",
  reflect:"",photo:null,
  dayWordObj:null,dayRate:0,effortRate:0,
  eveningRoutine:false,
  corrections:"",obstacleSolution:"",ahHah:"",jeepEffect:"",gratitude:"",
  tomorrowTodos:[blankTodo(),blankTodo(),blankTodo()],
  scheduledTomorrow:false,
});
const blankOutcome=()=>({title:"",why:"",tasks:""});

/* ── Utilities ───────────────────────────────────────────────────── */
const todayKey=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const dateKeyOff=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const daysBetween=(a,b)=>Math.floor((new Date(b)-new Date(a))/86400000);
const shiftDate=(key,n)=>{const[y,m,d]=key.split("-").map(Number);const dt=new Date(y,m-1,d+n);return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;};

async function sget(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}}
async function sset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.error(e);}}

async function callCoach(content){
  try{
    const r=await fetch("/api/coach",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({content,system:DOCTRINE_PROMPT})
    });
    const d=await r.json();
    if(!r.ok) return d.error||"The coach is offline. Write it yourself — you already know.";
    return d.text||"The coach is offline. Write it yourself — you already know.";
  }catch{return"Connection failed. What’s the one thing you’d write right now if this worked?";}
}

async function compressImage(file){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const max=640;let w=img.width,h=img.height;
        if(w>h&&w>max){h=Math.round(h*max/w);w=max;}
        else if(h>max){w=Math.round(w*max/h);h=max;}
        canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",0.65));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Voice Hook ──────────────────────────────────────────────────── */
function useVoice(value,onChange){
  const[listening,setL]=useState(false);
  const recRef=useRef(null);
  const valRef=useRef(value);
  useEffect(()=>{valRef.current=value;},[value]);

  const toggle=useCallback(()=>{
    if(listening){recRef.current?.stop();setL(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice input works in Chrome and Safari.");return;}
    const rec=new SR();
    rec.continuous=false;rec.interimResults=false;rec.lang="en-US";
    const base=valRef.current;
    rec.onresult=e=>{
      const t=e.results[0][0].transcript;
      onChange(base+(base&&!base.endsWith(" ")?" ":"")+t);
    };
    rec.onerror=()=>setL(false);
    rec.onend=()=>setL(false);
    rec.start();recRef.current=rec;setL(true);
  },[listening,onChange]);
  return{listening,toggle};
}

/* ── UI Atoms ────────────────────────────────────────────────────── */
function Banner({children,sub}){
  return(
    <div className="relative mb-5">
      <div style={{...stripes,height:13,opacity:.85}}/>
      <div className="flex justify-center" style={{marginTop:-7}}>
        <div className="px-5 py-2 text-center" style={{background:PAPER,border:`2.5px solid ${NAVY}`,outline:`1.5px solid ${PAPER}`,outlineOffset:-5}}>
          <div style={{color:NAVY,fontFamily:"Georgia,serif",fontWeight:700,letterSpacing:".13em",fontSize:14,textTransform:"uppercase"}}>{children}</div>
          {sub&&<div style={{color:GRAY,fontSize:10.5,marginTop:2}}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Label({c,amber}){return<div className="mb-1" style={{fontSize:10.5,fontWeight:800,letterSpacing:".08em",color:amber?AMBER:NAVY2,textTransform:"uppercase"}}>{c}</div>;}

function VoiceArea({value,onChange,placeholder,rows=2,dark}){
  const{listening,toggle}=useVoice(value,onChange);
  return(
    <div style={{position:"relative"}}>
      <textarea value={value} rows={rows} placeholder={placeholder}
        onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2 outline-none resize-none"
        style={{background:dark?"#1A2535":"#fff",border:`1px solid ${listening?RED:dark?"#3A4D6A":LINE}`,
          borderRadius:2,fontSize:13.5,color:dark?PAPER:NAVY,lineHeight:1.5,paddingRight:42,transition:"border-color .15s"}}/>
      <button onClick={toggle}
        style={{position:"absolute",right:8,top:8,width:28,height:28,borderRadius:"50%",
          border:`1px solid ${listening?RED:LINE}`,background:listening?RED:"transparent",
          color:listening?"#fff":GRAY,cursor:"pointer",fontSize:14,display:"flex",
          alignItems:"center",justifyContent:"center"}}>
        {listening?"⏹":"🎤"}
      </button>
    </div>
  );
}

function VoiceInput({value,onChange,placeholder,style}){
  const{listening,toggle}=useVoice(value,onChange);
  return(
    <div style={{position:"relative"}}>
      <input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2 outline-none"
        style={{background:"#fff",border:`1px solid ${listening?RED:LINE}`,borderRadius:2,
          fontSize:13.5,color:NAVY,paddingRight:42,...style}}/>
      <button onClick={toggle}
        style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
          width:24,height:24,borderRadius:"50%",border:`1px solid ${listening?RED:LINE}`,
          background:listening?RED:"transparent",color:listening?"#fff":GRAY,
          cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {listening?"⏹":"🎤"}
      </button>
    </div>
  );
}

function Check({checked,onToggle,label,big}){
  return(
    <button onClick={onToggle} className="flex items-center gap-2 select-none">
      <span className="flex items-center justify-center flex-shrink-0"
        style={{width:big?28:20,height:big?28:20,border:`2px solid ${checked?NAVY:LINE}`,
          borderRadius:2,background:checked?NAVY:"#fff",color:"#fff",
          fontSize:big?17:12,fontWeight:900,transition:"all .12s"}}>
        {checked?"✓":""}
      </span>
      {label&&<span style={{fontSize:11.5,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:NAVY}}>{label}</span>}
    </button>
  );
}

function Rate({value,onChange,color}){
  return(
    <div className="flex flex-wrap gap-1">
      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
        <button key={n} onClick={()=>onChange(n)}
          style={{width:27,height:27,fontSize:11.5,fontWeight:700,borderRadius:2,
            border:`1.5px solid ${n<=value?(color||NAVY):LINE}`,
            background:n<=value?(color||NAVY):"#fff",color:n<=value?"#fff":GRAY,transition:"all .1s"}}>
          {n}
        </button>
      ))}
    </div>
  );
}

function Quote({runs}){
  if(runs.length===2){
    return(
      <div className="text-center px-4 py-3" style={{borderTop:`1px solid ${LINE}`,borderBottom:`1px solid ${LINE}`}}>
        <span style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:13.5,color:NAVY2}}>
          {"“"}{runs[0]}{"”"}
        </span>
        <span style={{fontFamily:"Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:12,color:NAVY,marginLeft:6}}>
          {"— "}{runs[1]}
        </span>
      </div>
    );
  }
  return(
    <div className="text-center px-4 py-3" style={{borderTop:`1px solid ${LINE}`,borderBottom:`1px solid ${LINE}`}}>
      <span style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:13.5,color:NAVY2}}>
        {"“"}{runs[0]}<strong style={{color:RED,fontStyle:"normal"}}>{runs[1]}</strong>{runs[2]}{"”"}
      </span>
      <span style={{fontFamily:"Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:12,color:NAVY,marginLeft:6}}>
        {"— "}{runs[3]}
      </span>
    </div>
  );
}

function AICard({text,loading,label}){
  if(!loading&&!text)return null;
  return(
    <div style={{background:COAL,borderLeft:`3px solid ${AMBER}`,borderRadius:3,padding:"14px 16px",marginTop:8}}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{width:6,height:6,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
        <span style={{fontSize:9.5,fontWeight:800,letterSpacing:".14em",color:AMBER,textTransform:"uppercase"}}>{label||"Awareness Coach"}</span>
      </div>
      {loading
        ?<div style={{color:"#5A7090",fontSize:12,fontStyle:"italic"}}>The coach is in your corner…</div>
        :<div style={{color:"#D4DDE8",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{text}</div>
      }
    </div>
  );
}

function CoachBtn({onClick,loading,label}){
  return(
    <button onClick={onClick} disabled={loading}
      style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",
        background:loading?"#1A2535":COAL,border:`1.5px solid ${AMBER}`,borderRadius:2,
        color:AMBER,fontSize:11,fontWeight:800,letterSpacing:".1em",cursor:loading?"default":"pointer",opacity:loading?.7:1}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
      {loading?"THINKING…":label}
    </button>
  );
}

/* ── Word Picker ─────────────────────────────────────────────────── */
function WordPicker({words,selected,onSelect}){
  return(
    <div style={{border:`1px solid ${LINE}`,borderRadius:3,overflow:"hidden",maxHeight:300,overflowY:"auto"}}>
      <div className="px-3 py-1.5" style={{background:COAL,position:"sticky",top:0,zIndex:1}}>
        <span style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>
          POSITIVE ↑ · SCROLL · ↓ NEGATIVE
        </span>
        {selected&&<span style={{float:"right",color:PAPER,fontSize:9,fontWeight:700}}>Selected: {selected.word}</span>}
      </div>
      {words.map((word,i)=>{
        const score=10-i;
        const isSel=selected?.word===word;
        return(
          <button key={word} onClick={()=>onSelect({word,score})}
            style={{display:"flex",alignItems:"center",width:"100%",
              padding:"9px 14px",gap:12,textAlign:"left",
              background:isSel?WC[i]:"#fff",
              borderBottom:i<9?`1px solid ${LINE}`:"none",
              color:isSel?"#fff":WC[i],transition:"background .12s"}}>
            <span style={{fontSize:10,fontWeight:800,opacity:.7,minWidth:16}}>{score}</span>
            <span style={{fontSize:14,fontWeight:isSel?800:500,fontFamily:"Georgia,serif",flex:1}}>{word}</span>
            {isSel&&<span style={{fontSize:12}}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Photo Capture ───────────────────────────────────────────────── */
function PhotoCapture({photo,onChange}){
  const ref=useRef(null);
  const[compressing,setC]=useState(false);
  const handle=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    setC(true);
    const b64=await compressImage(file);
    onChange(b64);setC(false);
  };
  return(
    <div>
      <Label c="Daily Photo — captured for your monthly recap"/>
      <div style={{position:"relative",borderRadius:2,overflow:"hidden"}}>
        {photo?(
          <div style={{position:"relative"}}>
            <img src={photo} alt="daily" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 50%)"}}>
              <div style={{position:"absolute",bottom:8,left:10,color:"#fff",fontSize:10,fontWeight:700,letterSpacing:".06em"}}>
                ✦ CAPTURED
              </div>
              <button onClick={()=>onChange(null)}
                style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",
                  color:"#fff",border:"none",borderRadius:2,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>
                RETAKE
              </button>
            </div>
          </div>
        ):(
          <button onClick={()=>ref.current?.click()}
            style={{width:"100%",height:100,border:`2px dashed ${LINE}`,borderRadius:2,
              background:"#fff",color:GRAY,cursor:"pointer",display:"flex",
              alignItems:"center",justifyContent:"center",gap:8,fontSize:13,fontWeight:700}}>
            {compressing?"Compressing…":"📷 Add Today’s Photo"}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" capture="environment"
          onChange={handle} style={{display:"none"}}/>
      </div>
    </div>
  );
}

/* ── Monthly Recap ───────────────────────────────────────────────── */
function MonthlyRecap({dayN,onClose}){
  const[data,setData]=useState({});
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      const result={};
      for(let d=1;d<=31;d++){
        const offset=d-dayN;
        const k=dateKeyOff(offset);
        const e=await sget(`journey:entry:${k}`);
        if(e)result[d]=e;
      }
      setData(result);setLoading(false);
    })();
  },[dayN]);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:50,overflowY:"auto"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:PAPER,maxWidth:500,margin:"20px auto",borderRadius:4,overflow:"hidden"}}>
        <div style={{background:NAVY,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#8FA0BC",fontSize:9.5,letterSpacing:".2em"}}>REFUZE · YNOT.LIFE</div>
            <div style={{color:PAPER,fontFamily:"Georgia,serif",fontWeight:800,fontSize:18}}>1 Month Journey</div>
            <div style={{color:AMBER,fontSize:11,fontWeight:700,marginTop:2}}>Monthly Recap</div>
          </div>
          <button onClick={onClose} style={{color:"#8FA0BC",background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {loading?(
          <div style={{padding:40,textAlign:"center",color:GRAY}}>Loading your month…</div>
        ):(
          <div style={{padding:16}}>
            <div style={{...stripes,height:8,marginBottom:12,opacity:.6}}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
              {["S","M","T","W","T","F","S"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:9,fontWeight:800,color:GRAY,paddingBottom:4}}>{d}</div>
              ))}
              {Array.from({length:31},(_,i)=>i+1).map(d=>{
                const rec=data[d];
                const word=rec?.dayWordObj?.word||rec?.morningWordObj?.word;
                const score=rec?.dayWordObj?.score||rec?.morningWordObj?.score||0;
                const pct=rec?.morningRoutine&&rec?.eveningRoutine&&rec?.scheduledTomorrow&&rec?.gratitude?.trim();
                return(
                  <div key={d} style={{borderRadius:3,overflow:"hidden",border:`1px solid ${LINE}`,
                    aspectRatio:"1",position:"relative",
                    background:rec?.photo?"transparent":(pct?NAVY:rec?`${LINE}44`:"#f8f8f8")}}>
                    {rec?.photo&&<img src={rec.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>}
                    <div style={{position:"absolute",inset:0,background:rec?.photo?"linear-gradient(to bottom,transparent 20%,rgba(0,0,0,.6) 100%)":"none",
                      display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"3px 4px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <span style={{fontSize:8,fontWeight:800,color:rec?.photo?"#fff":(pct?PAPER:NAVY)}}>{d}</span>
                        {pct&&<span style={{fontSize:9,color:rec?.photo?"#fff":AMBER}}>✓</span>}
                      </div>
                      {word&&<div style={{fontSize:6.5,fontWeight:700,color:rec?.photo?"#eee":WC[10-score]||GRAY,
                        lineHeight:1.1,overflow:"hidden"}}>{word}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:COAL,borderRadius:3,padding:"12px 16px"}}>
              <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em",marginBottom:8}}>LANGUAGE TREND</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {Array.from({length:31},(_,i)=>i+1).map(d=>{
                  const rec=data[d];const score=rec?.dayWordObj?.score||0;
                  if(!score)return null;
                  return(
                    <div key={d} style={{background:WC[10-score]||GRAY,color:"#fff",
                      fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:2}}>
                      D{d}: {score}
                    </div>
                  );
                })}
              </div>
              {Object.keys(data).length>0&&(()=>{
                const scores=Object.values(data).map(r=>r.dayWordObj?.score||r.morningWordObj?.score).filter(Boolean);
                const avg=scores.length?Math.round((scores.reduce((a,b)=>a+b,0)/scores.length)*10)/10:null;
                return avg&&(
                  <div style={{color:PAPER,fontSize:12,fontWeight:700,marginTop:8}}>
                    Average Language Score: <span style={{color:avg>=7?AMBER:avg>=5?"#8FA0BC":RED}}>{avg}/10</span>
                    <span style={{color:GRAY,fontSize:10,marginLeft:8}}>({avg>=7?"Positive":"avg<5"?"Needs work":"Neutral"})</span>
                  </div>
                );
              })()}
            </div>
            <div style={{textAlign:"center",marginTop:14,color:GRAY,fontSize:10,letterSpacing:".06em"}}>
              Screenshot and share #YNOTLife #1MonthJourney
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */
export default function JourneyJournal(){
  const[tab,setTab]=useState("today");
  const[phase,setPhase]=useState(new Date().getHours()>=17?"evening":"morning");
  const[loading,setLoading]=useState(true);
  const[saved,setSaved]=useState(true);
  const[meta,setMeta]=useState(null);
  const[entry,setEntry]=useState(blankEntry());
  const[outcomes,setOutcomes]=useState({required:[blankOutcome(),blankOutcome(),blankOutcome()],letter:"",mode:"main",needs:{}});
  const[monthMap,setMonthMap]=useState({});
  const[showRecap,setShowRecap]=useState(false);
  const[preplanned,setPreplanned]=useState(false);

  // AI state
  const[primer,setPrimer]=useState("");const[primerL,setPrimerL]=useState(false);
  const[insight,setInsight]=useState("");const[insightL,setInsightL]=useState(false);
  const[pattern,setPattern]=useState("");const[patternL,setPatternL]=useState(false);
  const[askQ,setAskQ]=useState("");const[askA,setAskA]=useState("");const[askL,setAskL]=useState(false);

  const saveTimer=useRef(null);
  const didMountRef=useRef(false);
  const touchStartX=useRef(null);
  const[activeDate,setActiveDate]=useState(todayKey());
  const todayDayN=meta?Math.min(31,Math.max(1,daysBetween(meta.start,todayKey())+1)):1;
  const dayN=meta?Math.min(31,Math.max(1,daysBetween(meta.start,activeDate)+1)):1;
  const words=DW[(dayN-1)%31];
  const mq=MQ[(dayN-1)%31];const eq=EQ[(dayN-1)%31];
  const isFuture=activeDate>todayKey();
  const activeDateLabel=(()=>{const[y,m,d]=activeDate.split("-").map(Number);const dt=new Date(y,m-1,d);return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()]+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getMonth()]+" "+d;})();

  const todosDone=entry.todos.every(t=>t.done);
  const hundredPct=entry.morningRoutine&&entry.eveningRoutine&&entry.scheduledTomorrow&&todosDone&&entry.gratitude.trim()!=="";
  const streak=(()=>{let s=0;for(let d=todayDayN-1;d>=1;d--){if(monthMap[d]?.complete)s++;else break;}return s;})();

  useEffect(()=>{
    (async()=>{
      let m=await sget("journey:meta");
      if(!m){m={start:todayKey()};await sset("journey:meta",m);}
      setMeta(m);
      let e=await sget(`journey:entry:${todayKey()}`);
      if(e){
        setEntry({...blankEntry(),...e});
      } else {
        // Fresh day — pre-populate todos from yesterday's plan
        const yEntry=await sget(`journey:entry:${dateKeyOff(-1)}`);
        if(yEntry?.tomorrowTodos?.some(t=>t.text)){
          setEntry(prev=>({...prev,todos:yEntry.tomorrowTodos.map(t=>({...t,done:false}))}));
          setPreplanned(true);
        }
      }
      const o=await sget("journey:outcomes");
      if(o)setOutcomes({mode:"main",needs:{},...o});
      const mm=await sget("journey:month");if(mm)setMonthMap(mm);
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{
    if(!didMountRef.current){didMountRef.current=true;return;}
    (async()=>{
      if(saveTimer.current)clearTimeout(saveTimer.current);
      setPreplanned(false);
      const e=await sget(`journey:entry:`);
      if(e){setEntry({...blankEntry(),...e});}
      else if(activeDate===todayKey()){
        const yEntry=await sget(`journey:entry:`);
        if(yEntry?.tomorrowTodos?.some(t=>t.text)){
          setEntry(prev=>({...prev,todos:yEntry.tomorrowTodos.map(t=>({...t,done:false}))}));
          setPreplanned(true);
        } else setEntry(blankEntry());
      } else setEntry(blankEntry());
    })();
  },[activeDate]);

  const scheduleSave=useCallback((nextEntry,nextOutcomes)=>{
    setSaved(false);
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      const e=nextEntry||entry;
      await sset(`journey:entry:${activeDate}`,e);
      if(nextOutcomes)await sset("journey:outcomes",nextOutcomes);
      const complete=e.morningRoutine&&e.eveningRoutine&&e.scheduledTomorrow&&e.todos.every(t=>t.done)&&e.gratitude.trim()!=="";
      const mm={...monthMap,[dayN]:{rate:e.dayRate||e.morningRate,effortRate:e.effortRate,
        dayWord:e.dayWordObj?.word,dayScore:e.dayWordObj?.score,complete}};
      setMonthMap(mm);await sset("journey:month",mm);setSaved(true);
    },700);
  },[entry,activeDate,dayN,monthMap]);

  const up=(patch)=>{const next={...entry,...patch};setEntry(next);scheduleSave(next);};
  const upTodo=(i,patch)=>{const todos=entry.todos.map((t,j)=>j===i?{...t,...patch}:t);up({todos});};
  const upTTodo=(i,patch)=>{const tomorrowTodos=entry.tomorrowTodos.map((t,j)=>j===i?{...t,...patch}:t);up({tomorrowTodos,scheduledTomorrow:tomorrowTodos.some(t=>t.text)});};
  const upO=(next)=>{setOutcomes(next);scheduleSave(null,next);};
  const handleTouchStart=useCallback(e=>{touchStartX.current=e.touches[0].clientX;},[]);
  const handleTouchEnd=useCallback(e=>{
    if(touchStartX.current===null)return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    if(Math.abs(dx)>60)setActiveDate(shiftDate(activeDate,dx<0?1:-1));
    touchStartX.current=null;
  },[activeDate]);

  // AI
  const primeMorning=async()=>{
    setPrimerL(true);
    const yEntry=await sget(`journey:entry:${dateKeyOff(-1)}`)||{};
    const outList=outcomes.required.map((o,i)=>`${i+1}. ${o.title||"(not set)"}`).join("\n");
    const res=await callCoach(
      `Day ${dayN} of 31. My 3 month outcomes:\n${outList}\n\n`+
      (yEntry.corrections?`Yesterday’s corrections: ${yEntry.corrections}\n`:"")+
      (yEntry.jeepEffect?`What I noticed yesterday: ${yEntry.jeepEffect}\n`:"")+
      `\nPrime my awareness lens for today.`
    );
    setPrimer(res);setPrimerL(false);
  };

  const getInsight=async()=>{
    setInsightL(true);
    const res=await callCoach(
      `Day ${dayN} of 31.\nDay rating: ${entry.dayRate}/10 | Effort rating: ${entry.effortRate}/10\n`+
      `Today’s word: ${entry.dayWordObj?.word||"(none)"} (score ${entry.dayWordObj?.score||0}/10)\n`+
      `Corrections: ${entry.corrections||"(none)"}\n`+
      `Obstacle/Solution: ${entry.obstacleSolution||"(none)"}\n`+
      `Ah Hah: ${entry.ahHah||"(none)"}\n`+
      `Jeep Effect — what I noticed: ${entry.jeepEffect||"(none)"}\n`+
      `Tomorrow’s 3 To-Do’s planned: ${entry.tomorrowTodos.map(t=>t.text||"(empty)").join(" / ")}\n`+
      `\nGive me my evening coaching. Apply the 50/50 Paradox to my ratings. Call out the pattern if it’s there.`
    );
    setInsight(res);setInsightL(false);
  };

  const analyzePatterns=async()=>{
    setPatternL(true);
    const days=[];
    for(let i=0;i<7;i++){
      const k=dateKeyOff(-i);
      const e=await sget(`journey:entry:${k}`);
      if(e)days.push({day:dayN-i,...e});
    }
    if(!days.length){setPattern("No entries yet. Fill out at least a few days first — then come back.");setPatternL(false);return;}
    const summary=days.map(e=>[
      `Day ${e.day}:`,
      e.corrections&&`Corrections: ${e.corrections}`,
      e.obstacleSolution&&`Obstacle: ${e.obstacleSolution}`,
      e.ahHah&&`Ah Hah: ${e.ahHah}`,
      e.jeepEffect&&`Jeep Effect: ${e.jeepEffect}`,
      e.dayWordObj&&`Word: ${e.dayWordObj.word} (${e.dayWordObj.score}/10)`,
    ].filter(Boolean).join(" | ")).join("\n");
    const res=await callCoach(`Last ${days.length} days:\n${summary}\n\nWhat pattern do I keep repeating? What obstacle won’t name itself? What’s compounding in the right direction?`);
    setPattern(res);setPatternL(false);
  };

  const askCoach=async()=>{
    if(!askQ.trim())return;
    setAskL(true);
    const res=await callCoach(askQ);
    setAskA(res);setAskL(false);
  };

  if(loading)return(
    <div className="min-h-screen flex items-center justify-center" style={{background:COAL}}>
      <div style={{color:AMBER,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:16}}>Opening your Journey…</div>
    </div>
  );

  return(
    <div className="min-h-screen pb-24" style={{background:PAPER,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      {showRecap&&<MonthlyRecap dayN={dayN} onClose={()=>setShowRecap(false)}/>}

      {/* Masthead */}
      <header style={{background:NAVY}} className="px-4 pt-5 pb-4 text-center relative">
        <div style={{color:"#8FA0BC",letterSpacing:".3em",fontSize:9.5}}>R · E · F · U · Z · E</div>
        <h1 style={{color:PAPER,fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,lineHeight:1.15,marginTop:3}}>
          The 1 Month{" "}
          <span style={{textDecoration:"line-through",textDecorationColor:RED,textDecorationThickness:3}}>Journal</span>
          <span style={{color:RED,fontFamily:"Georgia,serif",fontStyle:"italic"}}>ey</span>
        </h1>
        <div className="flex items-center justify-center flex-wrap gap-2 mt-2">
          <span style={{background:RED,color:"#fff",fontWeight:800,fontSize:11,padding:"3px 10px",letterSpacing:".08em"}}>DAY {dayN}/31</span>
          {streak>0&&<span style={{background:"#1A2D4A",color:AMBER,fontSize:10,fontWeight:700,padding:"3px 8px"}}>{streak} DAY STREAK</span>}
          {preplanned&&phase==="morning"&&<span style={{background:"#1A3020",color:"#6ACA8A",fontSize:10,fontWeight:700,padding:"3px 8px"}}>✓ TONIGHT’S PLAN LOADED</span>}
          {isFuture&&<span style={{background:"#2A3B1A",color:AMBER,fontSize:10,fontWeight:700,padding:"3px 8px"}}>Planning ahead — {activeDateLabel}</span>}
        </div>
        <div style={{position:"absolute",right:10,top:10,fontSize:9.5,color:saved?"#4A6080":AMBER}}>{saved?"saved":"● saving"}</div>
      </header>
      <div style={{...stripes,height:11}}/>

      {/* Nav */}
      <nav className="flex" style={{borderBottom:`2px solid ${NAVY}`}}>
        {[["today","Today"],["outcomes","Outcomes"],["month","Month"],["coach","Coach ●"]].map(([k,t])=>(
          <button key={k} onClick={()=>setTab(k)} className="flex-1 py-2.5"
            style={{fontSize:11.5,fontWeight:800,letterSpacing:".06em",textTransform:"uppercase",
              color:k==="coach"?(tab===k?"#fff":AMBER):(tab===k?PAPER:NAVY),
              background:tab===k?(k==="coach"?COAL:NAVY):"transparent",
              borderBottom:tab===k?`2px solid ${k==="coach"?AMBER:RED}`:"none"}}>
            {t}
          </button>
        ))}
      </nav>

      {/* ═══ TODAY ═══ */}
      {tab==="today"&&(
        <main className="max-w-xl mx-auto px-4 pt-5"
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={()=>setActiveDate(shiftDate(activeDate,-1))}
              style={{fontSize:22,color:NAVY,background:"none",border:"none",cursor:"pointer",padding:"4px 12px",lineHeight:1}}>&#8249;</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:NAVY,letterSpacing:".06em",textTransform:"uppercase"}}>{activeDateLabel}</div>
            </div>
            <button onClick={()=>setActiveDate(shiftDate(activeDate,1))}
              style={{fontSize:22,color:NAVY,background:"none",border:"none",cursor:"pointer",padding:"4px 12px",lineHeight:1}}>&#8250;</button>
          </div>
          <div className="flex gap-2 mb-4">
            {[["morning","☀ Morning"],["evening","☾ Evening"]].map(([k,t])=>(
              <button key={k} onClick={()=>setPhase(k)} className="flex-1 py-2"
                style={{border:`2px solid ${NAVY}`,borderRadius:2,fontWeight:700,fontSize:13,
                  background:phase===k?NAVY:"#fff",color:phase===k?PAPER:NAVY}}>
                {t}
              </button>
            ))}
          </div>

          {phase==="morning"&&(
            <div className="space-y-5">
              <Quote runs={mq}/>

              {/* Awareness Primer */}
              <div style={{borderRadius:3,overflow:"hidden"}}>
                <div className="flex items-center justify-between px-3 py-2" style={{background:COAL}}>
                  <div>
                    <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>AWARENESS PRIMER</div>
                    <div style={{color:"#5A7090",fontSize:10,marginTop:1}}>AI · Yesterday’s log + your outcomes</div>
                  </div>
                  <CoachBtn onClick={primeMorning} loading={primerL} label="PRIME MY AWARENESS"/>
                </div>
                {(primerL||primer)&&<AICard text={primer} loading={primerL} label="Morning Primer"/>}
              </div>

              <div>
                <Label c="Waking Thoughts"/>
                <VoiceArea rows={3} value={entry.wakingThoughts} placeholder="Roll over and write what’s on your mind — dream recall and all…" onChange={v=>up({wakingThoughts:v})}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label c="Wake Time"/>
                    <input type="time" value={entry.wakeTime??""} onChange={e=>up({wakeTime:e.target.value})}
                      className="w-full px-3 py-2 outline-none"
                      style={{border:`1px solid ${LINE}`,borderRadius:2,fontSize:13.5,color:NAVY,background:"#fff"}}/>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label c="Deep Sleep %"/>
                      <span style={{fontSize:9,fontWeight:800,letterSpacing:".08em",color:GRAY,textTransform:"uppercase",
                        border:`1px solid ${LINE}`,borderRadius:2,padding:"1px 5px"}}>manual</span>
                    </div>
                    <input type="number" min={0} max={100} value={entry.deepSleepPct??""} placeholder="0–100"
                      onChange={e=>up({deepSleepPct:e.target.value===""?null:Math.min(100,Math.max(0,+e.target.value))})}
                      className="w-full px-3 py-2 outline-none"
                      style={{border:`1px solid ${LINE}`,borderRadius:2,fontSize:13.5,color:NAVY,background:"#fff"}}/>
                </div>
              </div>

              {/* Word Picker — Morning */}
              <div style={{border:`1px solid ${LINE}`,borderRadius:3,overflow:"hidden"}}>
                <button onClick={()=>up({nameItCollapsed:!(entry.nameItCollapsed??true)})}
                  className="w-full flex items-center justify-between px-3 py-2"
                  style={{background:"#fff",cursor:"pointer"}}>
                    <Label c="Name It — choose one word that names how you woke up"/>
                  <span style={{fontSize:13,color:GRAY,marginLeft:8,flexShrink:0}}>
                    {(entry.nameItCollapsed??true)?"▸":"▾"}
                  </span>
                </button>
                {!(entry.nameItCollapsed??true)&&(
                    <div style={{borderTop:`1px solid ${LINE}`}}>
                      <WordPicker words={words} selected={entry.morningWordObj} onSelect={v=>up({morningWordObj:v})}/>
                      {entry.morningWordObj&&<div style={{fontSize:10.5,color:GRAY,padding:"4px 12px"}}>Score: {entry.morningWordObj.score}/10</div>}
                    </div>
                )}
              </div>

              <div>
                <Label c="Rate 1–10"/>
                <Rate value={entry.morningRate} onChange={n=>up({morningRate:n})}/>
              </div>

              <div className="flex items-center justify-between p-3"
                style={{border:`1.5px solid ${entry.morningRoutine?NAVY:LINE}`,borderRadius:2,background:"#fff"}}>
                <Check big checked={entry.morningRoutine} label="Morning Routine Complete" onToggle={()=>up({morningRoutine:!entry.morningRoutine})}/>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label c="Today’s Challenge"/>
                  <button onClick={()=>up({challenge:CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)]})}
                    style={{fontSize:10,fontWeight:800,color:RED,background:"none",border:"none",cursor:"pointer"}}>DEAL ONE →</button>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="pt-2"><Check checked={entry.challengeDone} onToggle={()=>up({challengeDone:!entry.challengeDone})}/></div>
                  <div style={{flex:1}}><VoiceArea rows={1} value={entry.challenge} placeholder="Expand the comfort zone." onChange={v=>up({challenge:v})}/></div>
                </div>
              </div>

              {/* Pre-planned To-Do's */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label c="Top 3 To Do’s"/>
                  {preplanned&&<span style={{fontSize:9.5,color:"#5ABA7A",fontWeight:700}}>✓ Planned last night</span>}
                </div>
                <div className="space-y-2">
                  {entry.todos.map((t,i)=>(
                    <div key={i} className="p-2.5" style={{border:`1px solid ${t.done?LINE:NAVY}`,background:"#fff",borderRadius:2}}>
                      <div className="flex gap-2 items-center">
                        <Check checked={t.done} onToggle={()=>upTodo(i,{done:!t.done})}/>
                        <VoiceInput value={t.text} placeholder={`To Do ${i+1}`}
                          onChange={v=>{upTodo(i,{text:v});if(preplanned)setPreplanned(false);}}
                          style={{textDecoration:t.done?"line-through":"none",background:"transparent",border:"none",padding:"4px 40px 4px 0"}}/>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Secondary Activities */}
              <div>
                <Label c="Secondary Activities"/>
                <div className="space-y-2">
                    {(entry.secondaryActivities??[]).map((a,i)=>(
                      <div key={a.id} className="flex gap-2 items-center">
                        <Check checked={a.done} onToggle={()=>{
                          const secondaryActivities=(entry.secondaryActivities??[]).map((x,j)=>j===i?{...x,done:!x.done}:x);
                          up({secondaryActivities});
                        }}/>
                        <div style={{flex:1}}>
                          <VoiceInput value={a.text} placeholder="Activity…"
                            onChange={v=>{
                              const secondaryActivities=(entry.secondaryActivities??[]).map((x,j)=>j===i?{...x,text:v}:x);
                              up({secondaryActivities});
                            }}
                            style={{textDecoration:a.done?"line-through":"none"}}/>
                        </div>
                        <button onClick={()=>{
                          const secondaryActivities=(entry.secondaryActivities??[]).filter((_,j)=>j!==i);
                          up({secondaryActivities});
                        }} style={{flexShrink:0,width:24,height:24,border:`1px solid ${LINE}`,borderRadius:2,
                          background:"#fff",color:GRAY,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
                      </div>
                    ))}
                </div>
                <button onClick={()=>{
                    const secondaryActivities=[...(entry.secondaryActivities??[]),{id:crypto.randomUUID(),text:"",done:false}];
                    up({secondaryActivities});
                }} style={{marginTop:6,fontSize:11,fontWeight:800,color:NAVY,background:"none",
                border:`1px dashed ${LINE}`,borderRadius:2,padding:"5px 12px",cursor:"pointer",letterSpacing:".05em"}}>
                + Add activity
                </button>
              </div>

              <div>
                <Label c="Major Focus"/>
                <div className="grid grid-cols-3 gap-2">
                  {[["focusMorning","Morning"],["focusMidday","Midday"],["focusEvening","Evening"]].map(([k,t])=>(
                    <div key={k}>
                      <div style={{fontSize:9.5,color:GRAY,marginBottom:3}}>{t}</div>
                      <VoiceInput value={entry[k]} placeholder="—" onChange={v=>up({[k]:v})}/>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}

          {phase==="evening"&&(
            <div className="space-y-5">
              <Quote runs={eq}/>

              <div><Label c="Reflect"/><VoiceArea rows={3} value={entry.reflect} placeholder="Lay back. How did the day shape up — and why?" onChange={v=>up({reflect:v})}/></div>

              <PhotoCapture photo={entry.photo} onChange={v=>up({photo:v})}/>

              {/* Word Picker — Evening */}
              <div>
                <Label c="Name the Day — scroll and choose your word"/>
                <WordPicker words={words} selected={entry.dayWordObj} onSelect={v=>up({dayWordObj:v})}/>
                {entry.dayWordObj&&(
                  <div style={{fontSize:10.5,marginTop:4,color:GRAY}}>
                    Score: {entry.dayWordObj.score}/10 · {entry.dayWordObj.score>=7?"Positive territory.":entry.dayWordObj.score>=5?"Neutral.":"Below center."}
                  </div>
                )}
              </div>

              {/* 50/50 Dual Rating */}
              <div style={{border:`1.5px solid ${NAVY}`,borderRadius:3,overflow:"hidden"}}>
                <div className="px-3 pt-2 pb-1.5" style={{background:NAVY}}>
                  <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>THE 50/50 PARADOX</div>
                  <div style={{color:"#8FA0BC",fontSize:10.5,marginTop:1}}>We don’t make the right answers. We make our answers right.</div>
                </div>
                <div className="grid grid-cols-2" style={{background:"#fff"}}>
                  <div className="p-3" style={{borderRight:`1px solid ${LINE}`}}>
                    <Label c="Rate the Day"/><div style={{fontSize:10,color:GRAY,marginBottom:6}}>What happened</div>
                    <Rate value={entry.dayRate} onChange={n=>up({dayRate:n})}/>
                  </div>
                  <div className="p-3">
                    <Label c="Rate Your Effort" amber/><div style={{fontSize:10,color:GRAY,marginBottom:6}}>What YOU brought</div>
                    <Rate value={entry.effortRate} onChange={n=>up({effortRate:n})} color={AMBER}/>
                  </div>
                </div>
                {entry.dayRate>0&&entry.effortRate>0&&(
                  <div className="px-3 py-2" style={{background:"#F0F4FA",borderTop:`1px solid ${LINE}`,fontSize:11,fontWeight:700}}>
                    {entry.effortRate>=entry.dayRate+2
                      ?<span style={{color:NAVY}}>Effort outran the outcome. The math catches up.</span>
                      :entry.dayRate>=entry.effortRate+2
                      ?<span style={{color:RED}}>The day rated high but effort lagged. What did you leave on the table?</span>
                      :<span style={{color:NAVY2}}>Day {entry.dayRate} · Effort {entry.effortRate}. The gap between these is the whole story.</span>
                    }
                  </div>
                )}
              </div>

              <div className="p-3" style={{border:`1.5px solid ${entry.eveningRoutine?NAVY:LINE}`,borderRadius:2,background:"#fff"}}>
                <Check big checked={entry.eveningRoutine} label="Evening Routine Complete" onToggle={()=>up({eveningRoutine:!entry.eveningRoutine})}/>
              </div>

              {/* Corrections */}
              <div className="grid grid-cols-2 gap-2">
                <div><Label c="Corrections / Lesson Learned"/><VoiceArea rows={4} value={entry.corrections} placeholder="Where did you fall short? Own it." onChange={v=>up({corrections:v})}/></div>
                <div><Label c="Obstacle / Solution"/><VoiceArea rows={4} value={entry.obstacleSolution} placeholder="Driving force — and what ensures it won’t repeat." onChange={v=>up({obstacleSolution:v})}/></div>
              </div>

              <div><Label c="Ah Hah"/><VoiceArea rows={2} value={entry.ahHah} placeholder="What stretched your mind today? Document it or lose it." onChange={v=>up({ahHah:v})}/></div>

              {/* Jeep Effect */}
              <div style={{border:`1.5px solid ${AMBER}`,borderRadius:3,overflow:"hidden"}}>
                <div className="px-3 py-2" style={{background:COAL}}>
                  <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>THE JEEP EFFECT</div>
                  <div style={{color:"#5A7090",fontSize:10.5,marginTop:1}}>You didn’t attract it. You conditioned yourself to see it.</div>
                </div>
                <VoiceArea rows={2} value={entry.jeepEffect}
                  placeholder="What did you notice today that was ALWAYS THERE — opportunity, person, truth, resource… but invisible until now?"
                  onChange={v=>up({jeepEffect:v})}/>
              </div>

              <div><Label c="Show Gratitude"/><VoiceArea rows={3} value={entry.gratitude} placeholder="What are you thankful for about this day?" onChange={v=>up({gratitude:v})}/></div>

              {/* ── TOMORROW'S 3 TO-DO'S ── Tony's core instruction */}
              <div style={{border:`2px solid ${NAVY}`,borderRadius:3,overflow:"hidden"}}>
                <div className="px-3 py-2" style={{background:NAVY}}>
                  <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>TOMORROW’S 3 TO-DO’S</div>
                  <div style={{color:"#8FA0BC",fontSize:10.5,marginTop:1}}>Plan now. Wake up with purpose. These get you out of bed.</div>
                </div>
                <div style={{background:"#fff",padding:12}} className="space-y-2">
                  {entry.tomorrowTodos.map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:800,color:NAVY,minWidth:16}}>{i+1}.</span>
                      <div style={{flex:1}}>
                        <VoiceInput value={t.text} placeholder={`To Do ${i+1} for tomorrow…`}
                          onChange={v=>upTTodo(i,{text:v})}/>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1">
                    <Check big checked={entry.scheduledTomorrow}
                      label="Tomorrow is planned. I’m ready to close."
                      onToggle={()=>up({scheduledTomorrow:!entry.scheduledTomorrow})}/>
                  </div>
                </div>
              </div>

              {/* Evening Coach */}
              <div style={{borderRadius:3,overflow:"hidden",border:`1px solid ${COAL}`}}>
                <div className="flex items-center justify-between px-3 py-2" style={{background:COAL}}>
                  <div>
                    <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>EVENING COACHING</div>
                    <div style={{color:"#5A7090",fontSize:10,marginTop:1}}>Doctrine-native insight on today</div>
                  </div>
                  <CoachBtn onClick={getInsight} loading={insightL} label="GET MY COACHING"/>
                </div>
                {(insightL||insight)&&<AICard text={insight} loading={insightL} label="Evening Insight"/>}
              </div>

              {/* 100% Complete */}
              <div className="p-4 text-center" style={{border:`2.5px solid ${hundredPct?RED:LINE}`,borderRadius:3,background:"#fff"}}>
                {hundredPct?(
                  <div style={{transform:"rotate(-5deg)"}}>
                    <div style={{display:"inline-block",border:`4px solid ${RED}`,color:RED,fontWeight:900,fontSize:26,letterSpacing:".1em",padding:"4px 18px",borderRadius:4,fontFamily:"Georgia,serif"}}>
                      100% COMPLETE
                    </div>
                    <div style={{color:NAVY,fontSize:12,marginTop:8,fontWeight:700}}>You DID IT. One check box at a time.</div>
                  </div>
                ):(
                  <div>
                    <div style={{color:LINE,fontWeight:800,fontSize:14,letterSpacing:".06em"}}>100 % COMPLETE</div>
                    <div style={{fontSize:11,color:GRAY,marginTop:4}}>
                      {[!entry.eveningRoutine&&"evening routine",!entry.scheduledTomorrow&&"plan tomorrow",entry.gratitude.trim()===""&&"gratitude"].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ═══ OUTCOMES ═══ */}
      {tab==="outcomes"&&(
        <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
          {/* Mode toggle */}
          <div className="flex" style={{border:`2px solid ${NAVY}`,borderRadius:2,overflow:"hidden"}}>
            {[["main","3 Main Outcomes"],["needs","Needs Driven"]].map(([k,t])=>(
              <button key={k} onClick={()=>upO({...outcomes,mode:k})} className="flex-1 py-2"
                style={{fontSize:11.5,fontWeight:800,letterSpacing:".05em",textTransform:"uppercase",
                  background:(outcomes.mode??"main")===k?NAVY:"#fff",
                  color:(outcomes.mode??"main")===k?PAPER:NAVY}}>
                {t}
              </button>
            ))}
          </div>

          {(outcomes.mode??"main")==="main"&&<>
          <Banner sub="One month of intentional action.">3 Required Outcomes</Banner>
          {outcomes.required.map((o,i)=>(
            <div key={i} className="p-3 space-y-2" style={{border:`1.5px solid ${NAVY}`,background:"#fff",borderRadius:2}}>
              <div style={{background:NAVY,color:PAPER,fontWeight:800,fontSize:11,padding:"2px 10px",display:"inline-block"}}>OUTCOME {i+1}</div>
              <VoiceInput value={o.title} placeholder="The outcome — specific, finished-tense"
                onChange={v=>{const r=outcomes.required.map((x,j)=>j===i?{...x,title:v}:x);upO({...outcomes,required:r});}}/>
              <VoiceArea rows={2} value={o.tasks} placeholder="Tasks that make it inevitable…"
                onChange={v=>{const r=outcomes.required.map((x,j)=>j===i?{...x,tasks:v}:x);upO({...outcomes,required:r});}}/>
              <VoiceArea rows={1} value={o.why} placeholder="Why:"
                onChange={v=>{const r=outcomes.required.map((x,j)=>j===i?{...x,why:v}:x);upO({...outcomes,required:r});}}/>
            </div>
          ))}
          <Banner sub="Read this daily as part of your morning ritual.">Outcome Letter</Banner>
          <VoiceArea rows={9} value={outcomes.letter}
            placeholder="Write a letter to yourself being thankful for achieving your three main outcomes. What does it feel like? Who have you become?"
            onChange={v=>upO({...outcomes,letter:v})}/>
          </>}

          {(outcomes.mode??"main")==="needs"&&(
            <div className="space-y-4">
              <Banner sub="Which human needs is this month serving?">Needs Driven</Banner>
              {NEEDS_TAXONOMY.map(({key,label})=>(
                <div key={key}>
                  <Label c={label}/>
                  <VoiceArea rows={2} value={(outcomes.needs??{})[key]??""}
                    placeholder={`How is this month serving your need for ${label.toLowerCase()}?`}
                    onChange={v=>upO({...outcomes,needs:{...(outcomes.needs??{}),[key]:v}})}/>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ═══ MONTH ═══ */}
      {tab==="month"&&(
        <main className="max-w-xl mx-auto px-4 pt-5">
          <Banner sub="30 checks in a row. Imagine how much closer.">The Month</Banner>
          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {Array.from({length:31},(_,i)=>i+1).map(d=>{
              const rec=monthMap[d];const isToday=d===todayDayN;const isActive=d===dayN&&!isToday;
              const gap=rec?.effortRate>0&&rec?.rate>0?rec.effortRate-rec.rate:0;
              return(
                <div key={d} onClick={()=>{setActiveDate(dateKeyOff(d-todayDayN));setTab("today");}}
                  className="flex flex-col items-center justify-center"
                  style={{aspectRatio:"1",borderRadius:2,cursor:"pointer",
                    border:isToday?`2px solid ${RED}`:isActive?`2px solid ${AMBER}`:`1px solid ${LINE}`,
                    background:rec?.complete?NAVY:rec?.rate?"#EEF2F8":"#fff"}}>
                  <div style={{fontSize:8.5,color:rec?.complete?PAPER:GRAY,fontWeight:700}}>{d}</div>
                  <div style={{fontSize:13,fontWeight:900,color:rec?.complete?PAPER:isToday?RED:isActive?AMBER:GRAY}}>
                    {rec?.complete?"✓":rec?.rate?rec.rate:"·"}
                  </div>
                  {gap>=2&&<div style={{fontSize:6.5,color:AMBER,fontWeight:800}}>E+</div>}
                </div>
              );
            })}
          </div>

          {/* Language trend */}
          {Object.keys(monthMap).length>0&&(()=>{
            const entries=Object.entries(monthMap).filter(([,v])=>v.dayScore).sort(([a],[b])=>+a-+b);
            if(!entries.length)return null;
            const avg=Math.round(entries.reduce((s,[,v])=>s+v.dayScore,0)/entries.length*10)/10;
            return(
              <div style={{border:`1px solid ${LINE}`,borderRadius:3,overflow:"hidden",marginBottom:16}}>
                <div className="px-3 py-2" style={{background:NAVY}}>
                  <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>LANGUAGE TREND</div>
                  <div style={{color:"#8FA0BC",fontSize:10.5,marginTop:1}}>
                    Average score: <strong style={{color:avg>=7?AMBER:avg>=5?"#8FA0BC":RED}}>{avg}/10</strong>
                  </div>
                </div>
                <div className="p-3 flex flex-wrap gap-1">
                  {entries.map(([d,v])=>(
                    <div key={d} style={{background:WC[10-v.dayScore]||GRAY,color:"#fff",
                      fontSize:8.5,fontWeight:700,padding:"2px 6px",borderRadius:2}} title={v.dayWord}>
                      D{d}:{v.dayScore}
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3 flex flex-wrap gap-1">
                  {entries.filter(([,v])=>v.dayWord).map(([d,v])=>(
                    <span key={d} style={{fontSize:10,color:WC[10-v.dayScore]||GRAY,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                      {v.dayWord}{+d<31?",":"."}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="text-center space-y-3">
            <button onClick={()=>setShowRecap(true)}
              style={{width:"100%",padding:"12px 0",background:NAVY,color:AMBER,fontWeight:800,
                fontSize:12,letterSpacing:".1em",border:"none",borderRadius:2,cursor:"pointer"}}>
              ✦ VIEW MONTHLY RECAP — INSTAGRAM READY ✦
            </button>
            <button onClick={async()=>{const m={start:todayKey()};setMeta(m);setMonthMap({});await sset("journey:meta",m);await sset("journey:month",{});}}
              style={{border:`2px solid ${NAVY}`,color:NAVY,fontWeight:800,fontSize:11,letterSpacing:".08em",padding:"8px 18px",background:"transparent",cursor:"pointer"}}>
              START NEW MONTH →
            </button>
            <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",color:NAVY2,fontSize:13}}>
              {"“"}Everyday is Day 1.{"”"} — Tony Kates
            </div>
          </div>
        </main>
      )}

      {/* ═══ COACH ═══ */}
      {tab==="coach"&&(
        <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
          <div style={{background:COAL,borderRadius:3,overflow:"hidden"}}>
            <div className="px-4 pt-4 pb-3" style={{borderBottom:`1px solid #1E3050`}}>
              <div style={{color:AMBER,fontSize:9.5,fontWeight:800,letterSpacing:".15em"}}>AWARENESS COACH</div>
              <div style={{color:PAPER,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:16,marginTop:4,lineHeight:1.3}}>
                Built on the Kates Doctrine.<br/>Not generic AI. Yours.
              </div>
            </div>

            <div className="px-4 py-4" style={{borderBottom:`1px solid #1E3050`}}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em"}}>PATTERN PULSE</div>
                  <div style={{color:"#5A7090",fontSize:10.5,marginTop:1}}>Last 7 days. What are you blind to?</div>
                </div>
                <CoachBtn onClick={analyzePatterns} loading={patternL} label="FIND MY PATTERN"/>
              </div>
              {(patternL||pattern)&&<AICard text={pattern} loading={patternL} label="Pattern Analysis"/>}
            </div>

            <div className="px-4 py-4">
              <div style={{color:AMBER,fontSize:9,fontWeight:800,letterSpacing:".12em",marginBottom:4}}>ASK THE COACH</div>
              <div style={{color:"#5A7090",fontSize:10.5,marginBottom:8}}>Any question. Answered in doctrine voice. No filler.</div>
              <VoiceArea rows={3} value={askQ}
                placeholder="What obstacle keeps showing up? Why can’t I close the gap? What am I not seeing?"
                onChange={setAskQ} dark/>
              <div className="flex justify-end mt-2">
                <CoachBtn onClick={askCoach} loading={askL} label="ASK →"/>
              </div>
              {(askL||askA)&&<AICard text={askA} loading={askL} label="Coach Response"/>}
            </div>
          </div>

          <div style={{border:`1px solid ${LINE}`,borderRadius:3,overflow:"hidden"}}>
            <div className="px-4 py-2" style={{background:NAVY}}>
              <div style={{color:PAPER,fontSize:9.5,fontWeight:800,letterSpacing:".12em"}}>THE DOCTRINE</div>
            </div>
            {[
              ["Law of Awareness","\"Reality doesn’t deliver. Reality reveals.\" Affirmations condition your lens. Awareness reveals what was always there. You didn’t attract it — you conditioned yourself to see it."],
              ["The Jeep Effect","You signed the papers and suddenly Jeeps were everywhere. Nothing changed about the world. You changed. What else are you blind to right now?"],
              ["The 50/50 Paradox","\"We don’t make the right answers, we make our answers right.\" Rate the day AND your effort. They’re never the same number. The gap is the data."],
              ["REFUZE OS","Reset · Equip · Forward · Unique · monetiZe Value · Empower. This is the operating system."],
              ["A-A-A","Awareness → Alignment → Activation. In that order. Every time. You don’t hype yourself into change — you notice, align, then act."],
            ].map(([t,b])=>(
              <div key={t} className="px-4 py-3" style={{borderTop:`1px solid ${LINE}`,background:"#fff"}}>
                <div style={{color:NAVY,fontWeight:800,fontSize:12,marginBottom:3}}>{t}</div>
                <div style={{color:GRAY,fontSize:11.5,lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </main>
      )}

      <div className="max-w-xl mx-auto px-4 mt-10 text-center">
        <div style={{...stripes,height:8,opacity:.45}}/>
        <div style={{fontSize:9.5,color:GRAY,marginTop:6,letterSpacing:".12em"}}>REFUZE · YNOT.LIFE · THE 1 MONTH JOURNEY v3</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </div>
  );
}
