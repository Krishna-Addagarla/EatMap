# EatMap

EatMap is a map-first Hyderabad food discovery app. The repo is now split into:

- `frontend/` - the current single-page map UI and local Node static/proxy server.
- `backend/` - FastAPI API with JWT auth, Google-login endpoint, places, reviews, photos, lists, occasions, filters, and heatmap data.

## Run Locally

Terminal 1:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Terminal 2:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

API docs:

```text
http://localhost:8000/docs
```

## Map Provider

EatMap uses MapLibre GL JS with OpenFreeMap tiles:

- Map library: `https://unpkg.com/maplibre-gl@latest`
- Map style: `https://tiles.openfreemap.org/styles/dark`
- Fallback style: `https://tiles.openfreemap.org/styles/liberty`

This does not require a map API key for the current MVP.

## Data Strategy

Use a hybrid strategy. Supabase Postgres should be EatMap's source of truth for places, ratings, reviews, photos, lists, favorites, occasions, and filters. Later, enrich place records using external providers such as Google Places, Foursquare, or OpenStreetMap via `external_provider` and `external_id` fields instead of depending on them for your whole product.

That gives you control over user content and curated occasion data while still leaving a path to import broader restaurant metadata.

## Enable EatMap AI

The browser app calls the local `/api/chat` endpoint. To enable the AI assistant, create a `.env` file or set these environment variables before starting the server:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
PORT=3000
```

Without `ANTHROPIC_API_KEY`, the app still runs and the food discovery UI remains usable, but the chat panel will show a setup message.

## Project Files

- `frontend/eatmap.html` contains the current single-page UI, styles, and client behavior.
- `frontend/server.js` serves the app, proxies AI chat requests, and forwards `/api/v1/*` to FastAPI.
- `backend/app` contains the FastAPI backend.
- `package.json` provides `npm run dev` and `npm start`.
