import Link from "next/link";
import { getLatestDrhpFilings } from "../lib/sebi";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let filings = [] as Awaited<ReturnType<typeof getLatestDrhpFilings>>;
  let error = "";
  try { filings = await getLatestDrhpFilings(); } catch (e) { error = e instanceof Error ? e.message : "Could not load SEBI."; }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <div className="brand">DRHP Intelligence</div>
          <div className="sub">Live SEBI ingestion → AI screening → peer & valuation research</div>
        </div>
        <div className="badge"><span className="dot"/> SEBI source · no local database</div>
      </div>

      <div className="toolbar">
        <div className="badge">Only: Draft Offer Documents filed with SEBI</div>
        <div style={{marginLeft:"auto"}} className="muted">{filings.length} latest filings detected</div>
      </div>

      <div className="panel">
        {error ? <div className="empty">SEBI could not be fetched at the moment. {error}</div> : (
          <table>
            <thead><tr><th>Company</th><th>DRHP Filed</th><th>AI Research</th><th>DRHP</th></tr></thead>
            <tbody>
              {filings.map((f) => (
                <tr key={f.id}>
                  <td><Link className="company" href={`/company/${encodeURIComponent(f.id)}`}>{f.company}</Link></td>
                  <td className="date">{f.date}</td>
                  <td><Link href={`/company/${encodeURIComponent(f.id)}`} className="status new">Open research</Link></td>
                  <td><a className="doc" href={f.detailUrl} target="_blank" rel="noreferrer">SEBI filing ↗</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
