# EatMap

EatMap is a map-first Hyderabad food discovery prototype built from the original `eatmap.html` concept.

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The app is served by a small dependency-free Node server, so no install step is required beyond having Node 18 or newer.

## Map Provider

EatMap uses MapLibre GL JS with OpenFreeMap tiles:

- Map library: `https://unpkg.com/maplibre-gl@latest`
- Map style: `https://tiles.openfreemap.org/styles/dark`
- Fallback style: `https://tiles.openfreemap.org/styles/liberty`

This does not require a map API key for the current MVP.

## Enable EatMap AI

The browser app calls the local `/api/chat` endpoint. To enable the AI assistant, create a `.env` file or set these environment variables before starting the server:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
PORT=3000
```

Without `ANTHROPIC_API_KEY`, the app still runs and the food discovery UI remains usable, but the chat panel will show a setup message.

## Project Files

- `eatmap.html` contains the current single-page UI, styles, and client behavior.
- `server.js` serves the app and proxies AI chat requests securely.
- `package.json` provides `npm run dev` and `npm start`.
