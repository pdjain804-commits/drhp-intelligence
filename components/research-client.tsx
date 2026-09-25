"use client";
import { useState } from "react";
import type { CompanyAnalysis } from "../lib/types";

export function ResearchClient({ company, detailUrl, pdfUrl }: { company: string; detailUrl: string; pdfUrl?: string }) {
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/analyze", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({company, detailUrl, pdfUrl})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  if (!analysis) return <div className="grid">
    <div className="card"><h3>AI research pack</h3><p className="muted">Click below to fetch the live DRHP from SEBI, extract the document and generate a structured analyst memo. Nothing is stored in a local database.</p><button className={`cta primary ${loading ? "loading" : ""}`} onClick={run}>{loading ? "Reading DRHP + building memo…" : "Generate AI analysis"}</button>{error && <p className="red">{error}</p>}</div>
    <div className="card"><h3>What will be produced</h3><div className="list"><div>✓ Executive company summary</div><div>✓ Financial KPI extraction</div><div>✓ Business & industry view</div><div>✓ Risks / diligence flags</div><div>✓ Listed-peer discovery</div><div>✓ IPO valuation framework</div><div>✓ Post-listing cohort framework</div><div>✓ Questions for analyst follow-up</div></div></div>
  </div>;

  return <>
    <div className="kpis">{analysis.metrics.slice(0,4).map((m,i)=><div className="kpi" key={i}><div className="label">{m.label}</div><div className="value">{m.value}</div><div className="source">{m.period || "DRHP"}</div></div>)}</div>
    <div className="grid">
      <div className="card"><h3>Executive summary</h3><p>{analysis.executiveSummary}</p><h3 style={{marginTop:18}}>Business model</h3><p>{analysis.businessModel}</p></div>
      <div className="card"><h3>IPO structure</h3><div className="pillline"><span>Fresh issue</span><b>{analysis.ipoStructure.freshIssue}</b></div><div className="pillline"><span>OFS</span><b>{analysis.ipoStructure.ofs}</b></div><div className="pillline"><span>Use of proceeds</span><b>{analysis.ipoStructure.useOfProceeds}</b></div><h3 style={{marginTop:18}}>Valuation</h3><p className="muted">{analysis.valuation.status}</p></div>
    </div>
    <div className="two">
      <div className="card"><h3>Research strengths</h3><div className="list">{analysis.strengths.map((x,i)=><div key={i} className="green">• {x}</div>)}</div></div>
      <div className="card"><h3>Risk / diligence flags</h3><div className="list">{analysis.risks.map((x,i)=><div key={i} className="amber">• {x}</div>)}</div></div>
    </div>
    <div className="two">
      <div className="card"><h3>Listed peer signals</h3>{analysis.peerSignals.length ? analysis.peerSignals.map((p,i)=><div className="pillline" key={i}><span><b>{p.peer}</b><br/><span className="muted">{p.whyComparable}</span></span><span className="source">{p.notes || ""}</span></div>) : <div className="muted">No peer set reliably extracted from the DRHP.</div>}</div>
      <div className="card"><h3>IPO cohort framework</h3><p>{analysis.cohortFramework.description}</p><div className="list">{analysis.cohortFramework.measures.map((m,i)=><div key={i}>• {m}</div>)}</div></div>
    </div>
    <div className="card" style={{marginTop:18}}><h3>Analyst questions</h3><div className="list">{analysis.analystQuestions.map((q,i)=><div key={i}>• {q}</div>)}</div></div>
    <div className="card" style={{marginTop:18}}><h3>Document evidence</h3><div className="list">{analysis.citations.map((c,i)=><div key={i}><b>{c.title}</b>{c.page ? ` · p. ${c.page}` : ""}{c.quote ? <div className="source">{c.quote}</div> : null}</div>)}</div></div>
    <div style={{marginTop:16}}><button className="cta" onClick={()=>{setAnalysis(null);}}>Regenerate / refresh</button></div>
  </>;
}
