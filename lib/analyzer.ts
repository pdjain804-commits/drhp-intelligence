import OpenAI from "openai";
import pdfParse from "pdf-parse";
import type { CompanyAnalysis } from "./types";

const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    company: { type: "string" },
    executiveSummary: { type: "string" },
    sector: { type: "string" },
    businessModel: { type: "string" },
    ipoStructure: {
      type: "object",
      additionalProperties: false,
      properties: {
        freshIssue: { type: "string" },
        ofs: { type: "string" },
        useOfProceeds: { type: "string" }
      },
      required: ["freshIssue", "ofs", "useOfProceeds"]
    },
    metrics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          period: { type: "string" },
          source: { type: "string" }
        },
        required: ["label", "value"]
      }
    },
    strengths: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    peerSignals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          peer: { type: "string" },
          whyComparable: { type: "string" },
          notes: { type: "string" }
        },
        required: ["peer", "whyComparable"]
      }
    },
    valuation: {
      type: "object",
      additionalProperties: false,
      properties: {
        status: { type: "string" },
        multiples: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              multiple: { type: "string" },
              company: { type: "string" },
              value: { type: "string" },
              note: { type: "string" }
            },
            required: ["multiple", "company", "value"]
          }
        }
      },
      required: ["status", "multiples"]
    },
    cohortFramework: {
      type: "object",
      additionalProperties: false,
      properties: {
        description: { type: "string" },
        measures: { type: "array", items: { type: "string" } }
      },
      required: ["description", "measures"]
    },
    analystQuestions: { type: "array", items: { type: "string" } },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          page: { type: "string" },
          quote: { type: "string" }
        },
        required: ["title"]
      }
    }
  },
  required: [
    "company", "executiveSummary", "sector", "businessModel", "ipoStructure",
    "metrics", "strengths", "risks", "peerSignals", "valuation", "cohortFramework",
    "analystQuestions", "citations"
  ]
};

async function fetchPdfText(pdfUrl: string) {
  const res = await fetch(pdfUrl, {
    headers: { "User-Agent": "Mozilla/5.0 DRHP-Intelligence/1.0" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const parsed = await pdfParse(buffer);
  return parsed.text.slice(0, 140_000);
}

export async function analyzeDrhp(company: string, pdfUrl: string): Promise<CompanyAnalysis> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  const text = await fetchPdfText(pdfUrl);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `You are an institutional equity research associate. Analyze a DRHP conservatively and only use information supported by the document excerpt. Never invent missing numbers. Clearly label unavailable price-band / market-valuation data. Identify comparable listed peers by business model where the DRHP names peers; do not fabricate current peer multiples. Create a diligence-oriented memo, not an investment recommendation. Every quantitative metric must indicate the period when available.`
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Company: ${company}\n\nDRHP text excerpt:\n${text}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "drhp_analysis",
        strict: true,
        schema
      }
    }
  });

  const output = response.output_text;
  return JSON.parse(output) as CompanyAnalysis;
}
