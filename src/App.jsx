import { useState, useRef } from "react";

const STAGES = ["script", "prompt", "video", "upload"];
const STAGE_LABELS = { script: "📝 Script", prompt: "🎬 Prompts", video: "🎮 2×15s", upload: "▶️ YouTube" };

function StageBar({ stageStatus }) {
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
      {STAGES.map((s) => {
        const st = stageStatus[s];
        const bg = st === "done" ? "#39ff14" : st === "running" ? "#f7c948" : st === "error" ? "#ff3860" : "#1a1a3e";
        return (
          <div key={s} style={{ flex: 1, padding: "5px 2px", borderRadius: 6, background: bg, color: bg === "#1a1a3e" ? "#555" : "#000", fontSize: 10, fontWeight: 700, textAlign: "center", fontFamily: "monospace", transition: "background 0.4s", boxShadow: st === "running" ? "0 0 10px #f7c948" : st === "done" ? "0 0 6px #39ff1455" : "none" }}>
            {STAGE_LABELS[s]}
          </div>
        );
      })}
    </div>
  );
}

function JobCard({ job, onToggle, ytToken, onUpload }) {
  const overall = job.stageStatus.upload === "done" ? "done"
    : Object.values(job.stageStatus).some(v => v === "error") ? "error"
    : Object.values(job.stageStatus).some(v => v === "running") ? "running" : "idle";
  const bc = overall === "done" ? "#39ff14" : overall === "running" ? "#f7c948" : overall === "error" ? "#ff3860" : "#2a2a4e";
  return (
    <div style={{ background: "linear-gradient(135deg,#0d0d1a 60%,#12123a)", border: `1.5px solid ${bc}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: overall === "running" ? `0 0 16px ${bc}33` : overall === "done" ? "0 0 10px #39ff1422" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "monospace", color: "#a78bfa", fontSize: 9, letterSpacing: 2 }}>JOB #{job.id + 1}</div>
          <div style={{ color: "#e2e8f0", fontFamily: "Impact,sans-serif", fontSize: 16, letterSpacing: 1, marginTop: 2 }}>{job.topic}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {overall === "running" && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f7c948", boxShadow: "0 0 8px #f7c948", animation: "pulse 1s infinite" }} />}
          <button onClick={() => onToggle(job.id)} style={{ background: "none", border: "1px solid #3a3a5e", color: "#a78bfa", borderRadius: 5, padding: "3px 9px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>
            {job.expanded ? "▲" : "▼ Details"}
          </button>
        </div>
      </div>
      <StageBar stageStatus={job.stageStatus} />
      {job.expanded && (
        <div style={{ marginTop: 10, borderTop: "1px solid #2a2a4e", paddingTop: 10 }}>
          {job.script && <div style={{ marginBottom: 8 }}><div style={{ color: "#a78bfa", fontFamily: "monospace", fontSize: 10, fontWeight: 700, marginBottom: 3 }}>📝 SCRIPT</div><pre style={{ background: "#0a0a18", border: "1px solid #2a2a4e", borderRadius: 6, padding: 10, color: "#cbd5e1", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: 140, overflowY: "auto", margin: 0, lineHeight: 1.5 }}>{job.script}</pre></div>}
          {job.prompts && <div style={{ marginBottom: 8 }}><div style={{ color: "#f7c948", fontFamily: "monospace", fontSize: 10, fontWeight: 700, marginBottom: 3 }}>🎬 VIDEO PROMPTS</div><pre style={{ background: "#0a0a18", border: "1px solid #2a2a4e", borderRadius: 6, padding: 10, color: "#cbd5e1", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: 120, overflowY: "auto", margin: 0, lineHeight: 1.5 }}>{job.prompts}</pre></div>}
          {job.clip1Url && <div style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: 11, marginTop: 4 }}>📹 Clip 1 (15s): <a href={job.clip1Url} target="_blank" rel="noreferrer" style={{ color: "#7dd3fc" }}>open</a> · <a href={job.clip1Url} download={`${job.topic.replace(/\s+/g, "_")}_part1.mp4`} style={{ color: "#7dd3fc" }}>⬇ download</a></div>}
          {job.clip2Url && <div style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: 11, marginTop: 3 }}>📹 Clip 2 (15s): <a href={job.clip2Url} target="_blank" rel="noreferrer" style={{ color: "#7dd3fc" }}>open</a> · <a href={job.clip2Url} download={`${job.topic.replace(/\s+/g, "_")}_part2.mp4`} style={{ color: "#7dd3fc" }}>⬇ download</a></div>}
          {job.clip1Url && job.clip2Url && (
            <pre style={{ background: "#0a0a18", border: "1px solid #2a2a4e", borderRadius: 6, padding: 8, color: "#39ff14", fontSize: 10, fontFamily: "monospace", marginTop: 8, marginBottom: 0, whiteSpace: "pre-wrap" }}>{`# Stitch into 30s Short:\nffmpeg -i part1.mp4 -i part2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" final_30s.mp4`}</pre>
          )}
          {job.stageStatus.video === "done" && job.stageStatus.upload !== "done" && (
            <div style={{ marginTop: 10 }}>
              {ytToken
                ? <button onClick={() => onUpload(job.id)} disabled={job.stageStatus.upload === "running"} style={{ background: job.stageStatus.upload === "running" ? "#2a2a4e" : "linear-gradient(135deg,#b91c1c,#ef4444)", border: "none", borderRadius: 6, color: "#fff", fontFamily: "monospace", fontSize: 11, padding: "7px 16px", cursor: job.stageStatus.upload === "running" ? "not-allowed" : "pointer" }}>
                    {job.stageStatus.upload === "running" ? "⏳ Uploading to YouTube..." : "▶️ Upload Both Clips to YouTube"}
                  </button>
                : <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}>🔗 Connect YouTube above to enable upload</div>
              }
            </div>
          )}
          {job.ytUrl1 && <div style={{ color: "#f87171", fontFamily: "monospace", fontSize: 11, marginTop: 6 }}>▶️ Part 1: <a href={job.ytUrl1} target="_blank" rel="noreferrer" style={{ color: "#f87171" }}>{job.ytUrl1}</a></div>}
          {job.ytUrl2 && <div style={{ color: "#f87171", fontFamily: "monospace", fontSize: 11, marginTop: 3 }}>▶️ Part 2: <a href={job.ytUrl2} target="_blank" rel="noreferrer" style={{ color: "#f87171" }}>{job.ytUrl2}</a></div>}
          {job.error && <div style={{ color: "#ff3860", fontFamily: "monospace", fontSize: 11, marginTop: 6 }}>⚠️ {job.error}</div>}
        </div>
      )}
    </div>
  );
}

