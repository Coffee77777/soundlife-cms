import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   SOUNDLIFE — Multi-Clinic Patient Management System
   Speech & Hearing Clinic · Internal CMS v3.0
   ══════════════════════════════════════════════════════════ */

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
document.head.appendChild(fontLink);

// ─── CSS VARIABLES + FULL THEME SYSTEM ───────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}

  /* ── LIGHT THEME (default) ── */
  :root {
    --bg:        #f4f3ff;
    --bg2:       #ffffff;
    --bg3:       #ede9fe;
    --border:    #ddd6fe;
    --border2:   #c4b5fd;
    --text1:     #1e1b4b;
    --text2:     #4c1d95;
    --text3:     #7c3aed;
    --muted:     #8b7ec8;
    --muted2:    #a89fd4;
    --accent:    #7c3aed;
    --accent2:   #6d28d9;
    --accentbg:  #ede9fe;
    --accentbg2: #ddd6fe;
    --danger:    #e84c3d;
    --green:     #059669;
    --sidebar:   #ffffff;
    --sideborder:#ede9fe;
    --topbar:    #ffffff;
    --card:      #ffffff;
    --cardborder:#e9e3ff;
    --cardshadow: 0 2px 12px #7c3aed12;
    --rowhover:  #f5f3ff;
    --inputbg:   #faf9ff;
    --scrolltrack: #ede9fe;
    --scrollthumb: #c4b5fd;
  }

  /* ── DARK THEME ── */
  [data-theme="dark"] {
    --bg:        #0d0b1a;
    --bg2:       #120f22;
    --bg3:       #1a1530;
    --border:    #2a2250;
    --border2:   #3d3070;
    --text1:     #e8e4ff;
    --text2:     #c4b5fd;
    --text3:     #a78bfa;
    --muted:     #6d5fa8;
    --muted2:    #4a3d7a;
    --accent:    #8b5cf6;
    --accent2:   #7c3aed;
    --accentbg:  #1e1540;
    --accentbg2: #2d2060;
    --danger:    #f87171;
    --green:     #34d399;
    --sidebar:   #0d0b1a;
    --sideborder:#1e1a38;
    --topbar:    #120f22;
    --card:      #120f22;
    --cardborder:#2a2250;
    --cardshadow: 0 2px 20px #00000040;
    --rowhover:  #1a1535;
    --inputbg:   #0d0b1a;
    --scrolltrack: #1a1535;
    --scrollthumb: #3d3070;
  }

  body {
    background: var(--bg);
    color: var(--text1);
    font-family: 'DM Sans', sans-serif;
    transition: background 0.3s, color 0.3s;
  }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:var(--scrolltrack);}
  ::-webkit-scrollbar-thumb{background:var(--scrollthumb);border-radius:99px;}

  input,select,textarea {
    background: var(--inputbg) !important;
    color: var(--text1) !important;
    border: 1px solid var(--border) !important;
  }
  input:focus,select:focus,textarea:focus {
    outline: none !important;
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accentbg2) !important;
  }

  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .fadeUp{animation:fadeUp 0.4s cubic-bezier(.16,1,.3,1) both;}
  .fadeIn{animation:fadeIn 0.25s ease both;}
  .card-hover{transition:transform 0.2s,box-shadow 0.2s;}
  .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 32px #7c3aed22 !important;}
  .row-hover{transition:background 0.12s;}
  .row-hover:hover{background:var(--rowhover) !important;}
  .slink:hover{background:var(--accentbg) !important; color:var(--accent) !important;}
  .rec-card{transition:all 0.18s;cursor:pointer;}
  .rec-card:hover{border-color:var(--accent) !important;transform:scale(1.02);}
  .btn-p{transition:all 0.18s;}
  .btn-p:hover{opacity:0.88;box-shadow:0 4px 20px #7c3aed44;}

  @media(max-width:768px){
    .sidebar-full{width:64px !important;}
    .sidebar-label{display:none !important;}
    .main-pad{padding:14px !important;}
    .grid-3{grid-template-columns:1fr !important;}
    .grid-2{grid-template-columns:1fr !important;}
    .table-row{grid-template-columns:1fr 1fr !important;}
  }
`;
document.head.appendChild(styleEl);

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const QUOTES = [
  { q:"I told my hearing aid it needed to listen more carefully. It said it didn't hear the complaint.", a:"— Sound Advice" },
  { q:"Life is too short to say 'What?' twice. Come on in.", a:"— SoundLife Clinics" },
  { q:"Ears: the only organ that never takes a day off — until they do. That's where we come in.", a:"— SoundLife Team" },
  { q:"The world sounds better when you can hear all of it. We're here to prove it.", a:"— SoundLife Mission" },
  { q:"Beethoven composed his 9th Symphony completely deaf. Imagine what he could've done with a good audiologist.", a:"— Sound Perspective" },
  { q:"Hearing aids: because some conversations are just too good to miss — especially the gossip.", a:"— SoundLife Wisdom" },
  { q:"Your ears never close, even when you sleep. Let's make sure they hear everything beautifully.", a:"— SoundLife Science" },
  { q:"They say music soothes the soul. We make sure you never miss a single note.", a:"— SoundLife Promise" },
];

// ─── CLINICS ──────────────────────────────────────────────────────────────────
const CLINICS = {
  shyamal:      { label:"Shyamal",       city:"Ahmedabad",   region:"Ahmedabad",   color:"#7c3aed" },
  sciencecity:  { label:"Science City",  city:"Ahmedabad",   region:"Ahmedabad",   color:"#6d28d9" },
  maninagar:    { label:"Maninagar",     city:"Ahmedabad",   region:"Ahmedabad",   color:"#8b5cf6" },
  bapunagar:    { label:"Bapunagar",     city:"Ahmedabad",   region:"Ahmedabad",   color:"#7c3aed" },
  gopal:        { label:"Gopal",         city:"Ahmedabad",   region:"Ahmedabad",   color:"#6d28d9" },
  naroda:       { label:"Naroda",        city:"Ahmedabad",   region:"Ahmedabad",   color:"#8b5cf6" },
  naranpura:    { label:"Naranpura",     city:"Ahmedabad",   region:"Ahmedabad",   color:"#7c3aed" },
  chandkheda:   { label:"Chandkheda",    city:"Ahmedabad",   region:"Ahmedabad",   color:"#6d28d9" },
  wadaj:        { label:"Wadaj",         city:"Ahmedabad",   region:"Ahmedabad",   color:"#8b5cf6" },
  lalbagh:      { label:"Lalbagh",       city:"Vadodara",    region:"Vadodara",    color:"#7c3aed" },
  alkapuri:     { label:"Alkapuri",      city:"Vadodara",    region:"Vadodara",    color:"#6d28d9" },
  anand:        { label:"Anand",         city:"Anand",       region:"Gujarat",     color:"#059669" },
  nadiad:       { label:"Nadiad",        city:"Nadiad",      region:"Gujarat",     color:"#0891b2" },
  bhuj:         { label:"Bhuj",          city:"Bhuj",        region:"Gujarat",     color:"#b45309" },
  vapi:         { label:"Vapi",          city:"Vapi",        region:"Gujarat",     color:"#be185d" },
  rajkot:       { label:"Rajkot",        city:"Rajkot",      region:"Gujarat",     color:"#0369a1" },
  bharuch:      { label:"Bharuch",       city:"Bharuch",     region:"Gujarat",     color:"#7c3aed" },
  indiranagar:  { label:"Indiranagar",   city:"Bengaluru",   region:"Karnataka",   color:"#ea580c" },
  yelahanka:    { label:"Yelahanka",     city:"Bengaluru",   region:"Karnataka",   color:"#16a34a" },
  juhu:         { label:"Juhu",          city:"Mumbai",      region:"Maharashtra", color:"#0284c7" },
  versova:      { label:"Versova",       city:"Mumbai",      region:"Maharashtra", color:"#db2777" },
  dadar:        { label:"Dadar",         city:"Mumbai",      region:"Maharashtra", color:"#059669" },
  bhubaneswar:  { label:"Bhubaneswar",   city:"Bhubaneswar", region:"Odisha",      color:"#7c3aed" },
};

const REGIONS = {
  "Ahmedabad":   ["shyamal","sciencecity","maninagar","bapunagar","gopal","naroda","naranpura","chandkheda","wadaj"],
  "Vadodara":    ["lalbagh","alkapuri"],
  "Gujarat":     ["anand","nadiad","bhuj","vapi","rajkot","bharuch"],
  "Karnataka":   ["indiranagar","yelahanka"],
  "Maharashtra": ["juhu","versova","dadar"],
  "Odisha":      ["bhubaneswar"],
};

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS = {
  "sl-mis":         { password:"SL@MIS2025#Admin", role:"mis",    name:"MIS Admin",         clinic:null,          clinicLabel:"All Clinics" },
  "sl-shyamal":     { password:"SHY@Sound24!",     role:"clinic", name:"Shyamal Staff",      clinic:"shyamal",     clinicLabel:"Shyamal · Ahmedabad" },
  "sl-scity":       { password:"SCI@Sound24!",     role:"clinic", name:"Science City Staff", clinic:"sciencecity", clinicLabel:"Science City · Ahmedabad" },
  "sl-maninagar":   { password:"MAN@Sound24!",     role:"clinic", name:"Maninagar Staff",    clinic:"maninagar",   clinicLabel:"Maninagar · Ahmedabad" },
  "sl-bapunagar":   { password:"BAP@Sound24!",     role:"clinic", name:"Bapunagar Staff",    clinic:"bapunagar",   clinicLabel:"Bapunagar · Ahmedabad" },
  "sl-gopal":       { password:"GOP@Sound24!",     role:"clinic", name:"Gopal Staff",        clinic:"gopal",       clinicLabel:"Gopal · Ahmedabad" },
  "sl-naroda":      { password:"NAR@Sound24!",     role:"clinic", name:"Naroda Staff",       clinic:"naroda",      clinicLabel:"Naroda · Ahmedabad" },
  "sl-naranpura":   { password:"NRN@Sound24!",     role:"clinic", name:"Naranpura Staff",    clinic:"naranpura",   clinicLabel:"Naranpura · Ahmedabad" },
  "sl-chandkheda":  { password:"CKH@Sound24!",     role:"clinic", name:"Chandkheda Staff",   clinic:"chandkheda",  clinicLabel:"Chandkheda · Ahmedabad" },
  "sl-wadaj":       { password:"WAD@Sound24!",     role:"clinic", name:"Wadaj Staff",        clinic:"wadaj",       clinicLabel:"Wadaj · Ahmedabad" },
  "sl-lalbagh":     { password:"LAL@Sound24!",     role:"clinic", name:"Lalbagh Staff",      clinic:"lalbagh",     clinicLabel:"Lalbagh · Vadodara" },
  "sl-alkapuri":    { password:"ALK@Sound24!",     role:"clinic", name:"Alkapuri Staff",     clinic:"alkapuri",    clinicLabel:"Alkapuri · Vadodara" },
  "sl-anand":       { password:"AND@Sound24!",     role:"clinic", name:"Anand Staff",        clinic:"anand",       clinicLabel:"Anand" },
  "sl-nadiad":      { password:"NDI@Sound24!",     role:"clinic", name:"Nadiad Staff",       clinic:"nadiad",      clinicLabel:"Nadiad" },
  "sl-bhuj":        { password:"BHJ@Sound24!",     role:"clinic", name:"Bhuj Staff",         clinic:"bhuj",        clinicLabel:"Bhuj" },
  "sl-vapi":        { password:"VAP@Sound24!",     role:"clinic", name:"Vapi Staff",         clinic:"vapi",        clinicLabel:"Vapi" },
  "sl-rajkot":      { password:"RJK@Sound24!",     role:"clinic", name:"Rajkot Staff",       clinic:"rajkot",      clinicLabel:"Rajkot" },
  "sl-bharuch":     { password:"BHR@Sound24!",     role:"clinic", name:"Bharuch Staff",      clinic:"bharuch",     clinicLabel:"Bharuch" },
  "sl-indiranagar": { password:"IND@Sound24!",     role:"clinic", name:"Indiranagar Staff",  clinic:"indiranagar", clinicLabel:"Indiranagar · Bengaluru" },
  "sl-yelahanka":   { password:"YLK@Sound24!",     role:"clinic", name:"Yelahanka Staff",    clinic:"yelahanka",   clinicLabel:"Yelahanka · Bengaluru" },
  "sl-juhu":        { password:"JHU@Sound24!",     role:"clinic", name:"Juhu Staff",         clinic:"juhu",        clinicLabel:"Juhu · Mumbai" },
  "sl-versova":     { password:"VRS@Sound24!",     role:"clinic", name:"Versova Staff",      clinic:"versova",     clinicLabel:"Versova · Mumbai" },
  "sl-dadar":       { password:"DDR@Sound24!",     role:"clinic", name:"Dadar Staff",        clinic:"dadar",       clinicLabel:"Dadar · Mumbai" },
  "sl-bhubaneswar": { password:"BBS@Sound24!",     role:"clinic", name:"Bhubaneswar Staff",  clinic:"bhubaneswar", clinicLabel:"Bhubaneswar · Odisha" },
};

function genCode(cid) {
  return `${cid.slice(0,3).toUpperCase()}-${Math.floor(100000+Math.random()*900000)}`;
}

// ─── STORE (localStorage — replace with Firebase later) ──────────────────────
function useStore() {
  const [patients, setPatients] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sl_pts") || "[]"); } catch { return []; }
  });
  const save = d => { setPatients(d); localStorage.setItem("sl_pts", JSON.stringify(d)); };
  const addPatient    = d => { const p = {...d, id:genCode(d.clinicId), createdAt:new Date().toISOString(), records:[], visits:[]}; save([...patients,p]); return p; };
  const addRecord     = (pid,r) => save(patients.map(p => p.id===pid ? {...p,records:[...(p.records||[]),{...r,ts:new Date().toISOString(),rid:Date.now().toString()}]} : p));
  const deleteRecord  = (pid,rid) => save(patients.map(p => p.id===pid ? {...p,records:(p.records||[]).filter(r=>r.rid!==rid)} : p));
  const addVisit      = (pid,v) => save(patients.map(p => p.id===pid ? {...p,visits:[...(p.visits||[]),{...v,ts:new Date().toISOString(),vid:Date.now().toString()}]} : p));
  const searchPhone   = (q,cid) => patients.filter(p => p.phone.includes(q) && (!cid||p.clinicId===cid));
  const searchCode    = (q,cid) => patients.filter(p => p.id.toLowerCase().includes(q.toLowerCase()) && (!cid||p.clinicId===cid));
  const searchName    = (q,cid) => patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) && (!cid||p.clinicId===cid));
  return { patients, addPatient, addRecord, deleteRecord, addVisit, searchPhone, searchCode, searchName };
}

// ══════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]   = useState(null);
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const store = useStore();

  // Apply theme to <html> element so CSS vars cascade everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const login  = (u,pw) => { const usr=USERS[u]; if(usr&&usr.password===pw){ setUser({...usr,username:u}); return true; } return false; };
  const logout = () => setUser(null);
  const toggleTheme = () => setTheme(t => t==="light"?"dark":"light");

  if (!user) return <Login onLogin={login} theme={theme} toggleTheme={toggleTheme}/>;
  if (user.role==="mis") return <MIS user={user} store={store} onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>;
  return <Clinic user={user} store={store} onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>;
}

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
function Login({ onLogin, theme, toggleTheme }) {
  const [u,setU]   = useState("");
  const [pw,setPw] = useState("");
  const [err,setErr] = useState("");
  const [busy,setBusy] = useState(false);
  const [show,setShow] = useState(false);
  const quote = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];

  const go = () => {
    if (!u.trim()||!pw.trim()) { setErr("Please enter both username and password."); return; }
    setBusy(true); setErr("");
    setTimeout(() => { if (!onLogin(u.trim(),pw)) setErr("Invalid credentials. Please contact your MIS administrator."); setBusy(false); }, 800);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"var(--bg)",transition:"background 0.3s"}}>
      {/* Left – branding */}
      <div style={{flex:"0 0 46%",background:"linear-gradient(160deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%)",display:"flex",flexDirection:"column",padding:"52px 56px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-100,left:-100,width:450,height:450,borderRadius:"50%",border:"1px solid #ffffff12"}}/>
        <div style={{position:"absolute",top:-50,left:-50,width:280,height:280,borderRadius:"50%",border:"1px solid #ffffff18"}}/>
        <div style={{position:"absolute",bottom:-80,right:-60,width:380,height:380,borderRadius:"50%",border:"1px solid #ffffff0a"}}/>
        {/* soundwave decoration */}
        <div style={{position:"absolute",bottom:80,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",gap:4,opacity:0.15}}>
          {[10,24,16,38,20,48,28,42,18,32,14,28,22,44,12,36,24,42,16,30].map((h,i)=>(
            <div key={i} style={{width:3,height:h,background:"#fff",borderRadius:99}}/>
          ))}
        </div>
        {/* Logo area */}
        <div style={{marginBottom:"auto"}}>
          <SLogo white/>
        </div>
        {/* Quote */}
        <div style={{marginBottom:52}}>
          <div style={{fontSize:10,color:"#c4b5fd",fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",marginBottom:18}}>Today's Note</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff",lineHeight:1.5,fontStyle:"italic",marginBottom:14}}>
            "{quote.q}"
          </div>
          <div style={{fontSize:12,color:"#c4b5fd"}}>{quote.a}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,#ffffff30,transparent)"}}/>
          <div style={{fontSize:10,color:"#a78bfa",letterSpacing:1.5}}>24 CLINICS · 6 STATES</div>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,transparent,#ffffff30)"}}/>
        </div>
      </div>

      {/* Right – form */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 56px",background:"var(--bg)",position:"relative",transition:"background 0.3s"}}>
        {/* theme toggle top-right */}
        <button onClick={toggleTheme} title="Toggle theme"
          style={{position:"absolute",top:20,right:24,background:"var(--card)",border:"1px solid var(--border)",borderRadius:99,padding:"7px 14px",fontSize:13,cursor:"pointer",color:"var(--text1)",display:"flex",alignItems:"center",gap:6,boxShadow:"var(--cardshadow)"}}>
          {theme==="light"?"🌙 Dark":"☀️ Light"}
        </button>

        <div className="fadeUp" style={{width:"100%",maxWidth:400}}>
          <div style={{marginBottom:32}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"var(--text1)",letterSpacing:-0.5}}>Welcome back</div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:6}}>Sign in to your SoundLife clinic portal</div>
          </div>

          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"30px",boxShadow:"var(--cardshadow)"}}>
            <label style={S.label}>Username</label>
            <input style={S.inp} value={u} onChange={e=>{setU(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&go()} placeholder="e.g. sl-shyamal" autoFocus autoComplete="username"/>

            <label style={{...S.label,marginTop:16}}>Password</label>
            <div style={{position:"relative"}}>
              <input style={{...S.inp,paddingRight:44}} type={show?"text":"password"} value={pw}
                onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter password" autoComplete="current-password"/>
              <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:14,padding:4}}>
                {show?"🙈":"👁"}
              </button>
            </div>

            {err && <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",borderRadius:9,padding:"9px 13px",fontSize:12,marginTop:12}}>{err}</div>}

            <button className="btn-p" onClick={go} disabled={busy}
              style={{marginTop:20,width:"100%",padding:"13px",background:busy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px #7c3aed33"}}>
              {busy?<><span style={{width:14,height:14,border:"2px solid #ffffff44",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Verifying…</>:"Sign In →"}
            </button>

            <div style={{marginTop:20,padding:"12px 14px",background:"var(--accentbg)",borderRadius:9,border:"1px solid var(--border)",textAlign:"center"}}>
              <div style={{fontSize:11,color:"var(--muted)"}}>For login credentials, contact your MIS administrator.</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>Credentials are issued individually per clinic.</div>
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:22,fontSize:11,color:"var(--muted2)"}}>
            © {new Date().getFullYear()} SoundLife Speech & Hearing Clinic
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHELL
// ══════════════════════════════════════════════════════════
function Shell({ user, navItems, children, onLogout, theme, toggleTheme }) {
  const acl = user.clinic ? CLINICS[user.clinic]?.color : "#7c3aed";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)",color:"var(--text1)",transition:"background 0.3s,color 0.3s"}}>
      {/* Sidebar */}
      <aside className="sidebar-full" style={{width:224,background:"var(--sidebar)",borderRight:"1px solid var(--sideborder)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto",boxShadow:"2px 0 12px #7c3aed08",transition:"background 0.3s"}}>
        <div style={{padding:"22px 18px 14px"}}>
          <SLogo/>
          <div style={{marginTop:12,background:acl+"18",border:`1px solid ${acl}30`,borderRadius:8,padding:"5px 10px",fontSize:10,color:acl,fontWeight:700,letterSpacing:0.5,lineHeight:1.5}}>
            {user.clinicLabel}
          </div>
        </div>
        <nav style={{flex:1,padding:"4px 10px",display:"flex",flexDirection:"column",gap:1}}>
          {navItems.map(item => (
            <button key={item.id} className="slink" onClick={item.onClick}
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:9,border:"none",
                background:item.active?"var(--accentbg)":"transparent",
                color:item.active?acl:"var(--muted)",
                fontSize:12.5,cursor:"pointer",textAlign:"left",width:"100%",
                borderLeft:item.active?`3px solid ${acl}`:"3px solid transparent",
                fontWeight:item.active?600:400,transition:"all 0.15s"}}>
              <span className="sidebar-label" style={{fontSize:15,width:18,textAlign:"center"}}>{item.icon}</span>
              <span className="sidebar-label" style={{flex:1}}>{item.label}</span>
              {item.badge>0 && <span className="sidebar-label" style={{background:acl+"20",color:acl,borderRadius:99,padding:"1px 7px",fontSize:9,fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid var(--sideborder)"}}>
          {/* Theme toggle in sidebar */}
          <button onClick={toggleTheme}
            style={{width:"100%",marginBottom:10,padding:"8px",background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text2)",fontSize:11,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {theme==="light"?"🌙 Dark Mode":"☀️ Light Mode"}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:acl,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>
              {user.name[0]}
            </div>
            <div style={{minWidth:0}}>
              <div className="sidebar-label" style={{fontSize:12,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div className="sidebar-label" style={{fontSize:10,color:"var(--muted2)"}}>{user.username}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"7px",background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",fontSize:11,cursor:"pointer"}}>
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"auto"}}>
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, sub, actions }) {
  return (
    <div style={{padding:"16px 26px",borderBottom:"1px solid var(--sideborder)",background:"var(--topbar)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:20,transition:"background 0.3s",boxShadow:"0 1px 0 var(--border)"}}>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"var(--text1)",letterSpacing:-0.3}}>{title}</div>
        {sub && <div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{sub}</div>}
      </div>
      {actions && <div style={{display:"flex",gap:8,alignItems:"center"}}>{actions}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MIS DASHBOARD
// ══════════════════════════════════════════════════════════
function MIS({ user, store, onLogout, theme, toggleTheme }) {
  const [tab, setTab]     = useState("overview");
  const [selected, setSel]  = useState(null);
  const [lightbox, setLb]   = useState(null);

  const nav = [
    { id:"overview",  icon:"◈", label:"Overview",      active:tab==="overview",  onClick:()=>setTab("overview") },
    { id:"search",    icon:"⌕", label:"Search Patient", active:tab==="search",    onClick:()=>setTab("search") },
    { id:"all",       icon:"☰", label:"All Patients",   active:tab==="all",       onClick:()=>setTab("all"), badge:store.patients.length },
    { id:"gallery",   icon:"⬚", label:"Records Gallery",active:tab==="gallery",   onClick:()=>setTab("gallery") },
    { id:"analytics", icon:"◉", label:"Analytics",      active:tab==="analytics", onClick:()=>setTab("analytics") },
  ];

  return (
    <Shell user={user} navItems={nav} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}>
      {tab==="overview"  && <MISOverview  store={store} onSelect={setSel} setLb={setLb}/>}
      {tab==="search"    && <SearchView   store={store} onSelect={setSel} isMIS/>}
      {tab==="all"       && <AllPatients  store={store} onSelect={setSel}/>}
      {tab==="gallery"   && <Gallery      store={store} setLb={setLb}/>}
      {tab==="analytics" && <Analytics    store={store}/>}
      {selected && <PatientModal p={selected} store={store} onClose={()=>setSel(null)} readOnly setLb={setLb}/>}
      {lightbox && <Lightbox {...lightbox} onClose={()=>setLb(null)}/>}
    </Shell>
  );
}

function MISOverview({ store, onSelect, setLb }) {
  const total    = store.patients.length;
  const totalRec = store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const today    = store.patients.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;
  const regions  = Object.entries(REGIONS).map(([r,ids])=>({ r, count:store.patients.filter(p=>ids.includes(p.clinicId)).length, n:ids.length }));
  const recent   = [...store.patients].reverse().slice(0,6);
  const recentImgs = store.patients.flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p}))).sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,8);

  return (
    <div>
      <TopBar title="SoundLife MIS" sub={new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        {/* KPIs */}
        <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
          {[[total,"Total Patients","👥"],[totalRec,"Total Records","📁"],[Object.keys(CLINICS).length,"Active Clinics","🏥"],[today,"Registered Today","✅"]].map(([v,l,ic],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",borderTop:"3px solid var(--accent)"}}>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>{ic} {l}</div>
              <div style={{fontSize:30,fontWeight:800,color:"var(--accent)"}}>{v}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:18,marginBottom:18}}>
          {/* Region cards */}
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:14}}>Clinics by Region</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {regions.map(r=>(
                <div key={r.r} style={{background:"var(--accentbg)",borderRadius:10,padding:"10px 13px",border:"1px solid var(--border)"}}>
                  <div style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>{r.r}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:6}}>
                    <span style={{fontSize:22,fontWeight:800,color:"var(--accent)"}}>{r.count}</span>
                    <span style={{fontSize:10,color:"var(--muted2)"}}>{r.n} clinics</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recent */}
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",overflow:"auto",maxHeight:300}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:12}}>Recent Patients</div>
            {recent.length===0 && <Empty msg="No patients yet"/>}
            {recent.map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
          </div>
        </div>

        {/* Recent uploads */}
        {recentImgs.length>0 && (
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:14}}>Latest Uploaded Records — Click to View Full Size</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10}}>
              {recentImgs.map(r=><RCard key={r.rid} r={r} onView={()=>setLb({src:r.data,name:r.name,patient:r.patient})}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CLINIC DASHBOARD  ← KEY CHANGE: no patient list on homepage
// ══════════════════════════════════════════════════════════
function Clinic({ user, store, onLogout, theme, toggleTheme }) {
  const [tab, setTab]   = useState("home");
  const [selected, setSel] = useState(null);
  const [lightbox, setLb]  = useState(null);
  const myPts = store.patients.filter(p=>p.clinicId===user.clinic);

  const nav = [
    { id:"home",   icon:"⌂", label:"Home",          active:tab==="home",   onClick:()=>setTab("home") },
    { id:"search", icon:"⌕", label:"Search Patient", active:tab==="search", onClick:()=>setTab("search") },
    { id:"add",    icon:"+", label:"Add Patient",    active:tab==="add",    onClick:()=>setTab("add") },
  ];

  return (
    <Shell user={user} navItems={nav} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}>
      {tab==="home"   && <ClinicHome user={user} myPts={myPts} onAdd={()=>setTab("add")} onSearch={()=>setTab("search")}/>}
      {tab==="search" && <SearchView store={store} onSelect={setSel} clinicId={user.clinic}/>}
      {tab==="add"    && <AddPatient user={user} store={store} onDone={()=>setTab("home")} onCancel={()=>setTab("home")}/>}
      {selected && <PatientModal p={selected} store={store} onClose={()=>setSel(null)} setLb={setLb}/>}
      {lightbox && <Lightbox {...lightbox} onClose={()=>setLb(null)}/>}
    </Shell>
  );
}

// ── CLINIC HOME — stats + quick actions only, NO patient list ─────────────────
function ClinicHome({ user, myPts, onAdd, onSearch }) {
  const c = CLINICS[user.clinic];
  const acl = c?.color || "#7c3aed";
  const totalRec = myPts.reduce((a,p)=>a+(p.records?.length||0),0);
  const today    = myPts.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;
  const thisMonth= myPts.filter(p=>{ const d=new Date(p.createdAt); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length;
  const quote    = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];

  return (
    <div>
      <TopBar title={user.clinicLabel} sub={`${c?.city} · ${c?.region}`}
        actions={<button className="btn-p" onClick={onAdd} style={{...S.btn,background:`linear-gradient(135deg,${acl},${acl}cc)`}}>+ New Patient</button>}/>
      <div className="main-pad" style={{padding:"22px 26px"}}>

        {/* Stats */}
        <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[[myPts.length,"Total Patients","👥"],[totalRec,"Records Uploaded","📋"],[today,"Registered Today","📅"],[thisMonth,"This Month","📆"]].map(([v,l,ic],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",borderTop:`3px solid ${acl}`}}>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>{ic} {l}</div>
              <div style={{fontSize:30,fontWeight:800,color:acl}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
          <button className="card-hover btn-p" onClick={onSearch}
            style={{background:"var(--card)",border:`2px dashed ${acl}40`,borderRadius:16,padding:"28px 24px",cursor:"pointer",textAlign:"left",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:28,marginBottom:10}}>🔍</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--text1)",marginBottom:6}}>Search Patient</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Find any patient by mobile number, case code, or name. Access their full history and records.</div>
          </button>
          <button className="card-hover btn-p" onClick={onAdd}
            style={{background:`linear-gradient(135deg,${acl}18,${acl}08)`,border:`2px dashed ${acl}50`,borderRadius:16,padding:"28px 24px",cursor:"pointer",textAlign:"left",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:28,marginBottom:10}}>➕</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--text1)",marginBottom:6}}>Register New Patient</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Register a first-time patient. An auto-generated case code will be assigned immediately.</div>
          </button>
        </div>

        {/* Instructions card */}
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"20px 22px",boxShadow:"var(--cardshadow)",marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:14}}>How to Use</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["1","New Patient","Click 'Register New Patient'. Fill in name, phone, age. A case code like SHY-123456 is auto-generated."],
              ["2","Upload Records","Search the patient, open their profile, go to 'Records' tab and upload diagnosis images or reports."],
              ["3","Return Visit","When patient returns, search by their phone number or case code to pull up their full history."],
              ["4","Log Visits","In the patient profile, use the 'Visits' tab to log notes for each consultation."],
            ].map(([n,t,d])=>(
              <div key={n} style={{background:"var(--accentbg)",borderRadius:10,padding:"12px 14px",border:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:22,height:22,borderRadius:99,background:acl,color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{n}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text1)"}}>{t}</div>
                </div>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily quote */}
        <div style={{background:`linear-gradient(135deg,${acl}18,${acl}08)`,border:`1px solid ${acl}25`,borderRadius:14,padding:"18px 22px"}}>
          <div style={{fontSize:10,color:acl,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Today's Thought</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"var(--text1)",fontStyle:"italic",lineHeight:1.5}}>"{quote.q}"</div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:8}}>{quote.a}</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SEARCH VIEW (shared by MIS and Clinic)
// ══════════════════════════════════════════════════════════
function SearchView({ store, onSelect, isMIS, clinicId }) {
  const [q,setQ]     = useState("");
  const [type,setType] = useState("phone");
  const [res,setRes]   = useState(null);

  const run = () => {
    if (!q.trim()) return;
    const cid = isMIS ? null : clinicId;
    const r = type==="phone" ? store.searchPhone(q.trim(),cid) : type==="code" ? store.searchCode(q.trim(),cid) : store.searchName(q.trim(),cid);
    setRes(r);
  };

  return (
    <div>
      <TopBar title={isMIS?"Global Search":"Search Patient"} sub={isMIS?"Search across all 24 clinics":"Search within your clinic"}/>
      <div className="main-pad" style={{padding:"22px 26px",maxWidth:700}}>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"22px",boxShadow:"var(--cardshadow)"}}>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["phone","📱 Phone"],["code","🔢 Code"],["name","👤 Name"]].map(([t,l])=>(
              <button key={t} onClick={()=>setType(t)}
                style={{padding:"7px 15px",borderRadius:8,border:`1px solid ${type===t?"var(--accent)":"var(--border)"}`,background:type===t?"var(--accentbg)":"transparent",color:type===t?"var(--accent)":"var(--muted)",fontSize:12,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input style={{...S.inp,flex:1}} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()}
              placeholder={type==="phone"?"Mobile number…":type==="code"?"Case code e.g. SHY-123456…":"Patient name…"}/>
            <button className="btn-p" onClick={run} style={S.btn}>Search</button>
          </div>
          <div style={{marginTop:16}}>
            {res===null && <div style={{color:"var(--muted2)",fontSize:12,textAlign:"center",padding:18}}>Enter a query above and press Search or Enter</div>}
            {res?.length===0 && <Empty msg="No patients found"/>}
            {res?.map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ADD PATIENT
// ══════════════════════════════════════════════════════════
function AddPatient({ user, store, onDone, onCancel }) {
  const [f,setF]   = useState({name:"",phone:"",age:"",gender:"Male",address:"",bloodGroup:"",notes:""});
  const [errs,setErrs] = useState({});
  const [success,setSuccess] = useState(null);
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  const validate = () => { const e={}; if(!f.name.trim())e.name="Required"; if(!/^\d{10}$/.test(f.phone))e.phone="Must be 10 digits"; if(!f.age||isNaN(f.age))e.age="Required"; return e; };
  const submit = () => { const e=validate(); if(Object.keys(e).length){setErrs(e);return;} setSuccess(store.addPatient({...f,clinicId:user.clinic})); };
  const acl = CLINICS[user.clinic]?.color||"#7c3aed";

  if (success) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div className="fadeUp" style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:18,padding:"44px 38px",textAlign:"center",maxWidth:420,width:"100%",boxShadow:"var(--cardshadow)"}}>
        <div style={{fontSize:52,marginBottom:12}}>✅</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"var(--text1)",marginBottom:6}}>Patient Registered!</div>
        <div style={{color:"var(--muted)",fontSize:12,marginBottom:20}}>Auto-generated Case Code:</div>
        <div style={{fontSize:36,fontWeight:800,color:acl,letterSpacing:5,marginBottom:8,fontFamily:"monospace"}}>{success.id}</div>
        <div style={{color:"var(--muted2)",fontSize:11,marginBottom:28}}>Share this code with the patient for all future visits.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="btn-p" onClick={()=>setSuccess(null)} style={{...S.btn,background:`linear-gradient(135deg,${acl},${acl}cc)`}}>Add Another</button>
          <button onClick={onDone} style={S.btnG}>Go to Home →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <TopBar title="Register New Patient" sub={user.clinicLabel}/>
      <div className="main-pad" style={{padding:"22px 26px",maxWidth:660}}>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"26px",boxShadow:"var(--cardshadow)"}}>
          <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
            {[{k:"name",l:"Full Name *",t:"text",ph:"Patient's full name"},{k:"phone",l:"Mobile Number *",t:"tel",ph:"10-digit mobile"},{k:"age",l:"Age *",t:"number",ph:"Age in years"},{k:"address",l:"Address",t:"text",ph:"Area / City"}].map(x=>(
              <div key={x.k} style={{marginBottom:16}}>
                <label style={S.label}>{x.l}</label>
                <input style={{...S.inp,...(errs[x.k]?{borderColor:"var(--danger) !important"}:{})}} type={x.t} placeholder={x.ph}
                  value={f[x.k]} onChange={e=>{set(x.k,e.target.value);setErrs(r=>({...r,[x.k]:undefined}));}}/>
                {errs[x.k] && <div style={{color:"var(--danger)",fontSize:10,marginTop:3}}>{errs[x.k]}</div>}
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <label style={S.label}>Gender</label>
              <select style={S.inp} value={f.gender} onChange={e=>set("gender",e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.label}>Blood Group</label>
              <select style={S.inp} value={f.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)}>
                <option value="">Select…</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16,gridColumn:"1/-1"}}>
              <label style={S.label}>Chief Complaint / Initial Notes</label>
              <textarea style={{...S.inp,minHeight:76,resize:"vertical"}} placeholder="Symptoms, presenting complaint…"
                value={f.notes} onChange={e=>set("notes",e.target.value)}/>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-p" onClick={submit} style={{...S.btn,background:`linear-gradient(135deg,${acl},${acl}cc)`}}>Register & Generate Code</button>
            <button onClick={onCancel} style={S.btnG}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ALL PATIENTS (MIS only)
// ══════════════════════════════════════════════════════════
function AllPatients({ store, onSelect }) {
  const [filter,setFilter] = useState("all");
  const list = filter==="all" ? store.patients : store.patients.filter(p=>p.clinicId===filter);
  return (
    <div>
      <TopBar title="All Patients" sub={`${list.length} shown`}/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"var(--muted)",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Filter by Clinic</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
            <FBtn active={filter==="all"} onClick={()=>setFilter("all")}>All Clinics</FBtn>
          </div>
          {Object.entries(REGIONS).map(([region,ids])=>(
            <div key={region} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <span style={{fontSize:10,color:"var(--muted2)",minWidth:80,fontWeight:600}}>{region}:</span>
              {ids.map(id=><FBtn key={id} active={filter===id} onClick={()=>setFilter(id)} color={CLINICS[id].color}>{CLINICS[id].label}</FBtn>)}
            </div>
          ))}
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,overflow:"hidden",boxShadow:"var(--cardshadow)"}}>
          <div className="table-row" style={{display:"grid",gridTemplateColumns:"2fr 1.3fr 1.2fr 1.4fr 0.7fr 1fr",padding:"10px 18px",background:"var(--accentbg)",fontSize:9,fontWeight:700,color:"var(--muted)",letterSpacing:1.2,textTransform:"uppercase",borderBottom:"1px solid var(--border)"}}>
            <div>Patient</div><div>Code</div><div>Phone</div><div>Clinic</div><div>Recs</div><div>Date</div>
          </div>
          {list.length===0 && <Empty msg="No patients found"/>}
          {[...list].reverse().map(p=>{
            const c=CLINICS[p.clinicId];
            return (
              <div key={p.id} className="row-hover table-row" onClick={()=>onSelect(p)}
                style={{display:"grid",gridTemplateColumns:"2fr 1.3fr 1.2fr 1.4fr 0.7fr 1fr",padding:"11px 18px",borderTop:"1px solid var(--border)",cursor:"pointer",fontSize:12,alignItems:"center"}}>
                <div style={{fontWeight:600,color:"var(--text1)"}}>{p.name}</div>
                <div><Cb code={p.id} color={c?.color}/></div>
                <div style={{color:"var(--muted)"}}>{p.phone}</div>
                <div><span style={{background:c?.color+"18",color:c?.color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label}</span></div>
                <div style={{color:"var(--muted)"}}>{p.records?.length||0}</div>
                <div style={{color:"var(--muted)"}}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GALLERY (MIS)
// ══════════════════════════════════════════════════════════
function Gallery({ store, setLb }) {
  const [cf,setCf] = useState("all");
  const imgs = store.patients.filter(p=>cf==="all"||p.clinicId===cf).flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p}))).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  return (
    <div>
      <TopBar title="Records Gallery" sub={`${imgs.length} images`}/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          <FBtn active={cf==="all"} onClick={()=>setCf("all")}>All</FBtn>
          {Object.entries(CLINICS).map(([id,c])=><FBtn key={id} active={cf===id} onClick={()=>setCf(id)} color={c.color}>{c.label}</FBtn>)}
        </div>
        {imgs.length===0 && <Empty msg="No images uploaded yet"/>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
          {imgs.map(r=><RCard key={r.rid} r={r} onView={()=>setLb({src:r.data,name:r.name,patient:r.patient})} showClinic/>)}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ANALYTICS (MIS)
// ══════════════════════════════════════════════════════════
function Analytics({ store }) {
  const total    = store.patients.length;
  const totalRec = store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const regions  = Object.entries(REGIONS).map(([r,ids])=>({ r, count:store.patients.filter(p=>ids.includes(p.clinicId)).length }));
  const maxR     = Math.max(...regions.map(x=>x.count),1);
  const months   = Array.from({length:6},(_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-5+i); return { label:d.toLocaleDateString("en-IN",{month:"short"}), count:store.patients.filter(p=>{ const pd=new Date(p.createdAt); return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear(); }).length }; });
  const maxM     = Math.max(...months.map(m=>m.count),1);
  return (
    <div>
      <TopBar title="Analytics" sub="System-wide statistics"/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
          {[[total,"Total Patients"],[totalRec,"Total Records"],[Object.keys(CLINICS).length,"Clinics"],[store.patients.filter(p=>{const d=new Date(p.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length,"This Month"]].map(([v,l],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",borderTop:"3px solid var(--accent)"}}>
              <div style={{fontSize:28,fontWeight:800,color:"var(--accent)"}}>{v}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"20px",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:16}}>Patients by Region</div>
            {regions.map(r=>(
              <div key={r.r} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"var(--muted)"}}>{r.r}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--accent)"}}>{r.count}</span>
                </div>
                <div style={{background:"var(--accentbg)",borderRadius:99,height:7}}>
                  <div style={{width:`${(r.count/maxR)*100}%`,background:"linear-gradient(90deg,#7c3aed,#6d28d9)",height:"100%",borderRadius:99,transition:"width 1s cubic-bezier(.16,1,.3,1)",minWidth:r.count?4:0}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"20px",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:16}}>Monthly Registrations</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:130}}>
              {months.map(m=>(
                <div key={m.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  {m.count>0 && <div style={{fontSize:10,fontWeight:700,color:"var(--accent)"}}>{m.count}</div>}
                  <div style={{width:"100%",background:"linear-gradient(0deg,#7c3aed,#a78bfa)",borderRadius:"5px 5px 0 0",height:`${Math.max((m.count/maxM)*100,3)}%`,minHeight:3,transition:"height 1s cubic-bezier(.16,1,.3,1)"}}/>
                  <div style={{fontSize:10,color:"var(--muted)"}}>{m.label}</div>
                </div>
              ))}
            </div>
            {total===0 && <Empty msg="No data yet"/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT MODAL
// ══════════════════════════════════════════════════════════
function PatientModal({ p, store, onClose, readOnly, setLb }) {
  const [tab,setTab]   = useState("info");
  const [note,setNote] = useState("");
  const fileRef = useRef();
  const [busy,setBusy] = useState(false);
  const live = store.patients.find(x=>x.id===p.id)||p;
  const c    = CLINICS[live.clinicId];
  const acl  = c?.color||"#7c3aed";

  const upload = e => {
    const files=Array.from(e.target.files); if(!files.length) return;
    setBusy(true); let done=0;
    files.forEach(f=>{ const r=new FileReader(); r.onload=ev=>{ store.addRecord(live.id,{type:f.type.startsWith("image/")?"image":"document",name:f.name,data:ev.target.result}); done++; if(done===files.length) setBusy(false); }; r.readAsDataURL(f); });
  };

  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,background:"#00000066",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div style={{background:"var(--card)",border:`1px solid ${acl}30`,borderRadius:18,width:"100%",maxWidth:720,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px #00000040"}} onClick={e=>e.stopPropagation()}>
        {/* header */}
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--border)",background:"var(--accentbg)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:13,background:`linear-gradient(135deg,${acl},${acl}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20}}>
              {live.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:"var(--text1)"}}>{live.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                <Cb code={live.id} color={acl}/>
                <span style={{background:acl+"18",color:acl,padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label} · {c?.city}</span>
                {live.bloodGroup && <span style={{background:"#fee2e2",color:"#dc2626",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>🩸 {live.bloodGroup}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer",color:"var(--muted)",flexShrink:0}}>✕</button>
        </div>
        {/* tabs */}
        <div style={{display:"flex",borderBottom:"1px solid var(--border)",background:"var(--card)",padding:"0 22px",gap:4}}>
          {["info","records","visits"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"11px 14px",background:"none",border:"none",borderBottom:`2px solid ${tab===t?acl:"transparent"}`,color:tab===t?acl:"var(--muted)",fontSize:12,cursor:"pointer",fontWeight:tab===t?700:400,marginBottom:-1,transition:"all 0.15s"}}>
              {t==="records"?`Records (${live.records?.length||0})`:t==="visits"?`Visits (${live.visits?.length||0})`:"Patient Info"}
            </button>
          ))}
        </div>
        {/* body */}
        <div style={{flex:1,overflow:"auto",padding:"20px 22px",background:"var(--bg)"}}>
          {tab==="info" && (
            <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Full Name",live.name],["Mobile",live.phone],["Age",live.age?`${live.age} yrs`:"—"],["Gender",live.gender||"—"],["Blood Group",live.bloodGroup||"—"],["Address",live.address||"—"],["Clinic",c?.label],["City",c?.city],["Case Code",live.id],["Registered",new Date(live.createdAt).toLocaleDateString("en-IN")]].map(([k,v])=>(
                <div key={k} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"var(--muted2)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--text1)",marginTop:4}}>{v||"—"}</div>
                </div>
              ))}
              {live.notes && (
                <div style={{gridColumn:"1/-1",background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"var(--muted2)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>Initial Notes</div>
                  <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{live.notes}</div>
                </div>
              )}
            </div>
          )}
          {tab==="records" && (
            <div>
              {!readOnly && (
                <div style={{marginBottom:14}}>
                  <button className="btn-p" onClick={()=>fileRef.current.click()} disabled={busy} style={{...S.btn,background:`linear-gradient(135deg,${acl},${acl}cc)`}}>
                    {busy?"Uploading…":"📎 Upload Image / Report"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple style={{display:"none"}} onChange={upload}/>
                </div>
              )}
              {(!live.records||live.records.length===0) && <Empty msg="No records uploaded yet"/>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
                {(live.records||[]).map(r=>(
                  <div key={r.rid} className="rec-card"
                    style={{borderRadius:11,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card)",cursor:r.type==="image"?"pointer":"default"}}
                    onClick={()=>r.type==="image"&&setLb({src:r.data,name:r.name})}>
                    {r.type==="image"
                      ? <img src={r.data} style={{width:"100%",height:115,objectFit:"cover",display:"block"}} alt={r.name}/>
                      : <div style={{height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:26,color:"var(--muted)"}}>📄<div style={{fontSize:10,color:"var(--muted2)",marginTop:5,textAlign:"center",padding:"0 6px"}}>{r.name}</div></div>}
                    <div style={{padding:"7px 9px",borderTop:"1px solid var(--border)"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                      <div style={{fontSize:9,color:"var(--muted2)",marginTop:2}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div>
                    </div>
                    {!readOnly && <button onClick={e=>{e.stopPropagation();store.deleteRecord(live.id,r.rid);}} style={{width:"100%",padding:"5px",background:"#fef2f2",border:"none",borderTop:"1px solid var(--border)",color:"#dc2626",fontSize:10,cursor:"pointer"}}>Remove</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="visits" && (
            <div>
              {!readOnly && (
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <textarea style={{...S.inp,flex:1,minHeight:54,resize:"vertical"}} placeholder="Log visit note…" value={note} onChange={e=>setNote(e.target.value)}/>
                  <button className="btn-p" onClick={()=>{if(!note.trim())return;store.addVisit(live.id,{note});setNote("");}} style={{...S.btn,background:`linear-gradient(135deg,${acl},${acl}cc)`,alignSelf:"flex-end",whiteSpace:"nowrap"}}>+ Log</button>
                </div>
              )}
              {(!live.visits||live.visits.length===0) && <Empty msg="No visit logs yet"/>}
              {[...(live.visits||[])].reverse().map(v=>(
                <div key={v.vid} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"11px 14px",marginBottom:8}}>
                  <div style={{fontSize:9,color:"var(--muted2)",marginBottom:5}}>{new Date(v.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{v.note}</div>
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
// LIGHTBOX
// ══════════════════════════════════════════════════════════
function Lightbox({ src, name, patient, onClose }) {
  const [zoom,setZoom] = useState(1);
  const [pos,setPos]   = useState({x:0,y:0});
  const drag = useRef(null);
  useEffect(()=>{ const h=e=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[]);
  const onWheel=e=>{ e.preventDefault(); setZoom(z=>Math.min(Math.max(z-e.deltaY*0.002,0.3),5)); };
  const onMD=e=>{ drag.current={x:e.clientX-pos.x,y:e.clientY-pos.y}; };
  const onMM=e=>{ if(!drag.current)return; setPos({x:e.clientX-drag.current.x,y:e.clientY-drag.current.y}); };
  const onMU=()=>{ drag.current=null; };
  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:500,background:"#000000ee",display:"flex",flexDirection:"column",backdropFilter:"blur(10px)"}} onClick={onClose}>
      <div style={{padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d0b1a",borderBottom:"1px solid #2a2250",flexShrink:0}} onClick={e=>e.stopPropagation()}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#e8e4ff"}}>{name}</div>
          {patient && <div style={{fontSize:10,color:"#6d5fa8",marginTop:2}}>{patient.name} · {CLINICS[patient.clinicId]?.label}</div>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setZoom(z=>Math.max(z-0.25,0.3))} style={S.ibtn}>−</button>
          <span style={{fontSize:11,color:"#6d5fa8",minWidth:38,textAlign:"center"}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(z+0.25,5))} style={S.ibtn}>+</button>
          <button onClick={()=>{setZoom(1);setPos({x:0,y:0});}} style={S.ibtn}>⟳</button>
          <a href={src} download={name} style={{...S.ibtn,textDecoration:"none",color:"#e8e4ff",display:"inline-flex",alignItems:"center",gap:4}} onClick={e=>e.stopPropagation()}>⬇ Save</a>
          <button onClick={onClose} style={{...S.ibtn,marginLeft:6}}>✕ Close</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative",cursor:zoom>1?"grab":"zoom-in"}}
        onClick={e=>{e.stopPropagation();if(zoom===1)setZoom(2);}} onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}>
        <img src={src} alt={name}
          style={{position:"absolute",top:"50%",left:"50%",transform:`translate(calc(-50% + ${pos.x}px),calc(-50% + ${pos.y}px)) scale(${zoom})`,maxWidth:"92vw",maxHeight:"82vh",objectFit:"contain",borderRadius:8,boxShadow:"0 24px 70px #000",transition:drag.current?"none":"transform 0.2s",userSelect:"none",pointerEvents:"none"}}/>
      </div>
      <div style={{textAlign:"center",padding:"8px",fontSize:10,color:"#3d3070",background:"#0d0b1a"}}>Click to zoom · Scroll to zoom · Drag to pan · Esc to close</div>
    </div>
  );
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function SLogo({ white }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        {[4,9,6,14,8,18,10,15,7,11].map((h,i)=>(
          <div key={i} style={{width:2.5,height:h,background:white?"#fff":i<4?"#e84c3d":"#3aad5e",borderRadius:99}}/>
        ))}
      </div>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,lineHeight:1,letterSpacing:-0.3}}>
          <span style={{color:white?"#a7f3d0":"#3aad5e"}}>Sound</span><span style={{color:white?"#fca5a5":"#e84c3d"}}>Life</span>
          <sup style={{fontSize:9,color:white?"#fca5a5":"#e84c3d"}}>®</sup>
        </div>
        <div style={{fontSize:8,color:white?"#c4b5fd":"var(--muted)",letterSpacing:1.2,textTransform:"uppercase",marginTop:1}}>speech & hearing clinic</div>
      </div>
    </div>
  );
}

function PRow({ p, onClick }) {
  const c = CLINICS[p.clinicId];
  return (
    <div className="row-hover" onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",marginBottom:5,background:"var(--accentbg)",border:"1px solid var(--border)",transition:"background 0.12s"}}>
      <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${c?.color||"#7c3aed"},${c?.color||"#7c3aed"}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>
        {p.name?.[0]?.toUpperCase()}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,color:"var(--text1)",fontSize:13}}>{p.name}</div>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>📱 {p.phone} · {c?.label} · {c?.city}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <Cb code={p.id} color={c?.color}/>
        <div style={{fontSize:9,color:"var(--muted2)",marginTop:3}}>{p.records?.length||0} records</div>
      </div>
    </div>
  );
}

function RCard({ r, onView, showClinic }) {
  const c = r.patient ? CLINICS[r.patient.clinicId] : null;
  return (
    <div className="rec-card" onClick={onView}
      style={{borderRadius:12,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card)"}}>
      <div style={{position:"relative"}}>
        <img src={r.data} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} alt={r.name}/>
        {showClinic && c && <div style={{position:"absolute",top:7,right:7,background:c.color+"ee",borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#fff"}}>{c.label}</div>}
      </div>
      <div style={{padding:"8px 10px"}}>
        {r.patient && <div style={{fontSize:11,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.patient.name}</div>}
        <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{r.name}</div>
        <div style={{fontSize:9,color:"var(--muted2)",marginTop:1}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div>
      </div>
    </div>
  );
}

function Cb({ code, color="#7c3aed" }) {
  return <span style={{background:color+"18",color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:0.5,fontFamily:"monospace"}}>{code}</span>;
}

function FBtn({ active, onClick, children, color="#7c3aed" }) {
  return (
    <button onClick={onClick}
      style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${active?color:"var(--border)"}`,background:active?color+"18":"transparent",color:active?color:"var(--muted)",fontSize:10,cursor:"pointer",fontWeight:600,transition:"all 0.15s"}}>
      {children}
    </button>
  );
}

function Empty({ msg }) {
  return <div style={{color:"var(--muted2)",fontSize:12,textAlign:"center",padding:"22px 0"}}>{msg}</div>;
}

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────
const S = {
  label: { fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,display:"block",marginBottom:6,textTransform:"uppercase" },
  inp:   { width:"100%",padding:"10px 13px",background:"var(--inputbg)",border:"1px solid var(--border)",borderRadius:9,color:"var(--text1)",fontSize:13,transition:"all 0.2s" },
  btn:   { padding:"10px 20px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 4px 12px #7c3aed33" },
  btnG:  { padding:"10px 20px",background:"transparent",border:"1px solid var(--border)",borderRadius:9,color:"var(--muted)",fontSize:13,fontWeight:600,cursor:"pointer" },
  ibtn:  { padding:"6px 11px",background:"#1e1a38",border:"1px solid #3d3070",borderRadius:7,color:"#c4b5fd",fontSize:12,cursor:"pointer" },
};