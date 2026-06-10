# Workana IT Projects Analyzer

MVP that scrapes **IT & Programming** projects from [Workana](https://www.workana.com) in real-time and analyzes market trends.

## Features

- **Playwright scraper** with session cookie + SOCKS5 proxy support
- **All languages** (pt, es, en) with deduplication by project link
- **Live feed** showing project link, client country, and price
- **Analytics dashboard**:
  - Total projects posted in the past month
  - Major project categories (inferred from skills/titles)
  - Volume and percentage per category
  - Technology stack frequency
  - AI-powered insights on promising areas (OpenAI)

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for market insights |
| `WORKANA_SESSION` | PHPSESSID cookie from your logged-in Workana session |
| `WORKANA_PROXY` | SOCKS5 proxy as `socks5://host:port:user:pass` (fallback when direct fails) |
| `WORKANA_PROXY_MODE` | `auto` (default), `always`, or `never` — see VPN notes below |
| `SCRAPE_MAX_PAGES` | Max pages per language (default: 50) |
| `SCRAPE_INTERVAL_MS` | Auto-scrape interval in ms (default: 300000) |

## Usage

```bash
# Start the dashboard
npm run dev

# Run a one-off scrape from CLI
npm run scrape
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000), click **Start Scrape**, and watch projects appear in the live feed. Switch to the **Analytics** tab for charts and insights.

### VPN on or off

The app auto-detects the best route:

- **VPN on** → uses a direct connection (avoids SOCKS + VPN conflict)
- **VPN off** → falls back to your SOCKS5 proxy if direct fails

Use `GET /api/network` to see which route is active. Set `WORKANA_PROXY_MODE=never` to always use direct, or `always` to force the proxy.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/scrape` | Start background scrape |
| `GET` | `/api/jobs` | List scraped jobs |
| `GET` | `/api/analytics` | Analytics summary |
| `GET` | `/api/stream` | SSE stream for real-time updates |

## Tech Stack

- Next.js 16 (App Router)
- Playwright + proxy-chain
- SQLite (better-sqlite3)
- Recharts
- OpenAI GPT-4o-mini
