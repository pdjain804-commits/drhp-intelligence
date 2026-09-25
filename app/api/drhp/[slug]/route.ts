import { NextResponse } from "next/server";
import { getLatestDrhpFilings, getDrhpDetail } from "../../../../lib/sebi";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const filing = (await getLatestDrhpFilings()).find(x=>x.id===slug);
  if (!filing) return NextResponse.json({error:"Not found"},{status:404});
  const detail = await getDrhpDetail(filing.detailUrl);
  return NextResponse.json({...filing,...detail});
}
