import { NextResponse } from "next/server";
import { getLatestDrhpFilings, getDrhpDetail } from "../../../../lib/sebi";
import { analyzeDrhp } from "../../../../lib/analyzer";
import { markProcessed, sendEmail, wasProcessed } from "../../../../lib/alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const filings = await getLatestDrhpFilings();
  const results: Array<{ company: string; ok: boolean; error?: string }> = [];
  for (const filing of filings.slice(0, 10)) {
    try {
      if (await wasProcessed(filing.id)) continue;
      const detail = await getDrhpDetail(filing.detailUrl);
      if (!detail.pdfUrl) throw new Error("No DRHP PDF found");
      if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
      const analysis = await analyzeDrhp(filing.company, detail.pdfUrl);
      const html = `<h2>${analysis.company} — New DRHP</h2><p>${analysis.executiveSummary}</p><h3>Research signals</h3><ul>${analysis.strengths.slice(0,5).map(x=>`<li>${x}</li>`).join("")}</ul><h3>Risks to investigate</h3><ul>${analysis.risks.slice(0,5).map(x=>`<li>${x}</li>`).join("")}</ul><p><a href="${filing.detailUrl}">Open SEBI filing</a></p>`;
      await sendEmail(`New DRHP: ${filing.company}`, html);
      await markProcessed(filing.id);
      results.push({ company: filing.company, ok: true });
    } catch (e) {
      results.push({ company: filing.company, ok: false, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }
  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
