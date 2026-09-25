import { NextResponse } from "next/server";
import { getLatestDrhpFilings } from "../../../lib/sebi";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return NextResponse.json({source:"SEBI", filings: await getLatestDrhpFilings()}); }
  catch (e) { return NextResponse.json({error:e instanceof Error?e.message:"Failed to load SEBI"},{status:502}); }
}
