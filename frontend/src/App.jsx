import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("cm_token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const platformColor = (p) => ({ YouTube: "#ff4545", TikTok: "#00f2ea", Instagram: "#e1306c" }[p] || "#aaa");
const platformIcon = (p) => ({ YouTube: "▶", TikTok: "♪", Instagram: "◈" }[p] || "●");

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    * { box-sizing: border-box; }
    body { margin: 0; background: #070711; font-family: 'Syne', sans-serif; }
    input::placeholder, textarea::placeholder { color: #374151; }
    input:focus, textarea:focus { border-color: #f59e0b88 !important; outline: none; }
    button:disabled { opacity: 0.5; cursor: not-allowed !important; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 4px; }
  `;
  document.head.appendChild(style);
}

function Splash({ onDone }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProg(p => {
      if (p >= 100) { clearInterval(iv); setTimeout(onDone, 400); return 100; }
      return p + 2.5;
    }), 50);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:"#070711", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:320, height:320, background:"radial-gradient(circle, #f59e0b18 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <div style={{ fontSize:72, marginBottom:16 }}>⚡</div>
        <h1 style={{ fontSize:56, fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:-2 }}>CreatorMania</h1>
        <p style={{ color:"#4b5563", fontSize:15, marginBottom:44 }}>Intelligence for creators who grow fast</p>
        <div style={{ width:200, height:3, background:"#111128", borderRadius:4, margin:"0 auto 12px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#f59e0b,#ef4444)", borderRadius:4, transition:"width 0.05s linear" }} />
        </div>
        <p style={{ color:"#374151", fontSize:12 }}>Loading research engine...</p>
      </div>
    </div>
  );
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Email and password required");
    if (mode === "signup" && !form.name) return setError("Name is required");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("cm_token", data.token);
      localStorage.setItem("cm_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inputStyle = { width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #2a2a3e", background:"#111128", color:"#fff", fontSize:14 };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#070711" }}>
      <div style={{ flex:1, padding:"60px 48px", display:"flex", flexDirection:"column", justifyContent:"center", background:"#0d0d1a", borderRight:"1px solid #1a1a2e" }}>
        <div style={{ color:"#f59e0b", fontWeight:800, fontSize:18, marginBottom:52 }}>⚡ CreatorMania</div>
        <h2 style={{ color:"#fff", fontSize:38, fontWeight:800, lineHeight:1.2, marginBottom:36, letterSpacing:-1 }}>Decode what makes<br/>content go viral.</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:36 }}>
          {["🔬 Deep viral content breakdown", "📈 Algorithm signal analysis", "🎯 Hook & emotion triggers", "⏱ Posting time & frequency patterns", "💾 Unlimited research library — free"].map(f => (
            <div key={f} style={{ color:"#9ca3af", fontSize:14, paddingBottom:14, borderBottom:"1px solid #1a1a2e" }}>{f}</div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["▶","YouTube","#ff4545"],["♪","TikTok","#00f2ea"],["◈","Instagram","#e1306c"]].map(([icon,name,color]) => (
            <span key={name} style={{ padding:"6px 14px", borderRadius:20, background:color+"18", color:color, border:`1px solid ${color}33`, fontSize:13, fontWeight:600 }}>{icon} {name}</span>
          ))}
        </div>
      </div>

      <div style={{ width:460, padding:"60px 48px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"100%" }}>
          <div style={{ display:"flex", background:"#111128", borderRadius:10, marginBottom:28, padding:4, gap:4 }}>
            {["login","signup"].map(m => (
              <button key={m} style={{ flex:1, padding:"10px 0", border:"none", background: mode===m?"#1e1e38":"transparent", color: mode===m?"#fff":"#6b7280", fontSize:14, fontWeight:700, cursor:"pointer", borderRadius:8 }}
                onClick={() => { setMode(m); setError(""); }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
          <p style={{ color:"#6b7280", fontSize:13, marginBottom:24 }}>{mode === "login" ? "Welcome back, creator" : "Start your research journey — free forever"}</p>
          {mode === "signup" && (
            <div style={{ marginBottom:14 }}>
              <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
              <input style={inputStyle} placeholder="Your name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})} onKeyDown={e => e.key==="Enter" && submit()} />
          </div>
          {error && <div style={{ background:"#ef444418", border:"1px solid #ef444440", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13, marginBottom:16 }}>{error}</div>}
          <button style={{ width:"100%", padding:14, borderRadius:10, border:"none", background:"linear-gradient(90deg,#f59e0b,#ef4444)", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:12, letterSpacing:-0.2 }}
            onClick={submit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Enter CreatorMania →" : "Create Free Account →"}
          </button>
          <p style={{ textAlign:"center", color:"#374151", fontSize:12 }}>Free · Unlimited · No credit card</p>
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ data, onSave, saved }) {
  if (!data) return null;
  const sections = [
    { key:"hook",      label:"Hook Analysis",             icon:"🎣", color:"#f59e0b" },
    { key:"thumbnail", label:"Thumbnail & Title",          icon:"🖼", color:"#8b5cf6" },
    { key:"timing",    label:"Posting Time & Frequency",   icon:"⏱", color:"#10b981" },
    { key:"emotion",   label:"Audience Emotion Triggers",  icon:"💥", color:"#ef4444" },
    { key:"algorithm", label:"Algorithm Signals",          icon:"📊", color:"#3b82f6" },
  ];
  return (
    <div style={{ background:"#0d0d1a", borderRadius:16, border:"1px solid #1a1a2e", overflow:"hidden", animation:"fadeIn 0.3s ease" }}>
      <div style={{ padding:"20px 24px", borderBottom:"1px solid #1a1a2e", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <div style={{ color:"#6b7280", fontSize:12, wordBreak:"break-all", marginBottom:8 }}>{data.url || data.title}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <span style={{ background:platformColor(data.platform)+"22", color:platformColor(data.platform), border:`1px solid ${platformColor(data.platform)}44`, fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>
              {platformIcon(data.platform)} {data.platform}
            </span>
            <span style={{ background:"#f59e0b22", color:"#f59e0b", border:"1px solid #f59e0b44", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
              🔥 Viral Score: {data.viralScore}/100
            </span>
          </div>
        </div>
        {!saved
          ? <button style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #f59e0b66", background:"#f59e0b22", color:"#f59e0b", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }} onClick={() => onSave(data)}>💾 Save</button>
          : <span style={{ color:"#10b981", fontSize:13, fontWeight:700 }}>✓ Saved</span>
        }
      </div>
      <div style={{ padding:"16px 24px", background:"#111128", borderBottom:"1px solid #1a1a2e" }}>
        <p style={{ color:"#d1d5db", fontSize:14, lineHeight:1.8, margin:0 }}>{data.summary}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"#1a1a2e" }}>
        {sections.map(sec => data[sec.key] && (
          <div key={sec.key} style={{ background:"#0d0d1a", padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{sec.icon}</span>
              <span style={{ color:sec.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{sec.label}</span>
            </div>
            <p style={{ color:"#9ca3af", fontSize:13, lineHeight:1.8, margin:0 }}>{data[sec.key]}</p>
          </div>
        ))}
      </div>
      {data.actionableSteps && (
        <div style={{ padding:"18px 24px", background:"#0a1a0f", borderTop:"1px solid #10b98130" }}>
          <p style={{ color:"#10b981", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>⚡ Apply This To Your Content</p>
          <p style={{ color:"#9ca3af", fontSize:13, lineHeight:1.8, margin:0 }}>{data.actionableSteps}</p>
        </div>
      )}
    </div>
  );
}

function AnalyzerTab({ onSave, savedUrls }) {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url.trim()) return setError("Paste a video URL to analyze");
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/analyze`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ url, platform }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:860 }}>
      <h2 style={{ color:"#fff", fontSize:26, fontWeight:800, margin:"0 0 6px", letterSpacing:-0.5 }}>Viral Content Analyzer</h2>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:28, lineHeight:1.6 }}>Paste any YouTube, TikTok, or Instagram URL. Get a full AI breakdown — hook strength, emotion triggers, algorithm signals, and what to steal for your own content.</p>

      <div style={{ background:"#0d0d1a", borderRadius:14, padding:20, border:"1px solid #1a1a2e", marginBottom:28 }}>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {["YouTube","TikTok","Instagram"].map(p => (
            <button key={p} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${platform===p ? platformColor(p)+"66" : "#2a2a3e"}`, background: platform===p ? platformColor(p)+"18" : "transparent", color: platform===p ? platformColor(p) : "#6b7280", fontSize:13, fontWeight:700, cursor:"pointer" }}
              onClick={() => setPlatform(p)}>{platformIcon(p)} {p}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input style={{ flex:1, padding:"11px 16px", borderRadius:10, border:"1px solid #2a2a3e", background:"#111128", color:"#fff", fontSize:14 }}
            placeholder={`Paste ${platform} video URL here...`} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==="Enter" && analyze()} />
          <button style={{ padding:"11px 24px", borderRadius:10, border:"none", background:"linear-gradient(90deg,#f59e0b,#ef4444)", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}
            onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze →"}</button>
        </div>
        {error && <div style={{ background:"#ef444418", border:"1px solid #ef444440", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13, marginTop:12 }}>{error}</div>}
      </div>

      {loading && (
        <div style={{ textAlign:"center", padding:"52px 0" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #1a1a2e", borderTop:"3px solid #f59e0b", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
          <p style={{ color:"#e5e7eb", fontSize:15, fontWeight:700, margin:"0 0 6px" }}>Analyzing viral signals...</p>
          <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Breaking down hook, emotion triggers, algorithm patterns</p>
        </div>
      )}

      {result && <AnalysisCard data={result} onSave={onSave} saved={savedUrls.includes(result.url)} />}
    </div>
  );
}

function TrendingTab({ onSave, savedUrls }) {
  const [platform, setPlatform] = useState("YouTube");
  const [niche, setNiche] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);
  const niches = ["Tech","Finance","Fitness","Beauty","Gaming","Food","Travel","Education","Business","Comedy"];

  const fetchTrending = async () => {
    setLoading(true); setItems([]); setSelected(null);
    try {
      const res = await fetch(`${API}/trending?platform=${platform}&niche=${encodeURIComponent(niche)}`, { headers:authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const analyzeItem = async (item) => {
    setAnalyzing(item.url); setSelected(null);
    try {
      const res = await fetch(`${API}/analyze`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ url:item.url, platform, title:item.title }) });
      const data = await res.json();
      setSelected(data);
    } catch(e) { console.error(e); }
    finally { setAnalyzing(null); }
  };

  return (
