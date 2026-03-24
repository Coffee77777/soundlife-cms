
import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   SOUNDLIFE — Multi-Clinic Patient Management System
   Speech & Hearing Clinic · Internal CMS
   ══════════════════════════════════════════════════════════ */

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
document.head.appendChild(fontLink);

const styleEl = document.createElement("style");
styleEl.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#08090d;font-family:'DM Sans',sans-serif;}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:#0f111a;}
  ::-webkit-scrollbar-thumb{background:#2a2d3e;border-radius:99px;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#e84c3d !important;box-shadow:0 0 0 3px #e84c3d18 !important;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ticker{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
  .fadeUp{animation:fadeUp 0.45s cubic-bezier(.16,1,.3,1) both;}
  .fadeIn{animation:fadeIn 0.3s ease both;}
  .card-hover:hover{transform:translateY(-2px);box-shadow:0 16px 48px #0009!important;}
  .card-hover{transition:transform 0.2s,box-shadow 0.2s;}
  .row-hover:hover{background:#0f111c!important;}
  .sidebar-link:hover{background:#12141f!important;color:#f5c842!important;}
  .rec-card:hover{border-color:#e84c3d!important;transform:scale(1.03);}
  .btn-main:hover{opacity:0.88;box-shadow:0 0 28px #e84c3d44;}
  .btn-main{transition:all 0.2s;}
`;
document.head.appendChild(styleEl);

// ─── HEARING QUOTES ──────────────────────────────────────────────────────────
const QUOTES = [
  { q: "I told my hearing aid it needed to listen more carefully. It said it didn't hear the complaint.", a: "— Sound advice" },
  { q: "Life is too short to say 'What?' twice. Come on in.", a: "— SoundLife Clinics" },
  { q: "Ears: the only organ that never takes a day off — until they do. That's where we come in.", a: "— SoundLife Team" },
  { q: "The world sounds better when you can hear all of it. We're here to prove it.", a: "— SoundLife Mission" },
  { q: "Beethoven composed his 9th Symphony completely deaf. Imagine what he could've done with a good audiologist.", a: "— Sound Perspective" },
  { q: "Hearing aids: because some conversations are just too good to miss — especially gossip.", a: "— SoundLife Wisdom" },
  { q: "Fun fact: Your ears never close. Even when you sleep they're listening. Let's make sure they hear everything beautifully.", a: "— SoundLife Science" },
  { q: "They say music soothes the soul. We make sure you never miss a note.", a: "— SoundLife Promise" },
];

// ─── ALL CLINICS & USERS ─────────────────────────────────────────────────────
const CLINICS = {
  // Ahmedabad
  shyamal:     { label:"Shyamal",      city:"Ahmedabad", region:"Gujarat",       color:"#e84c3d", light:"#e84c3d18" },
  sciencecity: { label:"Science City", city:"Ahmedabad", region:"Gujarat",       color:"#f5a623", light:"#f5a62318" },
  maninagar:   { label:"Maninagar",    city:"Ahmedabad", region:"Gujarat",       color:"#f59e0b", light:"#f59e0b18" },
  bapunagar:   { label:"Bapunagar",    city:"Ahmedabad", region:"Gujarat",       color:"#10b981", light:"#10b98118" },
  gopal:       { label:"Gopal",        city:"Ahmedabad", region:"Gujarat",       color:"#06b6d4", light:"#06b6d418" },
  naroda:      { label:"Naroda",       city:"Ahmedabad", region:"Gujarat",       color:"#8b5cf6", light:"#8b5cf618" },
  naranpura:   { label:"Naranpura",    city:"Ahmedabad", region:"Gujarat",       color:"#ec4899", light:"#ec489918" },
  chandkheda:  { label:"Chandkheda",   city:"Ahmedabad", region:"Gujarat",       color:"#14b8a6", light:"#14b8a618" },
  wadaj:       { label:"Wadaj",        city:"Ahmedabad", region:"Gujarat",       color:"#f97316", light:"#f9731618" },
  // Vadodara
  lalbagh:     { label:"Lalbagh",      city:"Vadodara",  region:"Gujarat",       color:"#a855f7", light:"#a855f718" },
  alkapuri:    { label:"Alkapuri",     city:"Vadodara",  region:"Gujarat",       color:"#6366f1", light:"#6366f118" },
  // Single cities
  anand:       { label:"Anand",        city:"Anand",     region:"Gujarat",       color:"#22c55e", light:"#22c55e18" },
  nadiad:      { label:"Nadiad",       city:"Nadiad",    region:"Gujarat",       color:"#84cc16", light:"#84cc1618" },
  bhuj:        { label:"Bhuj",         city:"Bhuj",      region:"Gujarat",       color:"#eab308", light:"#eab30818" },
  vapi:        { label:"Vapi",         city:"Vapi",      region:"Gujarat",       color:"#f43f5e", light:"#f43f5e18" },
  rajkot:      { label:"Rajkot",       city:"Rajkot",    region:"Gujarat",       color:"#0ea5e9", light:"#0ea5e918" },
  bharuch:     { label:"Bharuch",      city:"Bharuch",   region:"Gujarat",       color:"#d946ef", light:"#d946ef18" },
  // Bengaluru
  indiranagar: { label:"Indiranagar",  city:"Bengaluru", region:"Karnataka",     color:"#fb923c", light:"#fb923c18" },
  yelahanka:   { label:"Yelahanka",    city:"Bengaluru", region:"Karnataka",     color:"#a3e635", light:"#a3e63518" },
  // Mumbai
  juhu:        { label:"Juhu",         city:"Mumbai",    region:"Maharashtra",   color:"#38bdf8", light:"#38bdf818" },
  versova:     { label:"Versova",      city:"Mumbai",    region:"Maharashtra",   color:"#fb7185", light:"#fb718518" },
  dadar:       { label:"Dadar",        city:"Mumbai",    region:"Maharashtra",   color:"#34d399", light:"#34d39918" },
  // Odisha
  bhubaneswar: { label:"Bhubaneswar",  city:"Bhubaneswar",region:"Odisha",      color:"#c084fc", light:"#c084fc18" },
};

// Regions for grouping
const REGIONS = {
  "Ahmedabad":   ["shyamal","sciencecity","maninagar","bapunagar","gopal","naroda","naranpura","chandkheda","wadaj"],
  "Vadodara":    ["lalbagh","alkapuri"],
  "Gujarat":     ["anand","nadiad","bhuj","vapi","rajkot","bharuch"],
  "Karnataka":   ["indiranagar","yelahanka"],
  "Maharashtra": ["juhu","versova","dadar"],
  "Odisha":      ["bhubaneswar"],
};

// ─── CREDENTIALS (MIS admin sees all; clinic users see own only) ──────────────
// Passwords are intentionally complex and NOT shown on login page.
const USERS = {
  // MIS
  "sl-mis":        { password:"SL@MIS2025#Admin",  role:"mis",    name:"MIS Admin",          clinic:null,         clinicLabel:"All Clinics" },
  // Ahmedabad
  "sl-shyamal":    { password:"SHY@Sound24!",       role:"clinic", name:"Shyamal Staff",       clinic:"shyamal",    clinicLabel:"Shyamal · Ahmedabad" },
  "sl-scity":      { password:"SCI@Sound24!",       role:"clinic", name:"Science City Staff",  clinic:"sciencecity",clinicLabel:"Science City · Ahmedabad" },
  "sl-maninagar":  { password:"MAN@Sound24!",       role:"clinic", name:"Maninagar Staff",     clinic:"maninagar",  clinicLabel:"Maninagar · Ahmedabad" },
  "sl-bapunagar":  { password:"BAP@Sound24!",       role:"clinic", name:"Bapunagar Staff",     clinic:"bapunagar",  clinicLabel:"Bapunagar · Ahmedabad" },
  "sl-gopal":      { password:"GOP@Sound24!",       role:"clinic", name:"Gopal Staff",         clinic:"gopal",      clinicLabel:"Gopal · Ahmedabad" },
  "sl-naroda":     { password:"NAR@Sound24!",       role:"clinic", name:"Naroda Staff",        clinic:"naroda",     clinicLabel:"Naroda · Ahmedabad" },
  "sl-naranpura":  { password:"NRN@Sound24!",       role:"clinic", name:"Naranpura Staff",     clinic:"naranpura",  clinicLabel:"Naranpura · Ahmedabad" },
  "sl-chandkheda": { password:"CKH@Sound24!",       role:"clinic", name:"Chandkheda Staff",    clinic:"chandkheda", clinicLabel:"Chandkheda · Ahmedabad" },
  "sl-wadaj":      { password:"WAD@Sound24!",       role:"clinic", name:"Wadaj Staff",         clinic:"wadaj",      clinicLabel:"Wadaj · Ahmedabad" },
  // Vadodara
  "sl-lalbagh":    { password:"LAL@Sound24!",       role:"clinic", name:"Lalbagh Staff",       clinic:"lalbagh",    clinicLabel:"Lalbagh · Vadodara" },
  "sl-alkapuri":   { password:"ALK@Sound24!",       role:"clinic", name:"Alkapuri Staff",      clinic:"alkapuri",   clinicLabel:"Alkapuri · Vadodara" },
  // Gujarat Singles
  "sl-anand":      { password:"AND@Sound24!",       role:"clinic", name:"Anand Staff",         clinic:"anand",      clinicLabel:"Anand" },
  "sl-nadiad":     { password:"NDI@Sound24!",       role:"clinic", name:"Nadiad Staff",        clinic:"nadiad",     clinicLabel:"Nadiad" },
  "sl-bhuj":       { password:"BHJ@Sound24!",       role:"clinic", name:"Bhuj Staff",          clinic:"bhuj",       clinicLabel:"Bhuj" },
  "sl-vapi":       { password:"VAP@Sound24!",       role:"clinic", name:"Vapi Staff",          clinic:"vapi",       clinicLabel:"Vapi" },
  "sl-rajkot":     { password:"RJK@Sound24!",       role:"clinic", name:"Rajkot Staff",        clinic:"rajkot",     clinicLabel:"Rajkot" },
  "sl-bharuch":    { password:"BHR@Sound24!",       role:"clinic", name:"Bharuch Staff",       clinic:"bharuch",    clinicLabel:"Bharuch" },
  // Karnataka
  "sl-indiranagar":{ password:"IND@Sound24!",       role:"clinic", name:"Indiranagar Staff",   clinic:"indiranagar",clinicLabel:"Indiranagar · Bengaluru" },
  "sl-yelahanka":  { password:"YLK@Sound24!",       role:"clinic", name:"Yelahanka Staff",     clinic:"yelahanka",  clinicLabel:"Yelahanka · Bengaluru" },
  // Mumbai
  "sl-juhu":       { password:"JHU@Sound24!",       role:"clinic", name:"Juhu Staff",          clinic:"juhu",       clinicLabel:"Juhu · Mumbai" },
  "sl-versova":    { password:"VRS@Sound24!",       role:"clinic", name:"Versova Staff",       clinic:"versova",    clinicLabel:"Versova · Mumbai" },
  "sl-dadar":      { password:"DDR@Sound24!",       role:"clinic", name:"Dadar Staff",         clinic:"dadar",      clinicLabel:"Dadar · Mumbai" },
  // Odisha
  "sl-bhubaneswar":{ password:"BBS@Sound24!",       role:"clinic", name:"Bhubaneswar Staff",   clinic:"bhubaneswar",clinicLabel:"Bhubaneswar · Odisha" },
};

function genCode(cid) {
  const p = cid.slice(0,3).toUpperCase();
  return `${p}-${Math.floor(100000+Math.random()*900000)}`;
}

// ─── STORE ───────────────────────────────────────────────────────────────────
function useStore() {
  const [patients, setPatients] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("sl_patients")||"[]"); }catch{ return []; } });
  const persist = d => { setPatients(d); localStorage.setItem("sl_patients", JSON.stringify(d)); };
  const addPatient = d => { const p={...d,id:genCode(d.clinicId),createdAt:new Date().toISOString(),records:[],visits:[]}; persist([...patients,p]); return p; };
  const addRecord = (pid,rec) => persist(patients.map(p=>p.id===pid?{...p,records:[...(p.records||[]),{...rec,ts:new Date().toISOString(),rid:Date.now().toString()}]}:p));
  const deleteRecord = (pid,rid) => persist(patients.map(p=>p.id===pid?{...p,records:(p.records||[]).filter(r=>r.rid!==rid)}:p));
  const addVisit = (pid,v) => persist(patients.map(p=>p.id===pid?{...p,visits:[...(p.visits||[]),{...v,ts:new Date().toISOString(),vid:Date.now().toString()}]}:p));
  const searchPhone = (q,cid) => patients.filter(p=>p.phone.includes(q)&&(!cid||p.clinicId===cid));
  const searchCode  = (q,cid) => patients.filter(p=>p.id.toLowerCase().includes(q.toLowerCase())&&(!cid||p.clinicId===cid));
  const searchName  = (q,cid) => patients.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())&&(!cid||p.clinicId===cid));
  return { patients, addPatient, addRecord, deleteRecord, addVisit, searchPhone, searchCode, searchName };
}

// ══════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════
export default function App() {
  const [user,setUser] = useState(null);
  const store = useStore();
  const login = (u,pw) => { const usr=USERS[u]; if(usr&&usr.password===pw){ setUser({...usr,username:u}); return true; } return false; };
  const logout = () => setUser(null);
  if (!user) return <Login onLogin={login}/>;
  if (user.role==="mis") return <MIS user={user} store={store} onLogout={logout}/>;
  return <Clinic user={user} store={store} onLogout={logout}/>;
}

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [u,setU]=useState(""); const [pw,setPw]=useState("");
  const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const [show,setShow]=useState(false);
  const quote = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];

  const go = () => {
    if(!u.trim()||!pw.trim()){ setErr("Please enter both username and password."); return; }
    setBusy(true); setErr("");
    setTimeout(()=>{ if(!onLogin(u.trim(),pw)){ setErr("Invalid credentials. Please contact your administrator."); } setBusy(false); },900);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"#08090d",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",position:"relative"}}>
      {/* Left panel – branding */}
      <div style={{flex:"0 0 48%",background:"linear-gradient(160deg,#0f0608 0%,#1a0505 40%,#0a0a0f 100%)",display:"flex",flexDirection:"column",padding:"52px 56px",position:"relative",overflow:"hidden"}}>
        {/* decorative rings */}
        <div style={{position:"absolute",top:-80,left:-80,width:420,height:420,borderRadius:"50%",border:"1px solid #e84c3d12"}}/>
        <div style={{position:"absolute",top:-40,left:-40,width:300,height:300,borderRadius:"50%",border:"1px solid #e84c3d18"}}/>
        <div style={{position:"absolute",bottom:-120,right:-80,width:500,height:500,borderRadius:"50%",border:"1px solid #f5a62308"}}/>
        {/* soundwave decoration */}
        <div style={{position:"absolute",bottom:60,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",gap:3,opacity:0.07}}>
          {[12,28,18,40,22,50,30,44,20,36,16,32,24,48,14,38,26,44,18,34].map((h,i)=>(
            <div key={i} style={{width:3,height:h,background:"#e84c3d",borderRadius:99}}/>
          ))}
        </div>

        {/* Logo */}
        <div style={{marginBottom:"auto"}}>
          <SoundLifeLogo size={54}/>
        </div>

        {/* Quote */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:11,color:"#e84c3d",fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",marginBottom:20}}>Today's Reflection</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#f0eaee",lineHeight:1.45,fontStyle:"italic",marginBottom:16}}>
            "{quote.q}"
          </div>
          <div style={{fontSize:12,color:"#8a5a5a",letterSpacing:0.5}}>{quote.a}</div>
        </div>

        {/* clinic count ticker */}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,#e84c3d40,transparent)"}}/>
          <div style={{fontSize:11,color:"#5a3535",letterSpacing:1}}>24 CLINICS · 6 STATES</div>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,transparent,#e84c3d40)"}}/>
        </div>
      </div>

      {/* Right panel – login form */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 56px",background:"#08090d",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#ffffff03 1px,transparent 1px),linear-gradient(90deg,#ffffff03 1px,transparent 1px)",backgroundSize:"44px 44px"}}/>
        <div className="fadeUp" style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>
          <div style={{marginBottom:36}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:"#f0eaee",letterSpacing:-0.5}}>Welcome back</div>
            <div style={{fontSize:13,color:"#4a3f3f",marginTop:6}}>Sign in to your SoundLife clinic portal</div>
          </div>

          <div style={{background:"#0d0a0a",border:"1px solid #2a1a1a",borderRadius:18,padding:"32px"}}>
            <label style={L.label}>Username</label>
            <input style={L.inp} value={u} onChange={e=>{setU(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&go()} placeholder="e.g. sl-shyamal" autoFocus autoComplete="username"/>

            <label style={{...L.label,marginTop:18}}>Password</label>
            <div style={{position:"relative"}}>
              <input style={{...L.inp,paddingRight:46}} type={show?"text":"password"} value={pw}
                onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter your password" autoComplete="current-password"/>
              <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a3535",cursor:"pointer",fontSize:14,lineHeight:1}}>
                {show?"🙈":"👁"}
              </button>
            </div>

            {err && <div style={{background:"#ff000018",border:"1px solid #ff000030",color:"#ff6b6b",borderRadius:10,padding:"10px 14px",fontSize:12,marginTop:14}}>{err}</div>}

            <button className="btn-main" onClick={go} disabled={busy}
              style={{marginTop:22,width:"100%",padding:"13px",background:busy?"#2a1a1a":"linear-gradient(135deg,#e84c3d,#c0392b)",border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {busy?<><span style={{width:14,height:14,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Verifying…</>:"Sign In →"}
            </button>

            <div style={{marginTop:22,padding:"14px",background:"#0a0707",borderRadius:10,border:"1px solid #1e1010",textAlign:"center"}}>
              <div style={{fontSize:11,color:"#3a2525"}}>For login credentials, contact your MIS administrator.</div>
              <div style={{fontSize:11,color:"#3a2525",marginTop:4}}>Credentials are issued individually to each clinic.</div>
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:24,fontSize:11,color:"#2a1a1a"}}>
            © {new Date().getFullYear()} SoundLife Speech & Hearing Clinic · All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SOUNDLIFE LOGO SVG ──────────────────────────────────────────────────────
function SoundLifeLogo({ size=48, dark=false }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {/* Waveform icon approximation */}
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        {[6,14,10,22,12,28,16,24,10,18,8].map((h,i)=>(
          <div key={i} style={{width:3,height:h,background:i<5?"#e84c3d":"#3aad5e",borderRadius:99}}/>
        ))}
      </div>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:size*0.55,lineHeight:1,letterSpacing:-0.5}}>
          <span style={{color:"#3aad5e",fontWeight:400}}>Sound</span><span style={{color:"#e84c3d"}}>Life</span><sup style={{fontSize:size*0.18,color:"#e84c3d"}}>®</sup>
        </div>
        <div style={{fontSize:size*0.18,color:"#8a5a5a",letterSpacing:1.5,textTransform:"uppercase",marginTop:1}}>speech & hearing clinic</div>
      </div>
    </div>
  );
}

// ─── SMALL LOGO for sidebar ──────────────────────────────────────────────────
function SLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{display:"flex",alignItems:"center",gap:1}}>
        {[4,9,6,14,8,18,10,15,7,11].map((h,i)=>(
          <div key={i} style={{width:2,height:h,background:i<4?"#e84c3d":"#3aad5e",borderRadius:99}}/>
        ))}
      </div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,lineHeight:1}}>
        <span style={{color:"#3aad5e"}}>Sound</span><span style={{color:"#e84c3d"}}>Life</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHELL
// ══════════════════════════════════════════════════════════
function Shell({ user, navItems, children, onLogout }) {
  const acl = user.clinic ? CLINICS[user.clinic]?.color : "#e84c3d";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#08090d",color:"#c8c0c0"}}>
      <aside style={{width:228,background:"#0a0707",borderRight:"1px solid #1a0f0f",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto"}}>
        <div style={{padding:"22px 18px 14px"}}>
          <SLogo/>
          <div style={{marginTop:12,background:acl+"18",border:`1px solid ${acl}28`,borderRadius:8,padding:"5px 10px",fontSize:10,color:acl,fontWeight:700,letterSpacing:0.8,lineHeight:1.4}}>
            {user.clinicLabel}
          </div>
        </div>
        <nav style={{flex:1,padding:"4px 10px",display:"flex",flexDirection:"column",gap:1}}>
          {navItems.map(item=>(
            <button key={item.id} className="sidebar-link" onClick={item.onClick}
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:9,border:"none",
                background:item.active?"#140a0a":"none",color:item.active?acl:"#5a4040",
                fontSize:12,cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"'DM Sans',sans-serif",
                borderLeft:item.active?`3px solid ${acl}`:"3px solid transparent",
                fontWeight:item.active?600:400,transition:"all 0.15s"}}>
              <span style={{fontSize:15,width:18,textAlign:"center",opacity:item.active?1:0.5}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge>0&&<span style={{background:acl+"28",color:acl,borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid #1a0f0f"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:acl,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>
              {user.name[0]}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"#c8c0c0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:10,color:"#3a2525"}}>{user.username}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"7px",background:"#140a0a",border:"1px solid #2a1a1a",borderRadius:7,color:"#5a4040",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ← Sign Out
          </button>
        </div>
      </aside>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"auto"}}>
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, sub, actions }) {
  return (
    <div style={{padding:"18px 26px",borderBottom:"1px solid #1a0f0f",background:"#0a0707",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:20}}>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#f0eaee",letterSpacing:-0.3}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"#4a3535",marginTop:1}}>{sub}</div>}
      </div>
      {actions&&<div style={{display:"flex",gap:8,alignItems:"center"}}>{actions}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MIS
// ══════════════════════════════════════════════════════════
function MIS({ user, store, onLogout }) {
  const [tab,setTab]=useState("overview");
  const [selected,setSelected]=useState(null);
  const [lightbox,setLightbox]=useState(null);

  const nav = [
    { id:"overview",  icon:"◈", label:"Overview",     active:tab==="overview",  onClick:()=>setTab("overview") },
    { id:"search",    icon:"⌕", label:"Search",        active:tab==="search",    onClick:()=>setTab("search") },
    { id:"all",       icon:"☰", label:"All Patients",  active:tab==="all",       onClick:()=>setTab("all"), badge:store.patients.length },
    { id:"gallery",   icon:"⬚", label:"Records Gallery",active:tab==="gallery",  onClick:()=>setTab("gallery") },
    { id:"analytics", icon:"◉", label:"Analytics",     active:tab==="analytics", onClick:()=>setTab("analytics") },
  ];

  return (
    <Shell user={user} navItems={nav} onLogout={onLogout}>
      {tab==="overview"  && <MISOverview  store={store} onSelect={setSelected} setLightbox={setLightbox}/>}
      {tab==="search"    && <GlobalSearch store={store} onSelect={setSelected} isMIS/>}
      {tab==="all"       && <AllPatients  store={store} onSelect={setSelected}/>}
      {tab==="gallery"   && <Gallery      store={store} setLightbox={setLightbox}/>}
      {tab==="analytics" && <Analytics    store={store}/>}
      {selected&&<PatientModal p={selected} store={store} onClose={()=>setSelected(null)} readOnly setLightbox={setLightbox}/>}
      {lightbox&&<Lightbox {...lightbox} onClose={()=>setLightbox(null)}/>}
    </Shell>
  );
}

function MISOverview({ store, onSelect, setLightbox }) {
  const total = store.patients.length;
  const totalRecs = store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const today = store.patients.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;

  // Region summary
  const regionSummary = Object.entries(REGIONS).map(([region,ids])=>({
    region, count: store.patients.filter(p=>ids.includes(p.clinicId)).length,
    clinics: ids.length,
  }));

  const recentImgs = store.patients.flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p}))).sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,8);

  return (
    <div>
      <TopBar title="SoundLife MIS" sub={`${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}`}/>
      <div style={{padding:"22px 26px"}}>
        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
          {[[total,"Total Patients","#e84c3d"],[totalRecs,"Total Records","#f5a623"],[Object.keys(CLINICS).length,"Active Clinics","#3aad5e"],[today,"Registered Today","#38bdf8"]].map(([v,l,c],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"#0d0a0a",border:`1px solid ${c}20`,borderTop:`3px solid ${c}`,borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontSize:28,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:11,color:"#5a4040",marginTop:5}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:18,marginBottom:18}}>
          {/* Region breakdown */}
          <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"18px 20px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:14,letterSpacing:0.3}}>Clinics by Region</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {regionSummary.map(r=>(
                <div key={r.region} style={{background:"#0a0707",borderRadius:10,padding:"10px 12px",border:"1px solid #1a0f0f"}}>
                  <div style={{fontSize:11,color:"#8a6060",fontWeight:600}}>{r.region}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:6}}>
                    <span style={{fontSize:20,fontWeight:800,color:"#e84c3d"}}>{r.count}</span>
                    <span style={{fontSize:10,color:"#5a4040"}}>{r.clinics} clinics</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent patients */}
          <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"18px 20px",overflow:"auto",maxHeight:280}}>
            <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:14}}>Recent Patients</div>
            {store.patients.length===0 && <Empty msg="No patients yet"/>}
            {[...store.patients].reverse().slice(0,6).map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
          </div>
        </div>

        {/* Recent uploads */}
        {recentImgs.length>0 && (
          <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"18px 20px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:14}}>Latest Record Images — Click to View Full</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
              {recentImgs.map(r=>(
                <RecCard key={r.rid} r={r} onView={()=>setLightbox({src:r.data,name:r.name,patient:r.patient})}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalSearch({ store, onSelect, isMIS }) {
  const [q,setQ]=useState(""); const [type,setType]=useState("phone"); const [res,setRes]=useState(null);
  const run=()=>{ if(!q.trim())return; const r=type==="phone"?store.searchPhone(q.trim(),null):type==="code"?store.searchCode(q.trim(),null):store.searchName(q.trim(),null); setRes(r); };
  return (
    <div>
      <TopBar title={isMIS?"Global Patient Search":"Search Patient"} sub={isMIS?"Search across all 24 clinics":""}/>
      <div style={{padding:"22px 26px",maxWidth:720}}>
        <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"22px"}}>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["phone","📱 Phone"],["code","🔢 Code"],["name","👤 Name"]].map(([t,l])=>(
              <button key={t} onClick={()=>setType(t)}
                style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${type===t?"#e84c3d":"#1e1010"}`,background:type===t?"#e84c3d18":"transparent",color:type===t?"#e84c3d":"#5a4040",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...L.inp,flex:1}} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()}
              placeholder={type==="phone"?"Mobile number…":type==="code"?"Case code e.g. SHY-123456…":"Patient name…"}/>
            <button className="btn-main" onClick={run} style={L.btn}>Search</button>
          </div>
          <div style={{marginTop:16}}>
            {res===null&&<div style={{color:"#3a2525",fontSize:12,textAlign:"center",padding:16}}>Enter a query above and press Search or Enter</div>}
            {res?.length===0&&<Empty msg="No patients found"/>}
            {res?.map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllPatients({ store, onSelect }) {
  const [filter,setFilter]=useState("all");
  const list = filter==="all"?store.patients:store.patients.filter(p=>p.clinicId===filter);
  const regionEntries = Object.entries(REGIONS);

  return (
    <div>
      <TopBar title="All Patients" sub={`${list.length} shown`}/>
      <div style={{padding:"22px 26px"}}>
        {/* Region filter */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:"#5a4040",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Filter by Clinic</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
            <FBtn active={filter==="all"} onClick={()=>setFilter("all")} color="#e84c3d">All Clinics</FBtn>
          </div>
          {regionEntries.map(([region,ids])=>(
            <div key={region} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <span style={{fontSize:10,color:"#5a4040",minWidth:80,fontWeight:600}}>{region}:</span>
              {ids.map(id=><FBtn key={id} active={filter===id} onClick={()=>setFilter(id)} color={CLINICS[id].color}>{CLINICS[id].label}</FBtn>)}
            </div>
          ))}
        </div>

        <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.3fr 1.2fr 1.4fr 0.7fr 1fr",padding:"10px 18px",background:"#0a0707",fontSize:9,fontWeight:700,color:"#4a3535",letterSpacing:1.2,textTransform:"uppercase",borderBottom:"1px solid #1e1010"}}>
            <div>Patient</div><div>Code</div><div>Phone</div><div>Clinic</div><div>Recs</div><div>Date</div>
          </div>
          {list.length===0&&<Empty msg="No patients found"/>}
          {[...list].reverse().map(p=>{
            const c=CLINICS[p.clinicId];
            return(
              <div key={p.id} className="row-hover" onClick={()=>onSelect(p)}
                style={{display:"grid",gridTemplateColumns:"2fr 1.3fr 1.2fr 1.4fr 0.7fr 1fr",padding:"11px 18px",borderTop:"1px solid #120808",cursor:"pointer",fontSize:12,alignItems:"center"}}>
                <div style={{fontWeight:600,color:"#c8c0c0"}}>{p.name}</div>
                <div><Cb code={p.id} color={c?.color}/></div>
                <div style={{color:"#6a5050"}}>{p.phone}</div>
                <div><span style={{background:c?.light,color:c?.color,padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label}·{c?.city}</span></div>
                <div style={{color:"#6a5050"}}>{p.records?.length||0}</div>
                <div style={{color:"#6a5050"}}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Gallery({ store, setLightbox }) {
  const [cFilter,setCFilter]=useState("all");
  const allImgs = store.patients
    .filter(p=>cFilter==="all"||p.clinicId===cFilter)
    .flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p})))
    .sort((a,b)=>new Date(b.ts)-new Date(a.ts));

  return (
    <div>
      <TopBar title="Records Gallery" sub={`${allImgs.length} images`}/>
      <div style={{padding:"22px 26px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          <FBtn active={cFilter==="all"} onClick={()=>setCFilter("all")} color="#e84c3d">All</FBtn>
          {Object.entries(CLINICS).map(([id,c])=><FBtn key={id} active={cFilter===id} onClick={()=>setCFilter(id)} color={c.color}>{c.label}</FBtn>)}
        </div>
        {allImgs.length===0&&<Empty msg="No images uploaded yet"/>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
          {allImgs.map(r=><RecCard key={r.rid} r={r} onView={()=>setLightbox({src:r.data,name:r.name,patient:r.patient})} showClinic/>)}
        </div>
      </div>
    </div>
  );
}

function Analytics({ store }) {
  const total=store.patients.length;
  const totalRecs=store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const regionData=Object.entries(REGIONS).map(([region,ids])=>({region,count:store.patients.filter(p=>ids.includes(p.clinicId)).length,color:"#e84c3d"}));
  const maxR=Math.max(...regionData.map(r=>r.count),1);
  const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return{label:d.toLocaleDateString("en-IN",{month:"short"}),count:store.patients.filter(p=>{const pd=new Date(p.createdAt);return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear();}).length};});
  const maxM=Math.max(...months.map(m=>m.count),1);

  return (
    <div>
      <TopBar title="Analytics" sub="System-wide statistics"/>
      <div style={{padding:"22px 26px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
          {[[total,"Total Patients"],[totalRecs,"Total Records"],[Object.keys(CLINICS).length,"Active Clinics"],[store.patients.filter(p=>{const d=new Date(p.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length,"This Month"]].map(([v,l],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"#0d0a0a",border:"1px solid #1e1010",borderTop:"3px solid #e84c3d",borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontSize:28,fontWeight:800,color:"#e84c3d"}}>{v}</div>
              <div style={{fontSize:11,color:"#5a4040",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"20px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:16}}>Patients by Region</div>
            {regionData.map((r,i)=>(
              <div key={r.region} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:"#8a6060"}}>{r.region}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#e84c3d"}}>{r.count}</span>
                </div>
                <div style={{background:"#120808",borderRadius:99,height:7}}>
                  <div style={{width:`${(r.count/maxR)*100}%`,background:"linear-gradient(90deg,#e84c3d,#c0392b)",height:"100%",borderRadius:99,transition:"width 1s cubic-bezier(.16,1,.3,1)",minWidth:r.count?4:0}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"20px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:16}}>Monthly Registrations (6 months)</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:130}}>
              {months.map(m=>(
                <div key={m.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  {m.count>0&&<div style={{fontSize:10,fontWeight:600,color:"#e84c3d"}}>{m.count}</div>}
                  <div style={{width:"100%",background:"linear-gradient(0deg,#e84c3d,#ff7060)",borderRadius:"5px 5px 0 0",height:`${Math.max((m.count/maxM)*100,3)}%`,minHeight:3,transition:"height 1s cubic-bezier(.16,1,.3,1)"}}/>
                  <div style={{fontSize:10,color:"#4a3535"}}>{m.label}</div>
                </div>
              ))}
            </div>
            {total===0&&<Empty msg="No data yet"/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CLINIC
// ══════════════════════════════════════════════════════════
function Clinic({ user, store, onLogout }) {
  const [tab,setTab]=useState("patients");
  const [selected,setSelected]=useState(null);
  const [lightbox,setLightbox]=useState(null);
  const myPts=store.patients.filter(p=>p.clinicId===user.clinic);
  const acl=CLINICS[user.clinic]?.color||"#e84c3d";

  const nav=[
    { id:"patients",icon:"♾",label:"Patients",    active:tab==="patients",onClick:()=>setTab("patients"),badge:myPts.length },
    { id:"search",  icon:"⌕",label:"Search",       active:tab==="search",  onClick:()=>setTab("search") },
    { id:"add",     icon:"+",label:"Add Patient",   active:tab==="add",     onClick:()=>setTab("add") },
  ];

  return (
    <Shell user={user} navItems={nav} onLogout={onLogout}>
      {tab==="patients"&&<ClinicPatients user={user} myPts={myPts} acl={acl} onSelect={setSelected} onAdd={()=>setTab("add")}/>}
      {tab==="search"  &&<GlobalSearch store={store} onSelect={setSelected} clinicId={user.clinic}/>}
      {tab==="add"     &&<AddPatient user={user} store={store} onDone={()=>setTab("patients")} onCancel={()=>setTab("patients")}/>}
      {selected&&<PatientModal p={selected} store={store} onClose={()=>setSelected(null)} setLightbox={setLightbox}/>}
      {lightbox&&<Lightbox {...lightbox} onClose={()=>setLightbox(null)}/>}
    </Shell>
  );
}

function ClinicPatients({ user, myPts, acl, onSelect, onAdd }) {
  const c=CLINICS[user.clinic];
  const totalRecs=myPts.reduce((a,p)=>a+(p.records?.length||0),0);
  const thisMonth=myPts.filter(p=>{const d=new Date(p.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length;
  return (
    <div>
      <TopBar title={user.clinicLabel} sub={`${c?.city} · ${c?.region}`}
        actions={<button className="btn-main" onClick={onAdd} style={L.btn}>+ New Patient</button>}/>
      <div style={{padding:"22px 26px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[[myPts.length,"Total Patients"],[totalRecs,"Records Uploaded"],[thisMonth,"This Month"]].map(([v,l],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.08}s`,background:"#0d0a0a",border:`1px solid ${acl}20`,borderTop:`3px solid ${acl}`,borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontSize:28,fontWeight:800,color:acl}}>{v}</div>
              <div style={{fontSize:11,color:"#5a4040",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#c8c0c0",marginBottom:12}}>Patients</div>
          {myPts.length===0&&<Empty msg="No patients yet — add your first patient!"/>}
          {[...myPts].reverse().map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
        </div>
      </div>
    </div>
  );
}

function AddPatient({ user, store, onDone, onCancel }) {
  const [f,setF]=useState({name:"",phone:"",age:"",gender:"Male",address:"",bloodGroup:"",notes:""});
  const [errs,setErrs]=useState({}); const [success,setSuccess]=useState(null);
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const validate=()=>{ const e={}; if(!f.name.trim())e.name="Required"; if(!/^\d{10}$/.test(f.phone))e.phone="Must be 10 digits"; if(!f.age||isNaN(f.age))e.age="Required"; return e; };
  const submit=()=>{ const e=validate(); if(Object.keys(e).length){setErrs(e);return;} const p=store.addPatient({...f,clinicId:user.clinic}); setSuccess(p); };

  if(success) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div className="fadeUp" style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:18,padding:"44px 38px",textAlign:"center",maxWidth:420,width:"100%"}}>
        <div style={{fontSize:52,marginBottom:10}}>✅</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#f0eaee",marginBottom:6}}>Patient Registered!</div>
        <div style={{color:"#5a4040",fontSize:12,marginBottom:22}}>Auto-generated Case Code:</div>
        <div style={{fontSize:34,fontWeight:800,color:"#e84c3d",letterSpacing:5,marginBottom:8,fontFamily:"monospace"}}>{success.id}</div>
        <div style={{color:"#4a3535",fontSize:11,marginBottom:28}}>Share this code with the patient for future records</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="btn-main" onClick={()=>setSuccess(null)} style={L.btn}>Add Another</button>
          <button onClick={onDone} style={L.btnG}>View Patients →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <TopBar title="Register New Patient" sub={user.clinicLabel}/>
      <div style={{padding:"22px 26px",maxWidth:660}}>
        <div style={{background:"#0d0a0a",border:"1px solid #1e1010",borderRadius:14,padding:"26px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
            {[{k:"name",l:"Full Name *",t:"text",ph:"Patient's full name"},{k:"phone",l:"Mobile Number *",t:"tel",ph:"10-digit number"},{k:"age",l:"Age *",t:"number",ph:"Age in years"},{k:"address",l:"Address",t:"text",ph:"Area / City"}].map(x=>(
              <div key={x.k} style={{marginBottom:16}}>
                <label style={L.label}>{x.l}</label>
                <input style={{...L.inp,...(errs[x.k]?{borderColor:"#e84c3d"}:{})}} type={x.t} placeholder={x.ph}
                  value={f[x.k]} onChange={e=>{set(x.k,e.target.value);setErrs(r=>({...r,[x.k]:undefined}));}}/>
                {errs[x.k]&&<div style={{color:"#ff6b6b",fontSize:10,marginTop:3}}>{errs[x.k]}</div>}
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <label style={L.label}>Gender</label>
              <select style={L.inp} value={f.gender} onChange={e=>set("gender",e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={L.label}>Blood Group</label>
              <select style={L.inp} value={f.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)}>
                <option value="">Select…</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16,gridColumn:"1/-1"}}>
              <label style={L.label}>Chief Complaint / Initial Notes</label>
              <textarea style={{...L.inp,minHeight:76,resize:"vertical"}} placeholder="Symptoms, presenting complaint…"
                value={f.notes} onChange={e=>set("notes",e.target.value)}/>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-main" onClick={submit} style={L.btn}>Register & Generate Code</button>
            <button onClick={onCancel} style={L.btnG}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT MODAL
// ══════════════════════════════════════════════════════════
function PatientModal({ p, store, onClose, readOnly, setLightbox }) {
  const [tab,setTab]=useState("info");
  const [visitNote,setVisitNote]=useState("");
  const fileRef=useRef(); const [busy,setBusy]=useState(false);
  const live=store.patients.find(x=>x.id===p.id)||p;
  const c=CLINICS[live.clinicId];

  const upload=e=>{
    const files=Array.from(e.target.files); if(!files.length) return;
    setBusy(true); let done=0;
    files.forEach(f=>{ const r=new FileReader(); r.onload=ev=>{ store.addRecord(live.id,{type:f.type.startsWith("image/")?"image":"document",name:f.name,data:ev.target.result}); done++; if(done===files.length)setBusy(false); }; r.readAsDataURL(f); });
  };

  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div style={{background:"#0d0a0a",border:`1px solid ${c?.color||"#e84c3d"}30`,borderRadius:18,width:"100%",maxWidth:720,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:`0 40px 100px #000000b0`}} onClick={e=>e.stopPropagation()}>
        {/* header */}
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e1010",background:"#0a0707",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:50,height:50,borderRadius:13,background:`linear-gradient(135deg,${c?.color||"#e84c3d"},${c?.color||"#e84c3d"}99)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20}}>
              {live.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:"#f0eaee"}}>{live.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                <Cb code={live.id} color={c?.color}/> 
                <span style={{background:c?.light,color:c?.color,padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label} · {c?.city}</span>
                {live.bloodGroup&&<span style={{background:"#ff000020",color:"#ff6b6b",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>🩸 {live.bloodGroup}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"#1a0f0f",border:"1px solid #2a1a1a",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer",color:"#6a5050",flexShrink:0}}>✕</button>
        </div>
        {/* tabs */}
        <div style={{display:"flex",borderBottom:"1px solid #1e1010",background:"#0a0707",padding:"0 22px",gap:4}}>
          {["info","records","visits"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"11px 14px",background:"none",border:"none",borderBottom:`2px solid ${tab===t?(c?.color||"#e84c3d"):"transparent"}`,color:tab===t?(c?.color||"#e84c3d"):"#5a4040",fontSize:12,cursor:"pointer",fontWeight:tab===t?700:400,fontFamily:"'DM Sans',sans-serif",marginBottom:-1,transition:"all 0.2s"}}>
              {t==="records"?`Records (${live.records?.length||0})`:t==="visits"?`Visits (${live.visits?.length||0})`:"Patient Info"}
            </button>
          ))}
        </div>
        {/* body */}
        <div style={{flex:1,overflow:"auto",padding:"20px 22px"}}>
          {tab==="info"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Full Name",live.name],["Mobile",live.phone],["Age",live.age?`${live.age} yrs`:"—"],["Gender",live.gender||"—"],["Blood Group",live.bloodGroup||"—"],["Address",live.address||"—"],["Clinic",c?.label],["City",c?.city],["Case Code",live.id],["Registered",new Date(live.createdAt).toLocaleDateString("en-IN")]].map(([k,v])=>(
                <div key={k} style={{background:"#0a0707",border:"1px solid #1a0f0f",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"#4a3535",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#c8c0c0",marginTop:4}}>{v}</div>
                </div>
              ))}
              {live.notes&&(
                <div style={{gridColumn:"1/-1",background:"#0a0707",border:"1px solid #1a0f0f",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"#4a3535",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>Initial Notes</div>
                  <div style={{fontSize:12,color:"#8a7070",lineHeight:1.6}}>{live.notes}</div>
                </div>
              )}
            </div>
          )}
          {tab==="records"&&(
            <div>
              {!readOnly&&(
                <div style={{marginBottom:14}}>
                  <button className="btn-main" onClick={()=>fileRef.current.click()} disabled={busy} style={L.btn}>
                    {busy?"Uploading…":"📎 Upload Image / Report"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple style={{display:"none"}} onChange={upload}/>
                </div>
              )}
              {(!live.records||live.records.length===0)&&<Empty msg="No records uploaded yet"/>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
                {(live.records||[]).map(r=>(
                  <div key={r.rid} className="rec-card" style={{borderRadius:11,overflow:"hidden",border:"1px solid #1e1010",background:"#0a0707",cursor:r.type==="image"?"pointer":"default",transition:"all 0.2s"}}
                    onClick={()=>r.type==="image"&&setLightbox({src:r.data,name:r.name})}>
                    {r.type==="image"
                      ? <img src={r.data} style={{width:"100%",height:115,objectFit:"cover",display:"block"}} alt={r.name}/>
                      : <div style={{height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:26,color:"#4a3535"}}>📄<div style={{fontSize:10,color:"#3a2525",marginTop:5,textAlign:"center",padding:"0 6px"}}>{r.name}</div></div>}
                    <div style={{padding:"7px 9px",borderTop:"1px solid #1a0f0f"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"#8a7070",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                      <div style={{fontSize:9,color:"#4a3535",marginTop:2}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div>
                    </div>
                    {!readOnly&&<button onClick={e=>{e.stopPropagation();store.deleteRecord(live.id,r.rid);}} style={{width:"100%",padding:"5px",background:"#200808",border:"none",borderTop:"1px solid #1e1010",color:"#884444",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Remove</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="visits"&&(
            <div>
              {!readOnly&&(
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <textarea style={{...L.inp,flex:1,minHeight:54,resize:"vertical"}} placeholder="Log visit note / diagnosis update…" value={visitNote} onChange={e=>setVisitNote(e.target.value)}/>
                  <button className="btn-main" onClick={()=>{if(!visitNote.trim())return;store.addVisit(live.id,{note:visitNote});setVisitNote("");}} style={{...L.btn,alignSelf:"flex-end",whiteSpace:"nowrap"}}>+ Log</button>
                </div>
              )}
              {(!live.visits||live.visits.length===0)&&<Empty msg="No visit logs yet"/>}
              {[...(live.visits||[])].reverse().map(v=>(
                <div key={v.vid} style={{background:"#0a0707",border:"1px solid #1a0f0f",borderRadius:9,padding:"11px 14px",marginBottom:8}}>
                  <div style={{fontSize:9,color:"#4a3535",marginBottom:5}}>{new Date(v.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  <div style={{fontSize:12,color:"#8a7070",lineHeight:1.6}}>{v.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LIGHTBOX — full screen with zoom/pan/download
// ══════════════════════════════════════════════════════════
function Lightbox({ src, name, patient, onClose }) {
  const [zoom,setZoom]=useState(1);
  const [pos,setPos]=useState({x:0,y:0});
  const drag=useRef(null);
  useEffect(()=>{ const h=e=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[]);
  const onWheel=e=>{ e.preventDefault(); setZoom(z=>Math.min(Math.max(z-e.deltaY*0.002,0.3),5)); };
  const onMD=e=>{ drag.current={x:e.clientX-pos.x,y:e.clientY-pos.y}; };
  const onMM=e=>{ if(!drag.current)return; setPos({x:e.clientX-drag.current.x,y:e.clientY-drag.current.y}); };
  const onMU=()=>{ drag.current=null; };

  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:500,background:"#000000f2",display:"flex",flexDirection:"column",backdropFilter:"blur(10px)"}} onClick={onClose}>
      <div style={{padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a0707",borderBottom:"1px solid #1e1010",flexShrink:0}} onClick={e=>e.stopPropagation()}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#c8c0c0"}}>{name}</div>
          {patient&&<div style={{fontSize:10,color:"#5a4040",marginTop:2}}>{patient.name} · {CLINICS[patient.clinicId]?.label}</div>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setZoom(z=>Math.max(z-0.25,0.3))} style={L.iconBtn}>−</button>
          <span style={{fontSize:11,color:"#5a4040",minWidth:38,textAlign:"center"}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(z+0.25,5))} style={L.iconBtn}>+</button>
          <button onClick={()=>{setZoom(1);setPos({x:0,y:0});}} style={L.iconBtn} title="Reset">⟳</button>
          <a href={src} download={name} style={{...L.iconBtn,textDecoration:"none",color:"#c8c0c0",display:"inline-flex",alignItems:"center"}} onClick={e=>e.stopPropagation()}>⬇ Save</a>
          <button onClick={onClose} style={{...L.iconBtn,marginLeft:6}}>✕ Close</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative",cursor:zoom>1?"grab":"zoom-in"}}
        onClick={e=>{e.stopPropagation();if(zoom===1)setZoom(2);}} onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}>
        <img src={src} alt={name}
          style={{position:"absolute",top:"50%",left:"50%",transform:`translate(calc(-50% + ${pos.x}px),calc(-50% + ${pos.y}px)) scale(${zoom})`,maxWidth:"92vw",maxHeight:"82vh",objectFit:"contain",borderRadius:8,boxShadow:"0 24px 70px #000",transition:drag.current?"none":"transform 0.2s",userSelect:"none",pointerEvents:"none"}}/>
      </div>
      <div style={{textAlign:"center",padding:"8px",fontSize:10,color:"#2a1a1a",background:"#0a0707"}}>Click image to zoom · Scroll to zoom · Drag to pan · Esc to close</div>
    </div>
  );
}

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
function PRow({ p, onClick }) {
  const c=CLINICS[p.clinicId];
  return (
    <div className="row-hover" onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",marginBottom:5,background:"#0a0707",border:"1px solid #180e0e",transition:"background 0.15s"}}>
      <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${c?.color||"#e84c3d"},${c?.color||"#e84c3d"}99)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>
        {p.name?.[0]?.toUpperCase()}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,color:"#c8c0c0",fontSize:12}}>{p.name}</div>
        <div style={{fontSize:10,color:"#5a4040",marginTop:1}}>📱 {p.phone} · {c?.label}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <Cb code={p.id} color={c?.color}/>
        <div style={{fontSize:9,color:"#4a3535",marginTop:3}}>{p.records?.length||0} records</div>
      </div>
    </div>
  );
}

function RecCard({ r, onView, showClinic }) {
  const c=r.patient?CLINICS[r.patient.clinicId]:null;
  return (
    <div className="rec-card" onClick={onView}
      style={{borderRadius:12,overflow:"hidden",border:"1px solid #1e1010",cursor:"pointer",background:"#0a0707",transition:"all 0.2s"}}>
      <div style={{position:"relative"}}>
        <img src={r.data} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} alt={r.name}/>
        {showClinic&&c&&<div style={{position:"absolute",top:7,right:7,background:c.color+"ee",borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#fff"}}>{c.label}</div>}
        <div style={{position:"absolute",inset:0,background:"#00000000",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#00000080",borderRadius:99,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.2s",fontSize:16}} className="view-icon">🔍</div>
        </div>
      </div>
      <div style={{padding:"8px 10px"}}>
        {r.patient&&<div style={{fontSize:11,fontWeight:600,color:"#c8c0c0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.patient.name}</div>}
        <div style={{fontSize:9,color:"#4a3535",marginTop:2}}>{r.name}</div>
        <div style={{fontSize:9,color:"#3a2525",marginTop:1}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div>
      </div>
    </div>
  );
}

function Cb({ code, color="#e84c3d" }) {
  return <span style={{background:color+"20",color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:0.5,fontFamily:"monospace"}}>{code}</span>;
}

function FBtn({ active, onClick, children, color="#e84c3d" }) {
  return <button onClick={onClick} style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${active?color:"#1e1010"}`,background:active?color+"18":"transparent",color:active?color:"#5a4040",fontSize:10,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>{children}</button>;
}

function Empty({ msg }) {
  return <div style={{color:"#3a2525",fontSize:12,textAlign:"center",padding:"22px 0"}}>{msg}</div>;
}

const L = {
  label: { fontSize:10,fontWeight:700,color:"#5a4040",letterSpacing:0.8,display:"block",marginBottom:6,textTransform:"uppercase" },
  inp:   { width:"100%",padding:"10px 13px",background:"#0a0707",border:"1px solid #2a1a1a",borderRadius:9,color:"#c8c0c0",fontSize:12,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" },
  btn:   { padding:"10px 20px",background:"linear-gradient(135deg,#e84c3d,#c0392b)",border:"none",borderRadius:9,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap" },
  btnG:  { padding:"10px 20px",background:"transparent",border:"1px solid #2a1a1a",borderRadius:9,color:"#6a5050",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" },
  iconBtn:{ padding:"6px 11px",background:"#120808",border:"1px solid #2a1a1a",borderRadius:7,color:"#c8c0c0",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" },
};
