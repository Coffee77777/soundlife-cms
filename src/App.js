import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, arrayUnion, query, orderBy, limit,
  setDoc, getDoc
} from "firebase/firestore";
import {
  getAuth, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, createUserWithEmailAndPassword,
} from "firebase/auth";

/* ══════════════════════════════════════════════════════════
   SOUNDLIFE CMS v5.1
   - No Google login (removed)
   - Register tab kept for non-clinic staff (MIS assigns role)
   - Edit Patient details
   - Export to Excel (XLSX) and PDF — MIS only (removed from clinic level)
   ══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyAMMAEo_PygPUZy66a1w542lIpA8hF3mAM",
  authDomain:        "soundlife-cms.firebaseapp.com",
  projectId:         "soundlife-cms",
  storageBucket:     "soundlife-cms.firebasestorage.app",
  messagingSenderId: "764492442025",
  appId:             "1:764492442025:web:c86e985882586db4e93cb8",
};

const CLOUDINARY_CLOUD_NAME    = "dh8sufa3o";
const CLOUDINARY_UPLOAD_PRESET = "zavhutrz";

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── Fonts ──────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
document.head.appendChild(fontLink);

// ── Global styles ──────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}
  :root {
    --bg:#f4f3ff;--bg2:#ffffff;--bg3:#ede9fe;--border:#ddd6fe;--border2:#c4b5fd;
    --text1:#1e1b4b;--text2:#4c1d95;--text3:#7c3aed;--muted:#8b7ec8;--muted2:#a89fd4;
    --accent:#7c3aed;--accent2:#6d28d9;--accentbg:#ede9fe;--accentbg2:#ddd6fe;
    --danger:#e84c3d;--green:#059669;--sidebar:#ffffff;--sideborder:#ede9fe;
    --topbar:#ffffff;--card:#ffffff;--cardborder:#e9e3ff;
    --cardshadow:0 2px 12px #7c3aed12;--rowhover:#f5f3ff;--inputbg:#faf9ff;
    --scrolltrack:#ede9fe;--scrollthumb:#c4b5fd;
  }
  [data-theme="dark"] {
    --bg:#0d0b1a;--bg2:#120f22;--bg3:#1a1530;--border:#2a2250;--border2:#3d3070;
    --text1:#e8e4ff;--text2:#c4b5fd;--text3:#a78bfa;--muted:#6d5fa8;--muted2:#4a3d7a;
    --accent:#8b5cf6;--accent2:#7c3aed;--accentbg:#1e1540;--accentbg2:#2d2060;
    --danger:#f87171;--green:#34d399;--sidebar:#0d0b1a;--sideborder:#1e1a38;
    --topbar:#120f22;--card:#120f22;--cardborder:#2a2250;
    --cardshadow:0 2px 20px #00000040;--rowhover:#1a1535;--inputbg:#0d0b1a;
    --scrolltrack:#1a1535;--scrollthumb:#3d3070;
  }
  body{background:var(--bg);color:var(--text1);font-family:'DM Sans',sans-serif;transition:background 0.3s,color 0.3s;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:var(--scrolltrack);}
  ::-webkit-scrollbar-thumb{background:var(--scrollthumb);border-radius:99px;}
  input,select,textarea{background:var(--inputbg) !important;color:var(--text1) !important;border:1px solid var(--border) !important;}
  input:focus,select:focus,textarea:focus{outline:none !important;border-color:var(--accent) !important;box-shadow:0 0 0 3px var(--accentbg2) !important;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fadeUp{animation:fadeUp 0.4s cubic-bezier(.16,1,.3,1) both;}
  .fadeIn{animation:fadeIn 0.25s ease both;}
  .card-hover{transition:transform 0.2s,box-shadow 0.2s;}
  .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 32px #7c3aed22 !important;}
  .row-hover{transition:background 0.12s;}
  .row-hover:hover{background:var(--rowhover) !important;}
  .slink:hover{background:var(--accentbg) !important;color:var(--accent) !important;}
  .rec-card{transition:all 0.18s;cursor:pointer;}
  .rec-card:hover{border-color:var(--accent) !important;transform:scale(1.02);}
  .btn-p{transition:all 0.18s;}
  .btn-p:hover{opacity:0.88;box-shadow:0 4px 20px #7c3aed44;}
  @media(max-width:768px){
    .sidebar-full{width:64px !important;}.sidebar-label{display:none !important;}
    .main-pad{padding:14px !important;}.grid-3{grid-template-columns:1fr !important;}
    .grid-2{grid-template-columns:1fr !important;}.table-row{grid-template-columns:1fr 1fr !important;}
  }
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
  }
`;
document.head.appendChild(styleEl);

// ── SheetJS for Excel export ───────────────────────────────
function loadSheetJS() {
  return new Promise((resolve) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    document.head.appendChild(s);
  });
}

// ── jsPDF for PDF export ───────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload = () => resolve(window.jspdf.jsPDF);
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

// ── Export helpers ─────────────────────────────────────────
async function exportToExcel(patients, filename = "SoundLife_Patients") {
  const XLSX = await loadSheetJS();
  const rows = patients.map(p => ({
    "Case Code":       p.id,
    "Full Name":       p.name,
    "Mobile":          p.phone,
    "Age":             p.age,
    "Gender":          p.gender || "",
    "Address":         p.address || "",
    "Clinic":          CLINICS[p.clinicId]?.label || p.clinicId,
    "City":            CLINICS[p.clinicId]?.city || "",
    "Region":          CLINICS[p.clinicId]?.region || "",
    "Source":          p.source || "",
    "Records":         p.records?.length || 0,
    "Total Visits":    p.visits?.length || 0,
    "Registered On":   new Date(p.createdAt).toLocaleDateString("en-IN"),
    "Initial Notes":   p.notes || "",
    "Visit Logs":      (p.visits||[]).map(v =>
      `${new Date(v.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})} | ${CLINICS[v.clinicId]?.label||v.clinicId||"?"} | By: ${v.attendedBy||"—"} | ${v.note}`
    ).join("\n") || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    {wch:14},{wch:22},{wch:14},{wch:6},{wch:8},
    {wch:22},{wch:18},{wch:14},{wch:12},{wch:24},{wch:8},{wch:8},{wch:14},{wch:36},{wch:80}
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Patients");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

async function exportToPDF(patients, title = "SoundLife Patient Report") {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 297, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SoundLife Speech & Hearing Clinic", 14, 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 14);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})}`, 230, 14);

  doc.autoTable({
    startY: 22,
    head: [["Code","Name","Mobile","Age","Gender","Clinic","City","Source","Recs","Visits","Registered","Visit Logs (Date | Clinic | By | Note)"]],
    body: patients.map(p => [
      p.id,
      p.name,
      p.phone,
      p.age || "—",
      p.gender || "—",
      CLINICS[p.clinicId]?.label || p.clinicId,
      CLINICS[p.clinicId]?.city || "—",
      p.source || "—",
      p.records?.length || 0,
      p.visits?.length || 0,
      new Date(p.createdAt).toLocaleDateString("en-IN"),
      (p.visits||[]).map(v =>
        `${new Date(v.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} | ${CLINICS[v.clinicId]?.label||v.clinicId||"?"} | By: ${v.attendedBy||"—"} | ${v.note}`
      ).join("\n") || "—",
    ]),
    headStyles: { fillColor: [109, 40, 217], textColor: 255, fontSize: 6, fontStyle: "bold" },
    bodyStyles: { fontSize: 6, textColor: [30, 27, 75] },
    alternateRowStyles: { fillColor: [237, 233, 254] },
    columnStyles: {
      0: {cellWidth:20}, 1: {cellWidth:26}, 2: {cellWidth:20},
      3: {cellWidth:8},  4: {cellWidth:12}, 5: {cellWidth:22},
      6: {cellWidth:18}, 7: {cellWidth:26}, 8: {cellWidth:10},
      9: {cellWidth:10}, 10: {cellWidth:18}, 11: {cellWidth:60},
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} · SoundLife CMS · Confidential`, 14, doc.internal.pageSize.height - 5);
  }

  doc.save(`${title.replace(/ /g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Constants ──────────────────────────────────────────────
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

const CLINICS = {
  shyamal:      { label:"Prahladnagar",      city:"Ahmedabad",   region:"Gujarat",     color:"#7c3aed" },
  sciencecity:  { label:"Science City",      city:"Ahmedabad",   region:"Gujarat",     color:"#6d28d9" },
  maninagar:    { label:"Maninagar",         city:"Ahmedabad",   region:"Gujarat",     color:"#8b5cf6" },
  bapunagar:    { label:"Bapunagar",         city:"Ahmedabad",   region:"Gujarat",     color:"#7c3aed" },
  bopal:        { label:"Bopal",             city:"Ahmedabad",   region:"Gujarat",     color:"#6d28d9" },
  naroda:       { label:"Naroda",            city:"Ahmedabad",   region:"Gujarat",     color:"#8b5cf6" },
  naranpura:    { label:"Naranpura",         city:"Ahmedabad",   region:"Gujarat",     color:"#7c3aed" },
  chandkheda:   { label:"Chandkheda",        city:"Ahmedabad",   region:"Gujarat",     color:"#6d28d9" },
  wadaj:        { label:"Vadaj",             city:"Ahmedabad",   region:"Gujarat",     color:"#8b5cf6" },
  lalbagh:      { label:"Lalbagh",           city:"Vadodara",    region:"Gujarat",     color:"#7c3aed" },
  alkapuri:     { label:"Baroda-Alkapuri",   city:"Vadodara",    region:"Gujarat",     color:"#6d28d9" },
  anand:        { label:"Anand",             city:"Anand",       region:"Gujarat",     color:"#8b5cf6" },
  nadiad:       { label:"Nadiad",            city:"Nadiad",      region:"Gujarat",     color:"#7c3aed" },
  bhuj:         { label:"Bhuj",              city:"Bhuj",        region:"Gujarat",     color:"#6d28d9" },
  vapi:         { label:"Vapi",              city:"Vapi",        region:"Gujarat",     color:"#8b5cf6" },
  rajkot:       { label:"Rajkot",            city:"Rajkot",      region:"Gujarat",     color:"#7c3aed" },
  bharuch:      { label:"Bharuch",           city:"Bharuch",     region:"Gujarat",     color:"#6d28d9" },
  gandhinagar:  { label:"Gandhinagar",       city:"Gandhinagar", region:"Gujarat",     color:"#8b5cf6" },
  indiranagar:  { label:"Indiranagar",       city:"Bengaluru",   region:"Karnataka",   color:"#7c3aed" },
  yelahanka:    { label:"Yelahanka",         city:"Bengaluru",   region:"Karnataka",   color:"#6d28d9" },
  juhu:         { label:"Juhu",              city:"Mumbai",      region:"Maharashtra", color:"#8b5cf6" },
  versova:      { label:"Versova",           city:"Mumbai",      region:"Maharashtra", color:"#7c3aed" },
  dadar:        { label:"Dadar",             city:"Mumbai",      region:"Maharashtra", color:"#6d28d9" },
  udaipur:      { label:"Udaipur",           city:"Udaipur",     region:"Rajasthan",   color:"#8b5cf6" },
  khorda:       { label:"Khorda",            city:"Bhubaneswar", region:"Odisha",      color:"#7c3aed" },
};

const REGIONS = {
  "Gujarat":     ["shyamal","sciencecity","maninagar","bapunagar","bopal","naroda","naranpura","chandkheda","wadaj","lalbagh","alkapuri","anand","nadiad","bhuj","vapi","rajkot","bharuch","gandhinagar"],
  "Karnataka":   ["indiranagar","yelahanka"],
  "Maharashtra": ["juhu","versova","dadar"],
  "Rajasthan":   ["udaipur"],
  "Odisha":      ["khorda"],
};

const USER_META = {
  "sl-mis":         { email:"jaydaiya10@gmail.com",             role:"mis",    name:"MIS Admin",             clinic:null,          clinicLabel:"All Clinics",                initPwd:"SL@MIS2025#Admin" },
  "sl-shyamal":     { email:"soundlifepnclinic@gmail.com",      role:"clinic", name:"Prahladnagar Staff",    clinic:"shyamal",     clinicLabel:"Prahladnagar · Ahmedabad",   initPwd:"SHY@Sound24!" },
  "sl-scity":       { email:"sciencecitysoundlife@gmail.com",   role:"clinic", name:"Science City Staff",    clinic:"sciencecity", clinicLabel:"Science City · Ahmedabad",   initPwd:"SCI@Sound24!" },
  "sl-maninagar":   { email:"maninagarsoundlife054@gmail.com",  role:"clinic", name:"Maninagar Staff",       clinic:"maninagar",   clinicLabel:"Maninagar · Ahmedabad",      initPwd:"MAN@Sound24!" },
  "sl-bapunagar":   { email:"soundlife04636@gmail.com",         role:"clinic", name:"Bapunagar Staff",       clinic:"bapunagar",   clinicLabel:"Bapunagar · Ahmedabad",      initPwd:"BAP@Sound24!" },
  "sl-bopal":       { email:"bopalsoundlife@gmail.com",         role:"clinic", name:"Bopal Staff",           clinic:"bopal",       clinicLabel:"Bopal · Ahmedabad",          initPwd:"BOP@Sound24!" },
  "sl-naroda":      { email:"soundlifenaroda@gmail.com",        role:"clinic", name:"Naroda Staff",          clinic:"naroda",      clinicLabel:"Naroda · Ahmedabad",         initPwd:"NAR@Sound24!" },
  "sl-naranpura":   { email:"soundlife7760@gmail.com",          role:"clinic", name:"Naranpura Staff",       clinic:"naranpura",   clinicLabel:"Naranpura · Ahmedabad",      initPwd:"NRN@Sound24!" },
  "sl-chandkheda":  { email:"chandkhedasoundlife@gmail.com",    role:"clinic", name:"Chandkheda Staff",      clinic:"chandkheda",  clinicLabel:"Chandkheda · Ahmedabad",     initPwd:"CKH@Sound24!" },
  "sl-wadaj":       { email:"soundlifeinc3985@gmail.com",       role:"clinic", name:"Vadaj Staff",           clinic:"wadaj",       clinicLabel:"Vadaj · Ahmedabad",          initPwd:"WAD@Sound24!" },
  "sl-lalbagh":     { email:"lalbaugsoundlife@gmail.com",       role:"clinic", name:"Lalbagh Staff",         clinic:"lalbagh",     clinicLabel:"Lalbagh · Vadodara",         initPwd:"LAL@Sound24!" },
  "sl-alkapuri":    { email:"soundlifeinc52@gmail.com",         role:"clinic", name:"Baroda-Alkapuri Staff", clinic:"alkapuri",    clinicLabel:"Baroda-Alkapuri · Vadodara", initPwd:"ALK@Sound24!" },
  "sl-anand":       { email:"soundlifeincinc@gmail.com",        role:"clinic", name:"Anand Staff",           clinic:"anand",       clinicLabel:"Anand",                      initPwd:"AND@Sound24!" },
  "sl-nadiad":      { email:"Soundlife2604@gmail.com",          role:"clinic", name:"Nadiad Staff",          clinic:"nadiad",      clinicLabel:"Nadiad",                     initPwd:"NDI@Sound24!" },
  "sl-bhuj":        { email:"soundlifebhuj@gmail.com",          role:"clinic", name:"Bhuj Staff",            clinic:"bhuj",        clinicLabel:"Bhuj",                       initPwd:"BHJ@Sound24!" },
  "sl-vapi":        { email:"soundlifevapi@gmail.com",          role:"clinic", name:"Vapi Staff",            clinic:"vapi",        clinicLabel:"Vapi",                       initPwd:"VAP@Sound24!" },
  "sl-rajkot":      { email:"rajkotsoundlife@gmail.com",        role:"clinic", name:"Rajkot Staff",          clinic:"rajkot",      clinicLabel:"Rajkot",                     initPwd:"RJK@Sound24!" },
  "sl-bharuch":     { email:"bharuchsoundlife@gmail.com",       role:"clinic", name:"Bharuch Staff",         clinic:"bharuch",     clinicLabel:"Bharuch",                    initPwd:"BHR@Sound24!" },
  "sl-gandhinagar": { email:"soundlife884@gmail.com",           role:"clinic", name:"Gandhinagar Staff",     clinic:"gandhinagar", clinicLabel:"Gandhinagar",                initPwd:"GAN@Sound24!" },
  "sl-indiranagar": { email:"soundlifeindiranagar@gmail.com",   role:"clinic", name:"Indiranagar Staff",     clinic:"indiranagar", clinicLabel:"Indiranagar · Bengaluru",    initPwd:"IND@Sound24!" },
  "sl-yelahanka":   { email:"soundlifeyelahanka@gmail.com",     role:"clinic", name:"Yelahanka Staff",       clinic:"yelahanka",   clinicLabel:"Yelahanka · Bengaluru",      initPwd:"YLK@Sound24!" },
  "sl-juhu":        { email:"soundlifeincjuhu@gmail.com",       role:"clinic", name:"Juhu Staff",            clinic:"juhu",        clinicLabel:"Juhu · Mumbai",              initPwd:"JHU@Sound24!" },
  "sl-versova":     { email:"soundlifeversova@gmail.com",       role:"clinic", name:"Versova Staff",         clinic:"versova",     clinicLabel:"Versova · Mumbai",           initPwd:"VRS@Sound24!" },
  "sl-dadar":       { email:"dadarsoundlife@gmail.com",         role:"clinic", name:"Dadar Staff",           clinic:"dadar",       clinicLabel:"Dadar · Mumbai",             initPwd:"DDR@Sound24!" },
  "sl-udaipur":     { email:"soundlifeudaipur@gmail.com",       role:"clinic", name:"Udaipur Staff",         clinic:"udaipur",     clinicLabel:"Udaipur",                    initPwd:"UDR@Sound24!" },
  "sl-khorda":      { email:"khordasoundlife@gmail.com",        role:"clinic", name:"Khorda Staff",          clinic:"khorda",      clinicLabel:"Khorda · Bhubaneswar",       initPwd:"KHR@Sound24!" },
};

const SOURCE_OPTIONS = [
  "Walk-in","Doctor / Hospital Referral","Friend / Family Referral",
  "Google / Online Search","Social Media","Camp / Health Drive",
  "Newspaper / Print Ad","Existing Patient Referral","Other",
];

function genCode(cid) {
  return `${cid.slice(0,3).toUpperCase()}-${Math.floor(100000+Math.random()*900000)}`;
}

// ── Compress image before upload (max 1200px wide, 0.78 quality) ──
async function compressImage(file, maxWidth = 1200, quality = 0.78) {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })),
          "image/jpeg", quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadToCloudinary(file) {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    { method:"POST", body:formData }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = await res.json();
  return json.secure_url;
}

async function writeAudit(user, action, detail = {}) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      username:    user.username,
      name:        user.name,
      clinicId:    user.clinic || "mis",
      clinicLabel: user.clinicLabel,
      action, detail,
      ts: new Date().toISOString(),
    });
  } catch(e) { console.warn("Audit log failed:", e); }
}

// ══════════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════════
function useStore() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "patients"), snap => {
      setPatients(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
      setLoading(false);
    }, err => { console.error("Firestore:", err); setLoading(false); });
    return unsub;
  }, []);

  const addPatient = async (d, user) => {
    const p = { ...d, id:genCode(d.clinicId), createdAt:new Date().toISOString(), records:[], visits:[] };
    const ref = await addDoc(collection(db, "patients"), p);
    await writeAudit(user, "PATIENT_CREATED", { patientId:p.id, patientName:p.name, clinicId:p.clinicId });
    return { ...p, _docId: ref.id };
  };

  const editPatient = async (pid, updates, user) => {
    const patient = patients.find(p => p.id === pid);
    if (!patient) return;
    const allowed = ["name","phone","age","gender","address","source","notes"];
    const clean = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    await updateDoc(doc(db, "patients", patient._docId), clean);
    await writeAudit(user, "PATIENT_EDITED", { patientId:pid, patientName:patient.name, fields:Object.keys(clean) });
  };

  const addRecord = async (pid, r, user) => {
    const patient = patients.find(p => p.id === pid);
    if (!patient) return;
    let dataUrl = r.data;
    if (r.file) { dataUrl = await uploadToCloudinary(r.file); }
    const record = { type:r.type, name:r.name, data:dataUrl, ts:new Date().toISOString(), rid:Date.now().toString() };
    await updateDoc(doc(db, "patients", patient._docId), { records: arrayUnion(record) });
    await writeAudit(user, "RECORD_UPLOADED", { patientId:pid, fileName:r.name });
  };

  const deleteRecord = async (pid, rid, user) => {
    const patient = patients.find(p => p.id === pid);
    if (!patient) return;
    await updateDoc(doc(db, "patients", patient._docId), {
      records: (patient.records||[]).filter(r => r.rid !== rid)
    });
    await writeAudit(user, "RECORD_DELETED", { patientId:pid, rid });
  };

  const addVisit = async (pid, v, user) => {
    const patient = patients.find(p => p.id === pid);
    if (!patient) return;
    const visit = { ...v, ts:new Date().toISOString(), vid:Date.now().toString() };
    await updateDoc(doc(db, "patients", patient._docId), { visits: arrayUnion(visit) });
    await writeAudit(user, "VISIT_LOGGED", { patientId:pid, patientName:patient.name });
  };

  const deletePatient = async (pid, user) => {
    const patient = patients.find(p => p.id === pid);
    if (!patient) return;
    await deleteDoc(doc(db, "patients", patient._docId));
    await writeAudit(user, "PATIENT_DELETED", { patientId: pid, patientName: patient.name });
  };

  const searchPhone       = (q) => patients.filter(p => p.phone?.includes(q));
  const searchCode        = (q) => patients.filter(p => p.id?.toLowerCase().includes(q.toLowerCase()));
  const searchName        = (q) => patients.filter(p => p.name?.toLowerCase().includes(q.toLowerCase()));
  const findByPhoneGlobal = (phone) => patients.filter(p => p.phone === phone.trim());

  return { patients, loading, addPatient, editPatient, deletePatient, addRecord, deleteRecord, addVisit, searchPhone, searchCode, searchName, findByPhoneGlobal };
}

// ══════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [pending,   setPending]   = useState(false);
  const [theme,     setTheme]     = useState("light");
  const store = useStore();

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { setUser(null); setPending(false); setAuthReady(true); return; }

      const emailLower = fbUser.email?.toLowerCase();
      const metaEntry = Object.entries(USER_META).find(([, m]) => m.email.toLowerCase() === emailLower);

      if (metaEntry) {
        const [username, meta] = metaEntry;
        setUser({ uid:fbUser.uid, email:fbUser.email, name:meta.name, role:meta.role, clinic:meta.clinic||null, clinicLabel:meta.clinicLabel, username });
        setPending(false);
        setAuthReady(true);
        try {
          const ref = doc(db, "userProfiles", fbUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) await setDoc(ref, { email:fbUser.email, name:meta.name, role:meta.role, clinic:meta.clinic||"", clinicLabel:meta.clinicLabel, username, createdAt:new Date().toISOString() });
        } catch(e) { console.warn("Profile upsert:", e); }
        return;
      }

      try {
        const ref = doc(db, "userProfiles", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const profile = snap.data();
          if (profile.role && profile.role !== "") {
            setUser({ uid:fbUser.uid, email:fbUser.email, name:profile.name||fbUser.email, role:profile.role, clinic:profile.clinic||null, clinicLabel:profile.clinicLabel||"All Clinics", username:profile.username||fbUser.email });
            setPending(false);
          } else { setUser(null); setPending(true); }
        } else {
          await setDoc(ref, { email:fbUser.email, name:fbUser.email, role:"", clinic:"", clinicLabel:"", createdAt:new Date().toISOString() });
          setUser(null); setPending(true);
        }
      } catch(e) { console.error("Profile fetch:", e); setUser(null); setPending(false); }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const login = async (username, password) => {
    const meta = USER_META[username.trim()];
    if (!meta) return "Invalid username. Try sl-mis, sl-shyamal, etc.";
    try {
      await signInWithEmailAndPassword(auth, meta.email, password);
      return null;
    } catch(e) {
      console.error("Login:", e.code);
      if (["auth/wrong-password","auth/invalid-credential","auth/invalid-login-credentials"].includes(e.code))
        return "Incorrect password. Please try again.";
      if (e.code === "auth/user-not-found")
        return "Account not found in Firebase. Run First Time Setup.";
      if (e.code === "auth/too-many-requests")
        return "Too many attempts. Wait a few minutes.";
      return `Login failed: ${e.message}`;
    }
  };

  const registerWithEmail = async (email, password, name) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch(e) {
      if (e.code === "auth/email-already-in-use") return "Email already registered.";
      if (e.code === "auth/weak-password") return "Password must be at least 6 characters.";
      return "Registration failed. Please try again.";
    }
  };

  const logout = async () => {
    if (user) await writeAudit(user, "LOGOUT", {});
    await signOut(auth);
    setUser(null); setPending(false);
  };

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  if (!authReady || store.loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:16}}>
      <SLogo/>
      <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--muted)",fontSize:13,marginTop:8}}>
        <span style={{width:16,height:16,border:"2px solid #c4b5fd",borderTopColor:"#7c3aed",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>
        Connecting…
      </div>
    </div>
  );

  if (pending) return <PendingApproval onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>;
  if (!user)   return <Login onLogin={login} onRegister={registerWithEmail} theme={theme} toggleTheme={toggleTheme}/>;
  if (user.role === "mis") return <MIS user={user} store={store} onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>;
  return <Clinic user={user} store={store} onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>;
}

// ══════════════════════════════════════════════════════════
// FIRST TIME SETUP
// ══════════════════════════════════════════════════════════
function FirstTimeSetup({ onClose }) {
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    for (const [username, meta] of Object.entries(USER_META).filter(([u]) => u !== "sl-mis")) {
      try {
        await createUserWithEmailAndPassword(auth, meta.email, meta.initPwd);
        setLog(l => [...l, { ok:true, msg:`✅ ${username} created` }]);
      } catch(e) {
        if (e.code === "auth/email-already-in-use")
          setLog(l => [...l, { ok:true, msg:`⏭ ${username} already exists` }]);
        else
          setLog(l => [...l, { ok:false, msg:`❌ ${username}: ${e.code}` }]);
      }
    }
    setDone(true); setRunning(false);
  };

  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,background:"#00000077",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}>
      <div style={{background:"var(--card)",borderRadius:18,padding:30,maxWidth:520,width:"100%",border:"1px solid var(--cardborder)",boxShadow:"0 32px 80px #00000040"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"var(--text1)",marginBottom:6}}>First Time Setup</div>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.6}}>Creates all 24 clinic accounts in Firebase Auth. <strong style={{color:"var(--accent)"}}>Run once only.</strong></div>
        {!running && !done && (
          <div style={{display:"flex",gap:10}}>
            <button className="btn-p" onClick={run} style={S.btn}>▶ Run Setup Now</button>
            <button onClick={onClose} style={S.btnG}>Cancel</button>
          </div>
        )}
        {(running || log.length > 0) && (
          <div style={{background:"var(--bg)",borderRadius:10,padding:14,marginTop:16,maxHeight:280,overflow:"auto",fontSize:11,fontFamily:"monospace",border:"1px solid var(--border)"}}>
            {log.map((l,i) => <div key={i} style={{color:l.ok?"var(--green)":"var(--danger)",marginBottom:3}}>{l.msg}</div>)}
            {running && <div style={{color:"var(--muted)",marginTop:4}}>Working…</div>}
          </div>
        )}
        {done && (
          <div style={{marginTop:16}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#15803d",fontWeight:600,marginBottom:12}}>✅ All clinic accounts ready!</div>
            <button onClick={onClose} style={S.btn}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PENDING APPROVAL
// ══════════════════════════════════════════════════════════
function PendingApproval({ onLogout, theme, toggleTheme }) {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:24}}>
      <button onClick={toggleTheme} style={{position:"fixed",top:20,right:24,background:"var(--card)",border:"1px solid var(--border)",borderRadius:99,padding:"7px 14px",fontSize:13,cursor:"pointer",color:"var(--text1)"}}>
        {theme==="light"?"🌙 Dark":"☀️ Light"}
      </button>
      <div className="fadeUp" style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:22,padding:"48px 40px",maxWidth:420,width:"100%",textAlign:"center",boxShadow:"var(--cardshadow)"}}>
        <div style={{fontSize:52,marginBottom:16}}>⏳</div>
        <SLogo/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"var(--text1)",marginTop:22,marginBottom:10}}>Waiting for Approval</div>
        <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,marginBottom:28}}>
          Account created! Your <strong style={{color:"var(--accent)"}}>MIS Admin</strong> needs to assign your clinic access in Firestore.
        </div>
        <div style={{background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:11,padding:"12px 16px",fontSize:12,color:"var(--muted)",marginBottom:24}}>
          📧 Contact admin: jaydaiya10@gmail.com
        </div>
        <button onClick={onLogout} style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",border:"none",borderRadius:11,padding:"12px 32px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
function Login({ onLogin, onRegister, theme, toggleTheme }) {
  const [tab,   setTab]  = useState("signin");
  const [u,     setU]    = useState("");
  const [pw,    setPw]   = useState("");
  const [name,  setName] = useState("");
  const [email, setEmail]= useState("");
  const [rpw,   setRpw]  = useState("");
  const [err,   setErr]  = useState("");
  const [busy,  setBusy] = useState(false);
  const [show,  setShow] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const quote = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];

  const go = async () => {
    if(!u.trim()||!pw.trim()){setErr("Please enter both username and password.");return;}
    setBusy(true); setErr("");
    const error = await onLogin(u.trim(), pw);
    if (error) setErr(error);
    setBusy(false);
  };

  const goRegister = async () => {
    if(!name.trim()||!email.trim()||!rpw.trim()){setErr("Please fill all fields.");return;}
    if(rpw.length < 6){setErr("Password must be at least 6 characters.");return;}
    setBusy(true); setErr("");
    const error = await onRegister(email.trim(), rpw, name.trim());
    if (error) setErr(error);
    setBusy(false);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"var(--bg)"}}>
      {showSetup && <FirstTimeSetup onClose={()=>setShowSetup(false)}/>}

      {/* Left panel */}
      <div style={{flex:"0 0 46%",background:"linear-gradient(160deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%)",display:"flex",flexDirection:"column",padding:"52px 56px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-100,left:-100,width:450,height:450,borderRadius:"50%",border:"1px solid #ffffff12"}}/>
        <div style={{position:"absolute",top:-50,left:-50,width:280,height:280,borderRadius:"50%",border:"1px solid #ffffff18"}}/>
        <div style={{position:"absolute",bottom:-80,right:-60,width:380,height:380,borderRadius:"50%",border:"1px solid #ffffff0a"}}/>
        <div style={{position:"absolute",bottom:80,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",gap:4,opacity:0.15}}>
          {[10,24,16,38,20,48,28,42,18,32,14,28,22,44,12,36,24,42,16,30].map((h,i)=>(
            <div key={i} style={{width:3,height:h,background:"#fff",borderRadius:99}}/>
          ))}
        </div>
        <div style={{marginBottom:"auto"}}><SLogo white/></div>
        <div style={{marginBottom:52}}>
          <div style={{fontSize:10,color:"#c4b5fd",fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",marginBottom:18}}>Today's Note</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff",lineHeight:1.5,fontStyle:"italic",marginBottom:14}}>"{quote.q}"</div>
          <div style={{fontSize:12,color:"#c4b5fd"}}>{quote.a}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,#ffffff30,transparent)"}}/>
          <div style={{fontSize:10,color:"#a78bfa",letterSpacing:1.5}}>25 CLINICS · 5 STATES</div>
          <div style={{height:1,flex:1,background:"linear-gradient(90deg,transparent,#ffffff30)"}}/>
        </div>
      </div>

      {/* Right panel */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 56px",background:"var(--bg)",position:"relative"}}>
        <button onClick={toggleTheme} style={{position:"absolute",top:20,right:24,background:"var(--card)",border:"1px solid var(--border)",borderRadius:99,padding:"7px 14px",fontSize:13,cursor:"pointer",color:"var(--text1)",boxShadow:"var(--cardshadow)"}}>
          {theme==="light"?"🌙 Dark":"☀️ Light"}
        </button>

        <div className="fadeUp" style={{width:"100%",maxWidth:400}}>
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"var(--text1)",letterSpacing:-0.5}}>
              {tab==="signin" ? "Welcome back" : "Create account"}
            </div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:6}}>
              {tab==="signin" ? "Sign in to your SoundLife clinic portal" : "Register — MIS admin will grant your access"}
            </div>
          </div>

          <div style={{display:"flex",background:"var(--bg3)",borderRadius:11,padding:4,marginBottom:22,border:"1px solid var(--border)"}}>
            {["signin","register"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.18s",
                background:tab===t?"var(--accent)":"transparent", color:tab===t?"#fff":"var(--muted)"}}>
                {t==="signin" ? "Staff Sign In" : "New Staff Register"}
              </button>
            ))}
          </div>

          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"30px",boxShadow:"var(--cardshadow)"}}>
            {tab==="signin" && <>
              <label style={S.label}>Username</label>
              <input style={S.inp} value={u} onChange={e=>{setU(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="e.g. sl-mis, sl-shyamal" autoFocus autoComplete="username"/>
              <label style={{...S.label,marginTop:16}}>Password</label>
              <div style={{position:"relative"}}>
                <input style={{...S.inp,paddingRight:44}} type={show?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter password" autoComplete="current-password"/>
                <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:14,padding:4}}>{show?"🙈":"👁"}</button>
              </div>
              {err && <ErrBox msg={err}/>}
              <button className="btn-p" onClick={go} disabled={busy} style={{marginTop:20,width:"100%",padding:"13px",background:busy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px #7c3aed33"}}>
                {busy?<Spin/>:"Sign In →"}
              </button>
              <div style={{marginTop:16,padding:"10px 13px",background:"var(--accentbg)",borderRadius:9,border:"1px solid var(--border)",fontSize:11,color:"var(--muted)",lineHeight:1.6}}>
                👆 Use your assigned username (e.g. <strong>sl-shyamal</strong>) and password. Contact MIS admin if you don't have one.
              </div>
            </>}

            {tab==="register" && <>
              <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:9,padding:"10px 13px",fontSize:11,color:"#92400e",marginBottom:16,lineHeight:1.6}}>
                ⚠️ This is only for staff who don't have a clinic username. After registering, MIS admin will assign your access.
              </div>
              <label style={S.label}>Full Name</label>
              <input style={S.inp} value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder="Your full name" autoFocus/>
              <label style={{...S.label,marginTop:14}}>Email Address</label>
              <input style={S.inp} type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="your@email.com"/>
              <label style={{...S.label,marginTop:14}}>Password</label>
              <div style={{position:"relative"}}>
                <input style={{...S.inp,paddingRight:44}} type={show?"text":"password"} value={rpw} onChange={e=>{setRpw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&goRegister()} placeholder="Minimum 6 characters"/>
                <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:14,padding:4}}>{show?"🙈":"👁"}</button>
              </div>
              {err && <ErrBox msg={err}/>}
              <button className="btn-p" onClick={goRegister} disabled={busy} style={{marginTop:20,width:"100%",padding:"13px",background:busy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {busy?<Spin/>:"Create Account →"}
              </button>
            </>}
          </div>

          <div style={{textAlign:"center",marginTop:16}}>
            <button onClick={()=>setShowSetup(true)} style={{background:"none",border:"none",fontSize:10,color:"var(--muted2)",cursor:"pointer",textDecoration:"underline"}}>
              First Time Setup (MIS Admin only)
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:8,fontSize:11,color:"var(--muted2)"}}>&copy; {new Date().getFullYear()} SoundLife Speech &amp; Hearing Clinic</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHELL
// ══════════════════════════════════════════════════════════
function Shell({ user, navItems, children, onLogout, theme, toggleTheme }) {
  const acl = "#7c3aed";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)",color:"var(--text1)"}}>
      <aside className="sidebar-full" style={{width:224,background:"var(--sidebar)",borderRight:"1px solid var(--sideborder)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto",boxShadow:"2px 0 12px #7c3aed08"}}>
        <div style={{padding:"22px 18px 14px"}}>
          <SLogo/>
          <div style={{marginTop:12,background:acl+"18",border:`1px solid ${acl}30`,borderRadius:8,padding:"5px 10px",fontSize:10,color:acl,fontWeight:700,letterSpacing:0.5,lineHeight:1.5}}>{user.clinicLabel}</div>
        </div>
        <nav style={{flex:1,padding:"4px 10px",display:"flex",flexDirection:"column",gap:1}}>
          {navItems.map(item=>(
            <button key={item.id} className="slink" onClick={item.onClick}
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:9,border:"none",background:item.active?"var(--accentbg)":"transparent",color:item.active?acl:"var(--muted)",fontSize:12.5,cursor:"pointer",textAlign:"left",width:"100%",borderLeft:item.active?`3px solid ${acl}`:"3px solid transparent",fontWeight:item.active?600:400,transition:"all 0.15s"}}>
              <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0,color:"inherit"}}>{item.icon}</span>
              <span className="sidebar-label" style={{flex:1}}>{item.label}</span>
              {item.badge>0&&<span className="sidebar-label" style={{background:acl+"20",color:acl,borderRadius:99,padding:"1px 7px",fontSize:9,fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid var(--sideborder)"}}>
          <button onClick={toggleTheme} style={{width:"100%",marginBottom:10,padding:"8px",background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text2)",fontSize:11,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {theme==="light"?"🌙 Dark Mode":"☀️ Light Mode"}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:acl,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{user.name[0]}</div>
            <div style={{minWidth:0}}>
              <div className="sidebar-label" style={{fontSize:12,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div className="sidebar-label" style={{fontSize:10,color:"var(--muted2)"}}>{user.username}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"7px",background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",fontSize:11,cursor:"pointer"}}>← Sign Out</button>
        </div>
      </aside>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"auto"}}>{children}</div>
    </div>
  );
}

function TopBar({ title, sub, actions }) {
  return (
    <div style={{padding:"16px 26px",borderBottom:"1px solid var(--sideborder)",background:"var(--topbar)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:20,boxShadow:"0 1px 0 var(--border)"}}>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"var(--text1)",letterSpacing:-0.3}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{sub}</div>}
      </div>
      {actions&&<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>{actions}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MIS DASHBOARD
// ══════════════════════════════════════════════════════════
function MIS({ user, store, onLogout, theme, toggleTheme }) {
  const [tab,setTab]=useState("overview"); const [selected,setSel]=useState(null); const [lightbox,setLb]=useState(null);
  const nav=[
    {id:"overview",  icon:"◈", label:"Overview",        active:tab==="overview",  onClick:()=>setTab("overview")},
    {id:"search",    icon:"⌕", label:"Search Patient",  active:tab==="search",    onClick:()=>setTab("search")},
    {id:"all",       icon:"☰", label:"All Patients",    active:tab==="all",       onClick:()=>setTab("all"), badge:store.patients.length},
    {id:"gallery",   icon:"⬚", label:"Records Gallery", active:tab==="gallery",   onClick:()=>setTab("gallery")},
    {id:"analytics", icon:"◉", label:"Analytics",       active:tab==="analytics", onClick:()=>setTab("analytics")},
    {id:"audit",     icon:"🔒", label:"Audit Log",       active:tab==="audit",     onClick:()=>setTab("audit")},
  ];
  return (
    <Shell user={user} navItems={nav} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}>
      {tab==="overview"  && <MISOverview store={store} onSelect={setSel} setLb={setLb}/>}
      {tab==="search"    && <SearchView  store={store} onSelect={setSel} isMIS user={user}/>}
      {tab==="all"       && <AllPatients store={store} onSelect={setSel}/>}
      {tab==="gallery"   && <Gallery     store={store} setLb={setLb}/>}
      {tab==="analytics" && <Analytics   store={store}/>}
      {tab==="audit"     && <AuditLog/>}
      {selected && <PatientModal p={selected} store={store} onClose={()=>setSel(null)} readOnly setLb={setLb} user={user}/>}
      {lightbox  && <Lightbox {...lightbox} onClose={()=>setLb(null)}/>}
    </Shell>
  );
}

function MISOverview({ store, onSelect, setLb }) {
  const total=store.patients.length;
  const totalRec=store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const today=store.patients.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;
  const regions=Object.entries(REGIONS).map(([r,ids])=>({r,count:store.patients.filter(p=>ids.includes(p.clinicId)).length,n:ids.length}));
  const recent=[...store.patients].reverse().slice(0,6);
  const recentImgs=store.patients.flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p}))).sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,8);
  return (
    <div>
      <TopBar title="SoundLife MIS" sub={new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        actions={
          <div style={{display:"flex",gap:8}}>
            <button className="btn-p" onClick={()=>exportToExcel(store.patients,"SoundLife_All_Patients")} style={{...S.btn,background:"linear-gradient(135deg,#059669,#047857)",fontSize:12,padding:"8px 14px"}}>⬇ Excel</button>
            <button className="btn-p" onClick={()=>exportToPDF(store.patients,"SoundLife Patient Report")} style={{...S.btn,background:"linear-gradient(135deg,#dc2626,#b91c1c)",fontSize:12,padding:"8px 14px"}}>⬇ PDF</button>
          </div>
        }/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
          {[[total,"Total Patients","👥"],[totalRec,"Total Records","📁"],[Object.keys(CLINICS).length,"Active Clinics","🏥"],[today,"Registered Today","✅"]].map(([v,l,ic],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",borderTop:"3px solid var(--accent)"}}>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>{ic} {l}</div>
              <div style={{fontSize:30,fontWeight:800,color:"var(--accent)"}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:18,marginBottom:18}}>
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
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",overflow:"auto",maxHeight:300}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:12}}>Recent Patients</div>
            {recent.length===0&&<Empty msg="No patients yet"/>}
            {recent.map(p=><PRow key={p.id} p={p} onClick={()=>onSelect(p)}/>)}
          </div>
        </div>
        {recentImgs.length>0&&(
          <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:14}}>Latest Uploaded Records</div>
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
// AUDIT LOG
// ══════════════════════════════════════════════════════════
function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("ts", "desc"), limit(500));
    const unsub = onSnapshot(q, snap => { setLogs(snap.docs.map(d => d.data())); setLoading(false); });
    return unsub;
  }, []);

  const ACTION_LABELS = {
    LOGIN:           { label:"Login",            icon:"🔐", color:"#059669" },
    LOGOUT:          { label:"Logout",           icon:"🚪", color:"#6d28d9" },
    PATIENT_CREATED: { label:"Patient Added",    icon:"👤", color:"#7c3aed" },
    PATIENT_EDITED:  { label:"Patient Edited",   icon:"✏️", color:"#0891b2" },
    PATIENT_DELETED: { label:"Patient Deleted",  icon:"🗑️", color:"#e84c3d" },
    RECORD_UPLOADED: { label:"Record Uploaded",  icon:"📎", color:"#0891b2" },
    RECORD_DELETED:  { label:"Record Deleted",   icon:"🗑️", color:"#e84c3d" },
    VISIT_LOGGED:    { label:"Visit Logged",     icon:"📝", color:"#d97706" },
  };

  const filtered = filter === "ALL" ? logs : logs.filter(l => l.action === filter);

  return (
    <div>
      <TopBar title="Audit Log" sub="Every action — last 500 entries"/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          <FBtn active={filter==="ALL"} onClick={()=>setFilter("ALL")}>All</FBtn>
          {Object.entries(ACTION_LABELS).map(([k,v])=>(
            <FBtn key={k} active={filter===k} onClick={()=>setFilter(k)}>{v.icon} {v.label}</FBtn>
          ))}
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,overflow:"hidden",boxShadow:"var(--cardshadow)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 1.5fr 1.5fr",padding:"10px 18px",background:"var(--accentbg)",fontSize:9,fontWeight:700,color:"var(--muted)",letterSpacing:1.2,textTransform:"uppercase",borderBottom:"1px solid var(--border)"}}>
            <div>Time</div><div>User</div><div>Clinic</div><div>Action</div><div>Detail</div>
          </div>
          {loading && <div style={{padding:20,textAlign:"center",color:"var(--muted)",fontSize:12}}>Loading…</div>}
          {!loading && filtered.length===0 && <Empty msg="No entries yet"/>}
          {filtered.map((l,i) => {
            const al = ACTION_LABELS[l.action] || { label:l.action, icon:"•", color:"var(--muted)" };
            const detail = l.detail?.patientName?`Patient: ${l.detail.patientName}`:l.detail?.fileName?`File: ${l.detail.fileName}`:l.detail?.fields?`Fields: ${l.detail.fields?.join(", ")}`:"—";
            return (
              <div key={i} className="row-hover" style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 1.5fr 1.5fr",padding:"10px 18px",borderTop:"1px solid var(--border)",fontSize:11,alignItems:"center"}}>
                <div style={{color:"var(--muted)",fontSize:10}}>{new Date(l.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                <div style={{fontWeight:600,color:"var(--text1)"}}>{l.username}</div>
                <div><span style={{background:"#7c3aed18",color:"#7c3aed",padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:600}}>{l.clinicLabel?.split("·")[0]?.trim()||"MIS"}</span></div>
                <div><span style={{background:al.color+"18",color:al.color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:600}}>{al.icon} {al.label}</span></div>
                <div style={{color:"var(--muted)",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CLINIC DASHBOARD
// ══════════════════════════════════════════════════════════
function Clinic({ user, store, onLogout, theme, toggleTheme }) {
  const [tab,setTab]=useState("home"); const [selected,setSel]=useState(null); const [lightbox,setLb]=useState(null);
  const myPts=store.patients.filter(p=>p.clinicId===user.clinic);
  const nav=[
    {id:"home",   icon:"⌂", label:"Home",          active:tab==="home",   onClick:()=>setTab("home")},
    {id:"search", icon:"⌕", label:"Search Patient", active:tab==="search", onClick:()=>setTab("search")},
    {id:"add",    icon:"+", label:"Add Patient",    active:tab==="add",    onClick:()=>setTab("add")},
  ];
  return (
    <Shell user={user} navItems={nav} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}>
      {tab==="home"   && <ClinicHome user={user} myPts={myPts} onAdd={()=>setTab("add")} onSearch={()=>setTab("search")}/>}
      {tab==="search" && <SearchView store={store} onSelect={setSel} clinicId={user.clinic} user={user}/>}
      {tab==="add"    && <AddPatient user={user} store={store} onDone={()=>setTab("home")} onCancel={()=>setTab("home")}/>}
      {selected && <PatientModal p={selected} store={store} onClose={()=>setSel(null)} setLb={setLb} currentClinicId={user.clinic} user={user}/>}
      {lightbox  && <Lightbox {...lightbox} onClose={()=>setLb(null)}/>}
    </Shell>
  );
}

// ── ClinicHome: export buttons removed ────────────────────
function ClinicHome({ user, myPts, onAdd, onSearch }) {
  const acl="#7c3aed"; const c=CLINICS[user.clinic];
  const totalRec=myPts.reduce((a,p)=>a+(p.records?.length||0),0);
  const today=myPts.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;
  const thisMonth=myPts.filter(p=>{const d=new Date(p.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length;
  const quote=QUOTES[Math.floor(Date.now()/86400000)%QUOTES.length];
  return (
    <div>
      {/* No export actions here — clinic staff do not have download authority */}
      <TopBar title={user.clinicLabel} sub={`${c?.city} · ${c?.region}`}
        actions={
          <button className="btn-p" onClick={onAdd} style={S.btn}>+ New Patient</button>
        }/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[[myPts.length,"Total Patients","👥"],[totalRec,"Records Uploaded","📋"],[today,"Registered Today","📅"],[thisMonth,"This Month","📆"]].map(([v,l,ic],i)=>(
            <div key={l} className="card-hover fadeUp" style={{animationDelay:`${i*0.07}s`,background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--cardshadow)",borderTop:`3px solid ${acl}`}}>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>{ic} {l}</div>
              <div style={{fontSize:30,fontWeight:800,color:acl}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
          <button className="card-hover btn-p" onClick={onSearch} style={{background:"var(--card)",border:`2px dashed ${acl}40`,borderRadius:16,padding:"28px 24px",cursor:"pointer",textAlign:"left",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:28,marginBottom:10}}>🔍</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--text1)",marginBottom:6}}>Search Patient</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Find by mobile number, case code, or name across all clinics.</div>
          </button>
          <button className="card-hover btn-p" onClick={onAdd} style={{background:`linear-gradient(135deg,${acl}18,${acl}08)`,border:`2px dashed ${acl}50`,borderRadius:16,padding:"28px 24px",cursor:"pointer",textAlign:"left",boxShadow:"var(--cardshadow)"}}>
            <div style={{fontSize:28,marginBottom:10}}>➕</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--text1)",marginBottom:6}}>Register New Patient</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Auto-generated case code assigned instantly.</div>
          </button>
        </div>
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
// SEARCH VIEW
// ══════════════════════════════════════════════════════════
function SearchView({ store, onSelect, isMIS, clinicId, user }) {
  const [q,setQ]=useState(""); const [type,setType]=useState("phone"); const [res,setRes]=useState(null);
  const [inlineLog,setInlineLog]=useState({}); const [inlineBy,setInlineBy]=useState({}); const [logDone,setLogDone]=useState({});
  const run=()=>{
    if(!q.trim())return;
    const r=type==="phone"?store.searchPhone(q.trim()):type==="code"?store.searchCode(q.trim()):store.searchName(q.trim());
    setRes(r);setInlineLog({});setInlineBy({});setLogDone({});
  };
  const submitLog=async(pid)=>{
    const note=(inlineLog[pid]||"").trim();
    const by=(inlineBy[pid]||"").trim();
    if(!note||!by)return;
    await store.addVisit(pid,{note,attendedBy:by,clinicId:store.patients.find(x=>x.id===pid)?.clinicId||clinicId},user);
    setLogDone(x=>({...x,[pid]:true}));setInlineLog(x=>({...x,[pid]:""}));setInlineBy(x=>({...x,[pid]:""}));
  };
  return (
    <div>
      <TopBar title={isMIS?"Global Search":"Search Patient"} sub="Search across all clinics"/>
      <div className="main-pad" style={{padding:"22px 26px",maxWidth:700}}>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"22px",boxShadow:"var(--cardshadow)"}}>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["phone","📱 Phone"],["code","🔢 Code"],["name","👤 Name"]].map(([t,l])=>(
              <button key={t} onClick={()=>setType(t)} style={{padding:"7px 15px",borderRadius:8,border:`1px solid ${type===t?"var(--accent)":"var(--border)"}`,background:type===t?"var(--accentbg)":"transparent",color:type===t?"var(--accent)":"var(--muted)",fontSize:12,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input style={{...S.inp,flex:1}} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder={type==="phone"?"Mobile number…":type==="code"?"Case code e.g. SHY-123456…":"Patient name…"}/>
            <button className="btn-p" onClick={run} style={S.btn}>Search</button>
          </div>
          <div style={{marginTop:16}}>
            {res===null&&<div style={{color:"var(--muted2)",fontSize:12,textAlign:"center",padding:18}}>Enter a query and press Search</div>}
            {res?.length===0&&<Empty msg="No patients found"/>}
            {res?.map(p=>{
              const c=CLINICS[p.clinicId];
              return (
                <div key={p.id} style={{background:"var(--accentbg)",border:"1px solid var(--border)",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                  <div className="row-hover" onClick={()=>onSelect(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,#7c3aed,#6d28d9)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{p.name?.[0]?.toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,color:"var(--text1)",fontSize:13}}>{p.name}</div>
                      <div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>📱 {p.phone} · {c?.label} · {c?.city}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <Cb code={p.id} color="#7c3aed"/>
                      <div style={{fontSize:9,color:"var(--muted2)",marginTop:3}}>{p.records?.length||0} records · {p.visits?.length||0} visits</div>
                    </div>
                  </div>
                  {!isMIS&&(
                    <div style={{borderTop:"1px solid var(--border)",padding:"10px 14px",background:"var(--card)"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:7}}>📝 Log Today's Visit</div>
                      {logDone[p.id]?(<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"7px 12px",fontSize:12,color:"#15803d",fontWeight:600}}>✅ Visit logged!</div>):(
                        <div style={{display:"flex",flexDirection:"column",gap:7}}>
                          <input style={{...S.inp,fontSize:12}} placeholder="👨‍⚕️ Audiologist name (required)…" value={inlineBy[p.id]||""} onChange={e=>setInlineBy(x=>({...x,[p.id]:e.target.value}))}/>
                          <div style={{display:"flex",gap:8}}>
                            <textarea style={{...S.inp,flex:1,minHeight:42,resize:"vertical",fontSize:12}} placeholder="Visit note…" value={inlineLog[p.id]||""} onChange={e=>setInlineLog(x=>({...x,[p.id]:e.target.value}))}/>
                            <button className="btn-p" onClick={()=>submitLog(p.id)} style={{...S.btn,alignSelf:"flex-end",fontSize:11,padding:"8px 14px",whiteSpace:"nowrap"}}>+ Log</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
  const [f,setF]=useState({name:"",phone:"",age:"",gender:"Male",address:"",source:"",notes:""});
  const [errs,setErrs]=useState({}); const [success,setSuccess]=useState(null); const [busy,setBusy]=useState(false);
  const [dupPatient,setDupPatient]=useState(null); const [dupNote,setDupNote]=useState(""); const [dupBy,setDupBy]=useState(""); const [dupLogDone,setDupLogDone]=useState(false);
  const set=(k,v)=>{setF(x=>({...x,[k]:v}));if(k==="phone")setDupPatient(null);};
  const validate=()=>{const e={};if(!f.name.trim())e.name="Required";if(!/^\d{10}$/.test(f.phone))e.phone="Must be 10 digits";if(!f.age||isNaN(f.age))e.age="Required";return e;};
  const acl="#7c3aed";
  const submit=async()=>{
    const e=validate();if(Object.keys(e).length){setErrs(e);return;}
    const existing=store.findByPhoneGlobal(f.phone);if(existing.length>0){setDupPatient(existing[0]);return;}
    setBusy(true);const p=await store.addPatient({...f,clinicId:user.clinic},user);setBusy(false);setSuccess(p);
  };
  if(success)return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div className="fadeUp" style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:18,padding:"44px 38px",textAlign:"center",maxWidth:420,width:"100%",boxShadow:"var(--cardshadow)"}}>
        <div style={{fontSize:52,marginBottom:12}}>✅</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"var(--text1)",marginBottom:6}}>Patient Registered!</div>
        <div style={{color:"var(--muted)",fontSize:12,marginBottom:20}}>Auto-generated Case Code:</div>
        <div style={{fontSize:36,fontWeight:800,color:acl,letterSpacing:5,marginBottom:8,fontFamily:"monospace"}}>{success.id}</div>
        <div style={{color:"var(--muted2)",fontSize:11,marginBottom:28}}>Share this code with the patient for all future visits.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="btn-p" onClick={()=>setSuccess(null)} style={S.btn}>Add Another</button>
          <button onClick={onDone} style={S.btnG}>Go to Home →</button>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      <TopBar title="Register New Patient" sub={user.clinicLabel}/>
      <div className="main-pad" style={{padding:"22px 26px",maxWidth:660}}>
        {dupPatient&&(
          <div className="fadeUp" style={{background:"#fff7ed",border:"2px solid #fb923c",borderRadius:14,padding:"18px 20px",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{fontSize:22}}>⚠️</div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#c2410c"}}>This number is already registered</div>
                <div style={{fontSize:12,color:"#9a3412",marginTop:2}}>At <strong>{CLINICS[dupPatient.clinicId]?.label}</strong>, {CLINICS[dupPatient.clinicId]?.city}.</div>
              </div>
            </div>
            <div style={{background:"var(--card)",border:"1px solid #fed7aa",borderRadius:10,padding:"12px 15px",marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--text1)",marginBottom:4}}>{dupPatient.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>📱 {dupPatient.phone} · <Cb code={dupPatient.id} color="#7c3aed"/> · {dupPatient.records?.length||0} records · {dupPatient.visits?.length||0} visits</div>
              {!dupLogDone?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <input style={{...S.inp,fontSize:12}} placeholder="👨‍⚕️ Audiologist name (required)…" value={dupBy} onChange={e=>setDupBy(e.target.value)}/>
                  <div style={{display:"flex",gap:8}}>
                    <textarea style={{...S.inp,flex:1,minHeight:52,resize:"vertical",fontSize:12}} placeholder="Log today's visit note…" value={dupNote} onChange={e=>setDupNote(e.target.value)}/>
                    <button className="btn-p" onClick={async()=>{if(!dupNote.trim()||!dupBy.trim())return;await store.addVisit(dupPatient.id,{note:dupNote,attendedBy:dupBy.trim(),clinicId:user.clinic},user);setDupNote("");setDupBy("");setDupLogDone(true);}}
                      style={{...S.btn,alignSelf:"flex-end",whiteSpace:"nowrap",fontSize:12,padding:"9px 16px"}}>+ Log</button>
                  </div>
                </div>
              ):(<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#15803d",fontWeight:600}}>✅ Visit logged!</div>)}
            </div>
            <button onClick={()=>setDupPatient(null)} style={S.btnG}>← Back to Form</button>
          </div>
        )}
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"26px",boxShadow:"var(--cardshadow)"}}>
          <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
            {[{k:"name",l:"Full Name *",t:"text",ph:"Patient's full name"},{k:"phone",l:"Mobile Number *",t:"tel",ph:"10-digit mobile"},{k:"age",l:"Age *",t:"number",ph:"Age in years"},{k:"address",l:"Address",t:"text",ph:"Area / City"}].map(x=>(
              <div key={x.k} style={{marginBottom:16}}>
                <label style={S.label}>{x.l}</label>
                <input style={S.inp} type={x.t} placeholder={x.ph} value={f[x.k]}
                  onChange={e=>{set(x.k,e.target.value);setErrs(r=>({...r,[x.k]:undefined}));}}
                  onBlur={x.k==="phone"?e=>{const ph=e.target.value.trim();if(/^\d{10}$/.test(ph)){const ex=store.findByPhoneGlobal(ph);if(ex.length>0)setDupPatient(ex[0]);}}:undefined}/>
                {errs[x.k]&&<div style={{color:"var(--danger)",fontSize:10,marginTop:3}}>{errs[x.k]}</div>}
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <label style={S.label}>Gender</label>
              <select style={S.inp} value={f.gender} onChange={e=>set("gender",e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select>
            </div>
            <div style={{marginBottom:16,gridColumn:"1/-1"}}>
              <label style={S.label}>📣 How did the patient hear about us?</label>
              <select style={S.inp} value={f.source} onChange={e=>set("source",e.target.value)}>
                <option value="">Select source…</option>
                {SOURCE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16,gridColumn:"1/-1"}}>
              <label style={S.label}>Chief Complaint / Initial Notes</label>
              <textarea style={{...S.inp,minHeight:76,resize:"vertical"}} placeholder="Symptoms, presenting complaint…" value={f.notes} onChange={e=>set("notes",e.target.value)}/>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-p" onClick={submit} disabled={busy} style={{...S.btn,background:busy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)",cursor:busy?"not-allowed":"pointer"}}>
              {busy?<><Spin/> Saving…</>:"Register & Generate Code"}
            </button>
            <button onClick={onCancel} style={S.btnG}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ALL PATIENTS (MIS)
// ══════════════════════════════════════════════════════════
function AllPatients({ store, onSelect }) {
  const [filter,setFilter]=useState("all");
  const list=filter==="all"?store.patients:store.patients.filter(p=>p.clinicId===filter);
  return (
    <div>
      <TopBar title="All Patients" sub={`${list.length} shown`}
        actions={
          <div style={{display:"flex",gap:8}}>
            <button className="btn-p" onClick={()=>exportToExcel(list,`SoundLife_${filter==="all"?"All":CLINICS[filter]?.label}`)} style={{...S.btn,background:"linear-gradient(135deg,#059669,#047857)",fontSize:12,padding:"8px 14px"}}>⬇ Excel</button>
            <button className="btn-p" onClick={()=>exportToPDF(list,filter==="all"?"All Patients Report":`${CLINICS[filter]?.label} Report`)} style={{...S.btn,background:"linear-gradient(135deg,#dc2626,#b91c1c)",fontSize:12,padding:"8px 14px"}}>⬇ PDF</button>
          </div>
        }/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}><FBtn active={filter==="all"} onClick={()=>setFilter("all")}>All Clinics</FBtn></div>
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
          {list.length===0&&<Empty msg="No patients found"/>}
          {[...list].reverse().map(p=>{const c=CLINICS[p.clinicId];return(
            <div key={p.id} className="row-hover table-row" onClick={()=>onSelect(p)} style={{display:"grid",gridTemplateColumns:"2fr 1.3fr 1.2fr 1.4fr 0.7fr 1fr",padding:"11px 18px",borderTop:"1px solid var(--border)",cursor:"pointer",fontSize:12,alignItems:"center"}}>
              <div style={{fontWeight:600,color:"var(--text1)"}}>{p.name}</div>
              <div><Cb code={p.id} color={c?.color}/></div>
              <div style={{color:"var(--muted)"}}>{p.phone}</div>
              <div><span style={{background:c?.color+"18",color:c?.color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label}</span></div>
              <div style={{color:"var(--muted)"}}>{p.records?.length||0}</div>
              <div style={{color:"var(--muted)"}}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════════════════════
function Gallery({ store, setLb }) {
  const [cf,setCf]=useState("all");
  const imgs=store.patients.filter(p=>cf==="all"||p.clinicId===cf).flatMap(p=>(p.records||[]).filter(r=>r.type==="image").map(r=>({...r,patient:p}))).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  return (
    <div>
      <TopBar title="Records Gallery" sub={`${imgs.length} images`}/>
      <div className="main-pad" style={{padding:"22px 26px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          <FBtn active={cf==="all"} onClick={()=>setCf("all")}>All</FBtn>
          {Object.entries(CLINICS).map(([id,c])=><FBtn key={id} active={cf===id} onClick={()=>setCf(id)} color={c.color}>{c.label}</FBtn>)}
        </div>
        {imgs.length===0&&<Empty msg="No images uploaded yet"/>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
          {imgs.map(r=><RCard key={r.rid} r={r} onView={()=>setLb({src:r.data,name:r.name,patient:r.patient})} showClinic/>)}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════
function Analytics({ store }) {
  const total=store.patients.length; const totalRec=store.patients.reduce((a,p)=>a+(p.records?.length||0),0);
  const regions=Object.entries(REGIONS).map(([r,ids])=>({r,count:store.patients.filter(p=>ids.includes(p.clinicId)).length}));
  const maxR=Math.max(...regions.map(x=>x.count),1);
  const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return{label:d.toLocaleDateString("en-IN",{month:"short"}),count:store.patients.filter(p=>{const pd=new Date(p.createdAt);return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear();}).length};});
  const maxM=Math.max(...months.map(m=>m.count),1);
  const sourceCounts=SOURCE_OPTIONS.map(s=>({s,count:store.patients.filter(p=>p.source===s).length})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const maxS=Math.max(...sourceCounts.map(x=>x.count),1);
  const unknown=store.patients.filter(p=>!p.source).length;
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
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
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
                  {m.count>0&&<div style={{fontSize:10,fontWeight:700,color:"var(--accent)"}}>{m.count}</div>}
                  <div style={{width:"100%",background:"linear-gradient(0deg,#7c3aed,#a78bfa)",borderRadius:"5px 5px 0 0",height:`${Math.max((m.count/maxM)*100,3)}%`,minHeight:3,transition:"height 1s cubic-bezier(.16,1,.3,1)"}}/>
                  <div style={{fontSize:10,color:"var(--muted)"}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:14,padding:"20px",boxShadow:"var(--cardshadow)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:16}}>📣 Patient Source Breakdown</div>
          {sourceCounts.length===0&&<Empty msg="No source data yet"/>}
          {sourceCounts.map(({s,count})=>(
            <div key={s} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:"var(--muted)"}}>{s}</span>
                <span style={{fontSize:12,fontWeight:700,color:"var(--accent)"}}>{count} <span style={{fontSize:10,color:"var(--muted2)",fontWeight:400}}>({Math.round(count/total*100)}%)</span></span>
              </div>
              <div style={{background:"var(--accentbg)",borderRadius:99,height:7}}>
                <div style={{width:`${(count/maxS)*100}%`,background:"linear-gradient(90deg,#7c3aed,#a78bfa)",height:"100%",borderRadius:99,transition:"width 1s cubic-bezier(.16,1,.3,1)",minWidth:count?4:0}}/>
              </div>
            </div>
          ))}
          {unknown>0&&<div style={{fontSize:11,color:"var(--muted2)",marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>⚠️ {unknown} patient{unknown>1?"s":""} without source recorded</div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT MODAL — with Edit tab
// ══════════════════════════════════════════════════════════
function PatientModal({ p, store, onClose, readOnly, setLb, currentClinicId, user }) {
  const [tab,setTab]=useState("info");
  const [note,setNote]=useState("");
  const [attendedBy,setAttendedBy]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const fileRef=useRef();
  const [busy,setBusy]=useState(false);
  const [editF,setEditF]=useState({});
  const [editBusy,setEditBusy]=useState(false);
  const [editDone,setEditDone]=useState(false);

  const live=store.patients.find(x=>x.id===p.id)||p;
  const c=CLINICS[live.clinicId];
  const acl="#7c3aed";

  const startEdit = () => {
    setEditF({ name:live.name, phone:live.phone, age:live.age, gender:live.gender||"Male", address:live.address||"", source:live.source||"", notes:live.notes||"" });
  };

  const saveEdit = async () => {
    if(!editF.name?.trim()) return;
    setEditBusy(true);
    await store.editPatient(live.id, editF, user);
    setEditBusy(false); setTab("info"); setEditDone(true);
    setTimeout(() => setEditDone(false), 3000);
  };

  const upload=async(e)=>{
    const files=Array.from(e.target.files);if(!files.length)return;
    setBusy(true);
    for(const f of files){await store.addRecord(live.id,{type:f.type.startsWith("image/")?"image":"document",name:f.name,file:f},user);}
    setBusy(false);
  };

  const tabs = readOnly
    ? ["info","records","visits"]
    : ["info","edit","records","visits"];

  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,background:"#00000066",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div style={{background:"var(--card)",border:`1px solid ${acl}30`,borderRadius:18,width:"100%",maxWidth:720,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px #00000040"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--border)",background:"var(--accentbg)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:13,background:`linear-gradient(135deg,#7c3aed,#6d28d9)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20}}>{live.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:"var(--text1)"}}>{live.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                <Cb code={live.id} color={acl}/>
                <span style={{background:acl+"18",color:acl,padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>{c?.label} · {c?.city}</span>
                {live.source&&<span style={{background:"#ede9fe",color:"#7c3aed",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>📣 {live.source}</span>}
                {editDone&&<span style={{background:"#f0fdf4",color:"#15803d",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600}}>✅ Saved!</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {user?.role==="mis"&&!confirmDelete&&(
              <button onClick={()=>setConfirmDelete(true)} style={{padding:"6px 12px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,color:"#dc2626",fontSize:11,cursor:"pointer",fontWeight:600}}>🗑 Delete Patient</button>
            )}
            {user?.role==="mis"&&confirmDelete&&(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:"#dc2626",fontWeight:600}}>Sure? This is permanent!</span>
                <button onClick={async()=>{await store.deletePatient(live.id,user);onClose();}} style={{padding:"5px 11px",background:"#dc2626",border:"none",borderRadius:7,color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>Yes, Delete</button>
                <button onClick={()=>setConfirmDelete(false)} style={{padding:"5px 10px",background:"transparent",border:"1px solid var(--border)",borderRadius:7,color:"var(--muted)",fontSize:11,cursor:"pointer"}}>Cancel</button>
              </div>
            )}
            <button onClick={onClose} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer",color:"var(--muted)",flexShrink:0}}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid var(--border)",background:"var(--card)",padding:"0 22px",gap:4}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>{setTab(t);if(t==="edit")startEdit();}} style={{padding:"11px 14px",background:"none",border:"none",borderBottom:`2px solid ${tab===t?acl:"transparent"}`,color:tab===t?acl:"var(--muted)",fontSize:12,cursor:"pointer",fontWeight:tab===t?700:400,marginBottom:-1,transition:"all 0.15s",textTransform:"capitalize"}}>
              {t==="records"?`Records (${live.records?.length||0})`:t==="visits"?`Visits (${live.visits?.length||0})`:t==="edit"?"✏️ Edit":t==="info"?"Patient Info":t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:"auto",padding:"20px 22px",background:"var(--bg)"}}>

          {/* INFO TAB */}
          {tab==="info"&&(
            <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Full Name",live.name],["Mobile",live.phone],["Age",live.age?`${live.age} yrs`:"—"],["Gender",live.gender||"—"],["Address",live.address||"—"],["Clinic",c?.label],["City",c?.city],["Case Code",live.id],["Registered",new Date(live.createdAt).toLocaleDateString("en-IN")]].map(([k,v])=>(
                <div key={k} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"var(--muted2)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--text1)",marginTop:4}}>{v||"—"}</div>
                </div>
              ))}
              <div style={{gridColumn:"1/-1",background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px",borderLeft:"3px solid #7c3aed"}}>
                <div style={{fontSize:9,color:"var(--muted2)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>📣 Patient Source</div>
                <div style={{fontSize:13,fontWeight:600,color:live.source?"var(--accent)":"var(--muted)"}}>
                  {live.source||<span style={{fontStyle:"italic",fontWeight:400}}>Not recorded</span>}
                </div>
              </div>
              {live.notes&&(
                <div style={{gridColumn:"1/-1",background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontSize:9,color:"var(--muted2)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>Initial Notes</div>
                  <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{live.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* EDIT TAB */}
          {tab==="edit"&&(
            <div>
              <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:12,padding:"20px",boxShadow:"var(--cardshadow)"}}>
                <div style={{fontSize:12,color:"var(--muted)",marginBottom:18,background:"var(--accentbg)",padding:"9px 13px",borderRadius:8,border:"1px solid var(--border)"}}>
                  ✏️ Edit patient details below. Case code <strong style={{color:"var(--accent)"}}>{live.id}</strong> and registration date cannot be changed.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
                  {[{k:"name",l:"Full Name *",t:"text"},{k:"phone",l:"Mobile Number",t:"tel"},{k:"age",l:"Age",t:"number"},{k:"address",l:"Address",t:"text"}].map(x=>(
                    <div key={x.k} style={{marginBottom:14}}>
                      <label style={S.label}>{x.l}</label>
                      <input style={S.inp} type={x.t} value={editF[x.k]||""} onChange={e=>setEditF(f=>({...f,[x.k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div style={{marginBottom:14}}>
                    <label style={S.label}>Gender</label>
                    <select style={S.inp} value={editF.gender||"Male"} onChange={e=>setEditF(f=>({...f,gender:e.target.value}))}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div style={{marginBottom:14,gridColumn:"1/-1"}}>
                    <label style={S.label}>Patient Source</label>
                    <select style={S.inp} value={editF.source||""} onChange={e=>setEditF(f=>({...f,source:e.target.value}))}>
                      <option value="">Select source…</option>
                      {SOURCE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:14,gridColumn:"1/-1"}}>
                    <label style={S.label}>Notes</label>
                    <textarea style={{...S.inp,minHeight:72,resize:"vertical"}} value={editF.notes||""} onChange={e=>setEditF(f=>({...f,notes:e.target.value}))}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn-p" onClick={saveEdit} disabled={editBusy} style={{...S.btn,cursor:editBusy?"not-allowed":"pointer",background:editBusy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)"}}>
                    {editBusy?<><Spin/> Saving…</>:"💾 Save Changes"}
                  </button>
                  <button onClick={()=>setTab("info")} style={S.btnG}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* RECORDS TAB */}
          {tab==="records"&&(
            <div>
              {!readOnly&&(
                <div style={{marginBottom:14}}>
                  <button className="btn-p" onClick={()=>fileRef.current.click()} disabled={busy} style={{...S.btn,background:busy?"var(--border)":"linear-gradient(135deg,#7c3aed,#6d28d9)",cursor:busy?"not-allowed":"pointer"}}>
                    {busy?<><Spin/> Uploading…</>:"📎 Upload Image / Report"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple style={{display:"none"}} onChange={upload}/>
                </div>
              )}
              {(!live.records||live.records.length===0)&&<Empty msg="No records uploaded yet"/>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
                {(live.records||[]).map(r=>(
                  <div key={r.rid} className="rec-card" style={{borderRadius:11,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card)",cursor:r.type==="image"?"pointer":"default"}} onClick={()=>r.type==="image"&&setLb({src:r.data,name:r.name})}>
                    {r.type==="image"?<img src={r.data} style={{width:"100%",height:115,objectFit:"cover",display:"block"}} alt={r.name}/>:<div style={{height:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:26,color:"var(--muted)"}}>📄<div style={{fontSize:10,color:"var(--muted2)",marginTop:5,textAlign:"center",padding:"0 6px"}}>{r.name}</div></div>}
                    <div style={{padding:"7px 9px",borderTop:"1px solid var(--border)"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                      <div style={{fontSize:9,color:"var(--muted2)",marginTop:2}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div>
                    </div>
                    {!readOnly&&<button onClick={e=>{e.stopPropagation();store.deleteRecord(live.id,r.rid,user);}} style={{width:"100%",padding:"5px",background:"#fef2f2",border:"none",borderTop:"1px solid var(--border)",color:"#dc2626",fontSize:10,cursor:"pointer"}}>Remove</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISITS TAB */}
          {tab==="visits"&&(
            <div>
              {!readOnly&&(
                <div style={{background:"var(--card)",border:"1px solid var(--cardborder)",borderRadius:11,padding:"14px",marginBottom:14,boxShadow:"var(--cardshadow)"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:10}}>📝 Log Today's Visit</div>
                  <div style={{marginBottom:10}}>
                    <label style={S.label}>👨‍⚕️ Attended By (Audiologist Name) *</label>
                    <input style={S.inp} placeholder="e.g. Dr. Priya Shah" value={attendedBy} onChange={e=>setAttendedBy(e.target.value)}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <textarea style={{...S.inp,flex:1,minHeight:54,resize:"vertical"}} placeholder="Visit note / observations…" value={note} onChange={e=>setNote(e.target.value)}/>
                    <button className="btn-p" onClick={async()=>{if(!note.trim()||!attendedBy.trim())return;await store.addVisit(live.id,{note,attendedBy:attendedBy.trim(),clinicId:currentClinicId||live.clinicId},user);setNote("");setAttendedBy("");}} style={{...S.btn,alignSelf:"flex-end",whiteSpace:"nowrap",fontSize:12}}>+ Log Visit</button>
                  </div>
                  {(!note.trim()||!attendedBy.trim())&&<div style={{fontSize:10,color:"var(--muted2)",marginTop:6}}>⚠️ Both audiologist name and visit note are required.</div>}
                </div>
              )}
              {(!live.visits||live.visits.length===0)&&<Empty msg="No visit logs yet"/>}
              {[...(live.visits||[])].reverse().map(v=>(
                <div key={v.vid} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"11px 14px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5,flexWrap:"wrap",gap:4}}>
                    <div style={{fontSize:9,color:"var(--muted2)"}}>{new Date(v.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                    {v.clinicId&&CLINICS[v.clinicId]&&(<div style={{background:CLINICS[v.clinicId].color+"18",color:CLINICS[v.clinicId].color,padding:"2px 8px",borderRadius:5,fontSize:9,fontWeight:700}}>🏥 {CLINICS[v.clinicId].label} · {CLINICS[v.clinicId].city}</div>)}
                  </div>
                  {v.attendedBy&&<div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:4}}>👨‍⚕️ {v.attendedBy}</div>}
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
  const [zoom,setZoom]=useState(1); const [pos,setPos]=useState({x:0,y:0}); const drag=useRef(null);
  useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  const onWheel=e=>{e.preventDefault();setZoom(z=>Math.min(Math.max(z-e.deltaY*0.002,0.3),5));};
  const onMD=e=>{drag.current={x:e.clientX-pos.x,y:e.clientY-pos.y};};
  const onMM=e=>{if(!drag.current)return;setPos({x:e.clientX-drag.current.x,y:e.clientY-drag.current.y});};
  const onMU=()=>{drag.current=null;};
  return (
    <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:500,background:"#000000ee",display:"flex",flexDirection:"column",backdropFilter:"blur(10px)"}} onClick={onClose}>
      <div style={{padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d0b1a",borderBottom:"1px solid #2a2250",flexShrink:0}} onClick={e=>e.stopPropagation()}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#e8e4ff"}}>{name}</div>
          {patient&&<div style={{fontSize:10,color:"#6d5fa8",marginTop:2}}>{patient.name} · {CLINICS[patient.clinicId]?.label}</div>}
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
      <div style={{flex:1,overflow:"hidden",position:"relative",cursor:zoom>1?"grab":"zoom-in"}} onClick={e=>{e.stopPropagation();if(zoom===1)setZoom(2);}} onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}>
        <img src={src} alt={name} style={{position:"absolute",top:"50%",left:"50%",transform:`translate(calc(-50% + ${pos.x}px),calc(-50% + ${pos.y}px)) scale(${zoom})`,maxWidth:"92vw",maxHeight:"82vh",objectFit:"contain",borderRadius:8,boxShadow:"0 24px 70px #000",transition:drag.current?"none":"transform 0.2s",userSelect:"none",pointerEvents:"none"}}/>
      </div>
      <div style={{textAlign:"center",padding:"8px",fontSize:10,color:"#3d3070",background:"#0d0b1a"}}>Click to zoom · Scroll to zoom · Drag to pan · Esc to close</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ATOMS
// ══════════════════════════════════════════════════════════
function SLogo({ white }) {
  const BAR_COLORS=["#43a047","#66bb6a","#ffa726","#ef5350","#e53935","#ef5350","#ffa726","#66bb6a","#43a047","#66bb6a"];
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:2.5}}>
        {[4,9,6,14,8,18,10,15,7,11].map((h,i)=>(<div key={i} style={{width:3,height:h,background:white?"rgba(255,255,255,0.85)":BAR_COLORS[i],borderRadius:99}}/>))}
      </div>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,lineHeight:1,letterSpacing:-0.3}}>
          <span style={{color:white?"#fff":"#e53935",fontWeight:700}}>Sound</span>
          <span style={{color:white?"#ddd":"#555555",fontWeight:400}}>Life</span>
          <sup style={{fontSize:8,color:white?"#bbb":"#777777",verticalAlign:"super"}}>®</sup>
        </div>
        <div style={{fontSize:7.5,color:white?"rgba(255,255,255,0.7)":"#888888",letterSpacing:1.4,textTransform:"uppercase",marginTop:2,fontWeight:500}}>speech & hearing clinic</div>
      </div>
    </div>
  );
}
function Spin(){return <span style={{width:13,height:13,border:"2px solid #ffffff44",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite",marginRight:6}}/>;}
function ErrBox({msg}){return <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",borderRadius:9,padding:"9px 13px",fontSize:12,marginTop:12}}>{msg}</div>;}
function PRow({p,onClick}){const c=CLINICS[p.clinicId];return(<div className="row-hover" onClick={onClick} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",marginBottom:5,background:"var(--accentbg)",border:"1px solid var(--border)"}}><div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,#7c3aed,#6d28d9)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{p.name?.[0]?.toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,color:"var(--text1)",fontSize:13}}>{p.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>📱 {p.phone} · {c?.label} · {c?.city}</div></div><div style={{textAlign:"right",flexShrink:0}}><Cb code={p.id} color="#7c3aed"/><div style={{fontSize:9,color:"var(--muted2)",marginTop:3}}>{p.records?.length||0} records</div></div></div>);}
function RCard({r,onView,showClinic}){const c=r.patient?CLINICS[r.patient.clinicId]:null;return(<div className="rec-card" onClick={onView} style={{borderRadius:12,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card)"}}><div style={{position:"relative"}}><img src={r.data} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} alt={r.name}/>{showClinic&&c&&<div style={{position:"absolute",top:7,right:7,background:"#7c3aedee",borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#fff"}}>{c.label}</div>}</div><div style={{padding:"8px 10px"}}>{r.patient&&<div style={{fontSize:11,fontWeight:600,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.patient.name}</div>}<div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{r.name}</div><div style={{fontSize:9,color:"var(--muted2)",marginTop:1}}>{new Date(r.ts).toLocaleDateString("en-IN")}</div></div></div>);}
function Cb({code,color="#7c3aed"}){return <span style={{background:color+"18",color,padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:0.5,fontFamily:"monospace"}}>{code}</span>;}
function FBtn({active,onClick,children,color="#7c3aed"}){return(<button onClick={onClick} style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${active?color:"var(--border)"}`,background:active?color+"18":"transparent",color:active?color:"var(--muted)",fontSize:10,cursor:"pointer",fontWeight:600,transition:"all 0.15s"}}>{children}</button>);}
function Empty({msg}){return <div style={{color:"var(--muted2)",fontSize:12,textAlign:"center",padding:"22px 0"}}>{msg}</div>;}

const S={
  label:{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,display:"block",marginBottom:6,textTransform:"uppercase"},
  inp:{width:"100%",padding:"10px 13px",background:"var(--inputbg)",border:"1px solid var(--border)",borderRadius:9,color:"var(--text1)",fontSize:13,transition:"all 0.2s"},
  btn:{padding:"10px 20px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 4px 12px #7c3aed33",display:"inline-flex",alignItems:"center",gap:6},
  btnG:{padding:"10px 20px",background:"transparent",border:"1px solid var(--border)",borderRadius:9,color:"var(--muted)",fontSize:13,fontWeight:600,cursor:"pointer"},
  ibtn:{padding:"6px 11px",background:"#1e1a38",border:"1px solid #3d3070",borderRadius:7,color:"#c4b5fd",fontSize:12,cursor:"pointer"},
};
