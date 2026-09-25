import Link from "next/link";
import { getLatestDrhpFilings, getDrhpDetail } from "../../../lib/sebi";
import { ResearchClient } from "../../../components/research-client";

export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filings = await getLatestDrhpFilings();
  const filing = filings.find((x) => x.id === slug);
  if (!filing) return <main className="shell"><Link className="back" href="/">← Back to DRHP list</Link><div className="empty panel">Filing not found in the live SEBI feed.</div></main>;

  const detail = await getDrhpDetail(filing.detailUrl);
  return (
    <main className="shell">
      <Link className="back" href="/">← Back to DRHP list</Link>
      <div className="hero">
        <div className="topbar" style={{marginBottom:0}}>
          <div><h1>{filing.company}</h1><div className="sub">DRHP filed {filing.date} · Source: SEBI</div></div>
          <a className="cta" href={filing.detailUrl} target="_blank" rel="noreferrer">Open SEBI filing ↗</a>
        </div>
      </div>
      <ResearchClient company={filing.company} detailUrl={filing.detailUrl} pdfUrl={detail.pdfUrl} />
    </main>
  );
}
