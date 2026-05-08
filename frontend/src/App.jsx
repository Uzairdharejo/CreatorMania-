import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("cm_token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

function Splash({ onDone }) {
  useEffect(() => { setTimeout(onDone, 2000); }, []);
  return <div style={{ minHeight:"100vh", background:"#070711", display:"flex", alignItems:"center", justifyContent:"center" }}><h1 style={{ color:"#fff", fontSize:48 }}>CreatorMania</h1></div>;
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await fetch(`${API}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, password, name: mode === "signup" ? "User" : undefined }) });
    const data = await res.json();
    if (data.token) { localStorage.setItem("cm_token", data.token); onAuth(data.user); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#070711", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:400, padding:40 }}>
        <h1 style={{ color:"#fff", textAlign:"center" }}>CreatorMania</h1>
        <input style={{ width:"100%", padding:10, marginBottom:10, background:"#111128", border:"1px solid #2a2a3e", color:"#fff", borderRadius:6 }} type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={{ width:"100%", padding:10, marginBottom:20, background:"#111128", border:"1px solid #2a2a3e", color:"#fff", borderRadius:6 }} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={{ width:"100%", padding:12, background:"#f59e0b", color:"#000", fontWeight:800, border:"none", borderRadius:6, cursor:"pointer" }} onClick={submit}>{mode === "login" ? "Login" : "Sign Up"}</button>
        <p style={{ color:"#6b7280", textAlign:"center", marginTop:10, cursor:"pointer" }} onClick={() => setMode(mode === "login" ? "signup" : "login")}>Switch to {mode === "login" ? "sign up" : "login"}</p>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const res = await fetch(`${API}/analyze`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ url, platform:"YouTube" }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#070711", padding:40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
        <h1 style={{ color:"#fff", margin:0 }}>CreatorMania</h1>
        <button onClick={onLogout} style={{ padding:"8px 16px", background:"#ef4444", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}>Logout</button>
      </div>
      
      <div style={{ maxWidth:800 }}>
        <h2 style={{ color:"#fff" }}>Analyze Content</h2>
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <input style={{ flex:1, padding:12, background:"#111128", border:"1px solid #2a2a3e", color:"#fff", borderRadius:6 }} placeholder="Paste URL here..." value={url} onChange={e => setUrl(e.target.value)} />
          <button style={{ padding:"12px 24px", background:"#f59e0b", color:"#000", fontWeight:800, border:"none", borderRadius:6, cursor:"pointer" }} onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
        </div>

        {result && (
          <div style={{ background:"#0d0d1a", border:"1px solid #1a1a2e", borderRadius:12, padding:20 }}>
            <h3 style={{ color:"#f59e0b", marginTop:0 }}>Viral Score: {result.viralScore}/100</h3>
            <p style={{ color:"#d1d5db" }}>{result.summary}</p>
            {result.hook && <p style={{ color:"#9ca3af" }}><strong>Hook:</strong> {result.hook}</p>}
            {result.actionableSteps && <p style={{ color:"#10b981" }}><strong>Tips:</strong> {result.actionableSteps}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("splash");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("cm_token");
    if (t) setPhase("dashboard");
  }, []);

  return phase === "splash" ? <Splash onDone={() => setPhase(user ? "dashboard" : "auth")} /> 
    : phase === "auth" ? <Auth onAuth={u => { setUser(u); setPhase("dashboard"); }} /> 
    : <Dashboard user={user} onLogout={() => { localStorage.clear(); setPhase("auth"); }} />;
        }
