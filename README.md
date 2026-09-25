# DRHP Intelligence — no local database

A GitHub/Vercel-ready MVP for an IPO/DRHP research workflow.

## What it does

- Reads the latest **SEBI filings feed at runtime**; no seed/mock/local company list.
- Filters to **Public Issues → Draft Offer Documents filed with SEBI** and removes addenda/corrigenda/UDRHP entries.
- Opens a company research page with a live SEBI filing link.
- On demand, downloads the DRHP PDF, extracts text and generates a structured AI research memo.
- Separates document extraction from interpretation and explicitly marks valuation data that is unavailable at DRHP stage.
- Provides a framework for listed-peer discovery, IPO valuation and post-listing cohort analysis.
- Includes a Vercel Cron endpoint for automatic monitoring. The optional email alert uses Resend, while optional deduplication uses external Upstash Redis; no local database is required.

## Run locally

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push the folder to GitHub.
2. Import the repo into Vercel.
3. Add `OPENAI_API_KEY`.
4. Optionally add `RESEND_API_KEY`, `ALERT_FROM_EMAIL`, `ALERT_TO_EMAIL`, `CRON_SECRET`, and Upstash variables for alerting/deduplication.
5. Vercel will run `/api/cron/drhp-watch` every hour using `vercel.json`.

## Important production note

SEBI is the source of record for DRHP filings. The MVP intentionally fetches the official SEBI pages at request time rather than copying filing data into a local database. Because SEBI's website structure can change, keep the parser isolated in `lib/sebi.ts` so it is easy to adjust.

The peer and post-listing modules are deliberately framework-first in this MVP: they should be connected to a licensed/current market-data source before being used for live valuation numbers. Do not fabricate market multiples when a current market-data source is unavailable.
