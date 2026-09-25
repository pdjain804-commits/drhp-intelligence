import * as cheerio from "cheerio";
import type { DrhpFiling } from "./types";

const SEBI_LIST_URL = "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&sid=3";
const SEBI_BASE = "https://www.sebi.gov.in";

function absoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${SEBI_BASE}${href}`;
  return `${SEBI_BASE}/${href}`;
}

function normalizeCompany(title: string) {
  return title
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+-\s+Draft Abridged Prospectus.*$/i, "")
    .replace(/\s+-\s+DRHP.*$/i, "")
    .replace(/\s+DRHP.*$/i, "")
    .trim();
}

function isPureDrhpTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("addendum")) return false;
  if (t.includes("corrigendum")) return false;
  if (t.includes("udrhp")) return false;
  return true;
}

export async function getLatestDrhpFilings(): Promise<DrhpFiling[]> {
  const res = await fetch(SEBI_LIST_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 DRHP-Intelligence/1.0",
      "Accept": "text/html,application/xhtml+xml"
    },
    cache: "no-store"
  });

  if (!res.ok) throw new Error(`SEBI fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows: DrhpFiling[] = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const date = $(cells[0]).text().replace(/\s+/g, " ").trim();
    const type = $(cells[1]).text().replace(/\s+/g, " ").trim();
    const subType = $(cells[2]).text().replace(/\s+/g, " ").trim();
    const links = $(cells[3]).find("a");
    if (type !== "Public Issues" || subType !== "Draft Offer Documents filed with SEBI") return;

    links.each((__, a) => {
      const title = $(a).text().replace(/\s+/g, " ").trim();
      const href = $(a).attr("href");
      if (!href || !isPureDrhpTitle(title)) return;

      const company = normalizeCompany(title);
      if (!company) return;
      rows.push({
        id: `${date}-${company}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        company,
        date,
        detailUrl: absoluteUrl(href),
        source: "SEBI",
        status: "NEW"
      });
    });
  });

  const unique = Array.from(new Map(rows.map((r) => [r.detailUrl, r])).values());
  return unique;
}

export async function getDrhpDetail(detailUrl: string) {
  const res = await fetch(detailUrl, {
    headers: { "User-Agent": "Mozilla/5.0 DRHP-Intelligence/1.0" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`SEBI detail fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $("h1").first().text().replace(/\s+/g, " ").trim();
  const pdfLinks: string[] = [];
  $("a").each((_, a) => {
    const href = $(a).attr("href") || "";
    const text = $(a).text().replace(/\s+/g, " ").trim();
    if (/\.pdf(?:\?|$)/i.test(href) || /draft abridged prospectus|drhp/i.test(text)) {
      const url = absoluteUrl(href);
      if (url.includes("sebi.gov.in/sebi_data/")) pdfLinks.push(url);
    }
  });
  const pdfUrl = pdfLinks.find((u) => /drhp|draft/i.test(u)) || pdfLinks[0];
  return { title, pdfUrl, pdfLinks };
}