export default function NumerisShortsPipeline() {
  const [dsKey, setDsKey] = useState(() => sessionStorage.getItem("ds_key") || "");
  const [arkKey, setArkKey] = useState(() => sessionStorage.getItem("ark_key") || "");
  const [ytClientId, setYtClientId] = useState(() => sessionStorage.getItem("yt_client_id") || "");
  const [ytToken, setYtToken] = useState(() => sessionStorage.getItem("yt_token") || "");
  const [topics, setTopics] = useState("How to land a perfect sniper shot in any FPS\nTop 5 movement tricks most players ignore\nHow to improve your reaction time instantly\nSecret to winning 1v3 situations");
  const [jobs, setJobs] = useState([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const abort = useRef(false);

  const addLog = (msg) => setLog(p => [{ t: new Date().toLocaleTimeString(), m: msg }, ...p.slice(0, 60)]);
  const updJob = (id, patch) => setJobs(p => p.map(j => j.id === id ? { ...j, ...patch } : j));
  const setStg = (id, s, st) => setJobs(p => p.map(j => j.id === id ? { ...j, stageStatus: { ...j.stageStatus, [s]: st } } : j));

  function connectYouTube() {
    if (!ytClientId.trim()) { alert("Enter your Google OAuth Client ID first"); return; }
    const scope = "https://www.googleapis.com/auth/youtube.upload";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(ytClientId.trim())}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    const popup = window.open(url, "ytOAuth", "width=500,height=620,left=200,top=100");
    if (!popup) { alert("Popup blocked — allow popups for this site and try again"); return; }
    const check = setInterval(() => {
      try {
        if (popup.location.href.includes("access_token")) {
          const params = new URLSearchParams(popup.location.hash.replace(/^#/, ""));
          const token = params.get("access_token");
          if (token) {
            setYtToken(token);
            sessionStorage.setItem("yt_token", token);
            addLog("✅ YouTube connected — token saved for this session");
          }
          popup.close();
          clearInterval(check);
        }
      } catch(e) { /* cross-origin while redirecting */ }
      if (popup.closed) clearInterval(check);
    }, 400);
  }

  async function uploadClipToYT(clipUrl, title, token) {
    let videoBlob;
    try {
      const r = await fetch(clipUrl);
      if (!r.ok) throw new Error(`status ${r.status}`);
      videoBlob = await r.blob();
    } catch(e) {
      throw new Error(`Cannot fetch video (CORS): download the clip and upload manually at studio.youtube.com`);
    }
    const meta = {
      snippet: { title: title.slice(0, 100), description: "Numeris Gaming Shorts — auto-generated\n#Shorts #Gaming", categoryId: "20", tags: ["gaming", "shorts", "tips"] },
      status: { privacyStatus: "private", selfDeclaredMadeForKids: false }
    };
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": String(videoBlob.size) }, body: JSON.stringify(meta) }
    );
    if (!initRes.ok) {
      if (initRes.status === 401) throw new Error("YouTube token expired — click Disconnect then reconnect");
      const err = await initRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `YouTube init failed: ${initRes.status}`);
    }
    const uploadUrl = initRes.headers.get("Location");
    if (!uploadUrl) throw new Error("No upload URL from YouTube");
    const uploadRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: videoBlob });
    if (!uploadRes.ok) throw new Error(`YouTube upload failed: ${uploadRes.status}`);
    const data = await uploadRes.json();
    return `https://youtube.com/shorts/${data.id}`;
  }

  async function handleUpload(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setStg(jobId, "upload", "running");
    addLog(`[JOB ${jobId + 1}] Uploading to YouTube...`);
    try {
      const ytUrl1 = await uploadClipToYT(job.clip1Url, `${job.topic} (Part 1) #Shorts`, ytToken);
      updJob(jobId, { ytUrl1 });
      addLog(`[JOB ${jobId + 1}] ✅ Part 1 uploaded`);
      const ytUrl2 = await uploadClipToYT(job.clip2Url, `${job.topic} (Part 2) #Shorts`, ytToken);
      updJob(jobId, { ytUrl2 });
      addLog(`[JOB ${jobId + 1}] ✅ Part 2 uploaded`);
      setStg(jobId, "upload", "done");
      addLog(`[JOB ${jobId + 1}] 🚀 Both clips live on YouTube!`);
    } catch(e) {
      setStg(jobId, "upload", "error");
      updJob(jobId, { error: e.message });
      addLog(`[JOB ${jobId + 1}] ❌ ${e.message}`);
      if (e.message.includes("expired")) { setYtToken(""); sessionStorage.removeItem("yt_token"); }
    }
  }

  async function generateClip(prompt, key, jobIdx, clipNum) {
    const BASE = "/proxy/ark/api/v3";
    addLog(`[JOB ${jobIdx + 1}] Submitting clip ${clipNum}/2 to Seedance...`);
    const startRes = await fetch(`${BASE}/contents/generations/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model: "dreamina-seedance-2-0-fast-260128", content: [{ type: "text", text: prompt }], ratio: "9:16", duration: 15, generate_audio: true, watermark: false })
    });
    const startData = await startRes.json();
    if (!startRes.ok) throw new Error(startData.message || startData.error?.message || "Seedance start error");
    const taskId = startData.id;
    if (!taskId) throw new Error("No task ID from Seedance");
    let delay = 5000;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay + 2000, 15000);
      const pollRes = await fetch(`${BASE}/contents/generations/tasks/${taskId}`, { headers: { "Authorization": `Bearer ${key}` } });
      const pollData = await pollRes.json();
      if (!pollRes.ok) throw new Error(pollData.message || "Poll error");
      const st = pollData.status;
      addLog(`[JOB ${jobIdx + 1}] Clip ${clipNum}: ${st}`);
      if (st === "succeeded" || st === "success" || st === "done") {
        const c = pollData.content;
        const items = Array.isArray(c) ? c : (c && typeof c === "object" ? [c] : []);
        const videoItem = items.find(x => x.type === "video_url");
        const url = videoItem?.video_url?.url || (c && typeof c === "object" && (c.video_url?.url || c.video_url)) || pollData.output?.video_url || pollData.video_url;
        if (!url) throw new Error(`Clip ${clipNum} done but no URL. Raw: ${JSON.stringify(pollData).slice(0, 200)}`);
        return url;
      }
      if (st === "failed" || st === "error") throw new Error(pollData.error?.message || `Clip ${clipNum} failed`);
    }
    throw new Error(`Clip ${clipNum} timed out`);
  }

  async function runJob(job, dsKey, aKey) {
    const { id, topic } = job;
    const callAI = async (sys, usr) => {
      const res = await fetch("/proxy/deepseek/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${dsKey}` },
        body: JSON.stringify({ model: "deepseek-chat", max_tokens: 1500, messages: [{ role: "system", content: sys }, { role: "user", content: usr }] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "DeepSeek error");
      return data.choices?.[0]?.message?.content || "";
    };

    setStg(id, "script", "running");
    addLog(`[JOB ${id + 1}] Generating script: "${topic}"`);
    let vo1 = "", vo2 = "";
    try {
      const raw = await callAI(
        `You are a YouTube Shorts scriptwriter for gaming tips & tricks. Write a 30s script split into two 15s parts.
Output EXACTLY this JSON (no markdown):
{"part1_voiceover":"<spoken words first 15s, hook+tip intro, hype gamer tone, max 40 words>","part2_voiceover":"<spoken words second 15s, tip demo+CTA, max 40 words>"}`,
        `Write a YouTube Shorts script for: "${topic}"`
      );
      try { const p = JSON.parse(raw.trim().replace(/^```json|```$/g, "").trim()); vo1 = p.part1_voiceover || raw; vo2 = p.part2_voiceover || raw; }
      catch { vo1 = raw; vo2 = raw; }
      updJob(id, { script: `PART 1:\n${vo1}\n\nPART 2:\n${vo2}` });
      setStg(id, "script", "done"); addLog(`[JOB ${id + 1}] ✅ Script done`);
    } catch(e) { setStg(id, "script", "error"); updJob(id, { error: e.message }); addLog(`[JOB ${id + 1}] ❌ ${e.message}`); return; }

    if (abort.current) return;
    setStg(id, "prompt", "running"); addLog(`[JOB ${id + 1}] Generating Seedance prompts...`);
    let prompt1 = "", prompt2 = "";
    try {
      const raw = await callAI(
        `You write Seedance AI video prompts for 9:16 vertical YouTube Shorts gaming videos.
Output EXACTLY this JSON (no markdown):
{"clip1":"<prompt>","clip2":"<prompt>"}
Each prompt: [VISUAL SCENE: camera, action, lighting, environment, gaming aesthetic] [VOICEOVER: "spoken words"]. Max 280 chars each.`,
        `Topic: ${topic}\nClip 1 voiceover (15s): "${vo1}"\nClip 2 voiceover (15s): "${vo2}"`
      );
      try { const p = JSON.parse(raw.trim().replace(/^```json|```$/g, "").trim()); prompt1 = p.clip1; prompt2 = p.clip2; }
      catch {
        prompt1 = `FPS gaming POV 9:16 vertical, neon HUD overlays, fast combat cuts, muzzle flash, cinematic lighting. VOICEOVER: "${vo1.slice(0, 80)}"`;
        prompt2 = `FPS tactical gameplay 9:16, slow-motion kill highlights, dramatic finish, score overlay. VOICEOVER: "${vo2.slice(0, 80)}"`;
      }
      updJob(id, { prompts: `CLIP 1:\n${prompt1}\n\nCLIP 2:\n${prompt2}` });
      setStg(id, "prompt", "done"); addLog(`[JOB ${id + 1}] ✅ Prompts ready`);
    } catch(e) { setStg(id, "prompt", "error"); updJob(id, { error: e.message }); return; }

    if (abort.current) return;
    setStg(id, "video", "running");
    try {
      const clip1Url = await generateClip(prompt1, aKey, id, 1);
      updJob(id, { clip1Url }); addLog(`[JOB ${id + 1}] ✅ Clip 1 ready`);
      if (abort.current) return;
      const clip2Url = await generateClip(prompt2, aKey, id, 2);
      updJob(id, { clip2Url }); addLog(`[JOB ${id + 1}] ✅ Clip 2 ready`);
      setStg(id, "video", "done"); addLog(`[JOB ${id + 1}] 🎮 Both clips ready — expand to download or upload`);
    } catch(e) { setStg(id, "video", "error"); updJob(id, { error: e.message }); addLog(`[JOB ${id + 1}] ❌ ${e.message}`); }
  }

  async function startPipeline() {
    if (!dsKey.trim()) { alert("Enter DeepSeek API key first"); return; }
    if (!arkKey.trim()) { alert("Enter BytePlus Ark API key first"); return; }
    const list = topics.split("\n").map(t => t.trim()).filter(Boolean);
    if (!list.length) return;
    sessionStorage.setItem("ds_key", dsKey.trim());
    sessionStorage.setItem("ark_key", arkKey.trim());
    abort.current = false; setRunning(true); setLog([]);
    const newJobs = list.map((t, i) => ({ id: i, topic: t, script: null, prompts: null, clip1Url: null, clip2Url: null, ytUrl1: null, ytUrl2: null, error: null, expanded: false, stageStatus: { script: "idle", prompt: "idle", video: "idle", upload: "idle" } }));
    setJobs(newJobs); addLog(`🎮 Pipeline started — ${list.length} Shorts queued`);
    for (const job of newJobs) { if (abort.current) break; await runJob(job, dsKey.trim(), arkKey.trim()); }
    setRunning(false); addLog("✅ All jobs complete!");
  }

  const done = jobs.filter(j => j.stageStatus.upload === "done").length;

  return (
    <div style={{ minHeight: "100vh", background: "#060612", backgroundImage: "radial-gradient(ellipse at 20% 20%,#1a0a3e 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,#0a1a3e 0%,transparent 50%)", fontFamily: "'Segoe UI',sans-serif", color: "#e2e8f0" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#0d0d1a} ::-webkit-scrollbar-thumb{background:#3a3a5e;border-radius:4px}`}</style>

      <div style={{ background: "linear-gradient(90deg,#0d0d1a,#12123a,#0d0d1a)", borderBottom: "1px solid #2a2a4e", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28 }}>🎮</div>
        <div>
          <div style={{ fontFamily: "Impact,sans-serif", fontSize: 20, letterSpacing: 4, color: "#a78bfa", textShadow: "0 0 20px #a78bfa88" }}>NUMERIS GAMING SHORTS PIPELINE</div>
          <div style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace", letterSpacing: 2 }}>DEEPSEEK · SEEDANCE 2.0 · FFMPEG STITCH · YOUTUBE UPLOAD</div>
        </div>
        {jobs.length > 0 && <div style={{ marginLeft: "auto", textAlign: "right" }}><div style={{ fontFamily: "monospace", fontSize: 22, color: "#39ff14", fontWeight: 700 }}>{done}/{jobs.length}</div><div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>DONE</div></div>}
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "22px 18px" }}>

        {/* DeepSeek Key */}
        <div style={{ background: "#0d0d1a", border: "1px solid #f7c94833", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: "monospace", color: "#f7c948", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>🔑 DEEPSEEK API KEY</div>
          <input type="password" placeholder="sk-..." value={dsKey} onChange={e => setDsKey(e.target.value)}
            style={{ width: "100%", background: "#060612", border: "1px solid #3a3a5e", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Seedance Key */}
        <div style={{ background: "#0d0d1a", border: "1px solid #39ff1433", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: "monospace", color: "#39ff14", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>🎬 BYTEPLUS ARK API KEY (SEEDANCE 2.0)</div>
          <input type="password" placeholder="ark-..." value={arkKey} onChange={e => setArkKey(e.target.value)}
            style={{ width: "100%", background: "#060612", border: "1px solid #3a3a5e", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }} />
          <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 9, marginTop: 5 }}>dreamina-seedance-2-0-fast · 9:16 · 2×15s clips → stitch to 30s</div>
        </div>

        {/* YouTube OAuth */}
        <div style={{ background: "#0d0d1a", border: `1px solid ${ytToken ? "#ef444433" : "#ef444422"}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <div style={{ fontFamily: "monospace", color: "#f87171", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>▶️ YOUTUBE CONNECT</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="text" placeholder="Google OAuth Client ID  (xxxx.apps.googleusercontent.com)" value={ytClientId}
              onChange={e => { setYtClientId(e.target.value); sessionStorage.setItem("yt_client_id", e.target.value); }}
              style={{ flex: 1, background: "#060612", border: "1px solid #3a3a5e", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: "#e2e8f0", outline: "none" }} />
            <button onClick={connectYouTube}
              style={{ background: ytToken ? "#14532d" : "linear-gradient(135deg,#b91c1c,#ef4444)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 11, fontWeight: 700, padding: "10px 18px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {ytToken ? "✅ Connected" : "🔗 Connect"}
            </button>
            {ytToken && <button onClick={() => { setYtToken(""); sessionStorage.removeItem("yt_token"); addLog("YouTube disconnected"); }}
              style={{ background: "none", border: "1px solid #3a3a5e", borderRadius: 8, color: "#64748b", fontFamily: "monospace", fontSize: 10, padding: "10px 12px", cursor: "pointer" }}>✕</button>}
          </div>
          <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 9, marginTop: 6 }}>
            {ytToken
              ? "✅ Token active — clips upload as private Shorts after generation"
              : "Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → add http://localhost:5173 as Authorised JS origin"}
          </div>
        </div>

        {/* Topics */}
        <div style={{ background: "linear-gradient(135deg,#0d0d1a,#12123a)", border: "1px solid #2a2a4e", borderRadius: 14, padding: 20, marginBottom: 22 }}>
          <div style={{ fontFamily: "monospace", color: "#a78bfa", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>⚡ BATCH TOPICS — ONE PER LINE</div>
          <textarea value={topics} onChange={e => setTopics(e.target.value)} disabled={running} rows={5}
            style={{ width: "100%", background: "#060612", border: "1px solid #3a3a5e", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, resize: "vertical", outline: "none", lineHeight: 1.7, color: "#e2e8f0" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={startPipeline} disabled={running}
              style={{ background: running ? "#2a2a4e" : "linear-gradient(135deg,#7c3aed,#a78bfa)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "Impact,sans-serif", fontSize: 15, letterSpacing: 2, padding: "10px 28px", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.5 : 1, boxShadow: running ? "none" : "0 0 20px #a78bfa44" }}>
              {running ? "⏳ RUNNING..." : "🚀 LAUNCH PIPELINE"}
            </button>
            {running && <button onClick={() => { abort.current = true; setRunning(false); addLog("⛔ Aborted"); }}
              style={{ background: "none", border: "1px solid #ff3860", borderRadius: 8, color: "#ff3860", fontFamily: "monospace", fontSize: 12, padding: "10px 16px", cursor: "pointer" }}>⛔ Abort</button>}
          </div>
        </div>

        {jobs.length === 0 && (
          <div style={{ background: "#0d0d1a", border: "1px solid #2a2a4e", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>PIPELINE ARCHITECTURE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[
                { icon: "🤖", label: "DeepSeek", sub: "Script + Prompts", color: "#a78bfa" }, "→",
                { icon: "🎬", label: "Seedance ×2", sub: "2 × 15s clips", color: "#f7c948" }, "→",
                { icon: "✂️", label: "FFmpeg", sub: "Stitch → 30s", color: "#7dd3fc" }, "→",
                { icon: "▶️", label: "YouTube", sub: "Auto-Upload", color: "#f87171" }
              ].map((s, i) =>
                s === "→" ? <div key={i} style={{ color: "#3a3a5e", fontSize: 18, padding: "0 2px" }}>→</div>
                  : <div key={i} style={{ flex: 1, textAlign: "center", background: "#0a0a18", border: `1px solid ${s.color}44`, borderRadius: 10, padding: "12px 4px" }}>
                    <div style={{ fontSize: 20 }}>{s.icon}</div>
                    <div style={{ color: s.color, fontFamily: "monospace", fontSize: 11, fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                    <div style={{ color: "#64748b", fontSize: 9, marginTop: 2 }}>{s.sub}</div>
                  </div>
              )}
            </div>
          </div>
        )}

        {jobs.map(job => <JobCard key={job.id} job={job} ytToken={ytToken} onUpload={handleUpload} onToggle={id => setJobs(p => p.map(j => j.id === id ? { ...j, expanded: !j.expanded } : j))} />)}

        {log.length > 0 && (
          <div style={{ background: "#020208", border: "1px solid #1a1a3e", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 11, maxHeight: 200, overflowY: "auto", marginTop: 8 }}>
            <div style={{ color: "#39ff14", letterSpacing: 2, fontSize: 10, marginBottom: 8 }}>⚡ LIVE LOG</div>
            {log.map((e, i) => <div key={i} style={{ color: i === 0 ? "#e2e8f0" : "#3a3a5e", marginBottom: 2 }}><span style={{ color: "#2a2a4e" }}>[{e.t}]</span> {e.m}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
