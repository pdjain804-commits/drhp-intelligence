import { NextResponse } from "next/server";
import { getDrhpDetail } from "../../../lib/sebi";
import { analyzeDrhp } from "../../../lib/analyzer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const company = String(body.company || "");
    const detailUrl = String(body.detailUrl || "");
    let pdfUrl = body.pdfUrl ? String(body.pdfUrl) : "";
    if (!company || !detailUrl) return NextResponse.json({error:"Missing company/detail URL."},{status:400});
    if (!pdfUrl) pdfUrl = (await getDrhpDetail(detailUrl)).pdfUrl || "";
    if (!pdfUrl) return NextResponse.json({error:"Could not identify a DRHP PDF from SEBI."},{status:422});
    const analysis = await analyzeDrhp(company, pdfUrl);
    return NextResponse.json({analysis});
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({error: message},{status:500});
  }
}
