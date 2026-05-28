# EatMap Backend

FastAPI backend for EatMap.

## Data Strategy

Use a hybrid model:

- EatMap owns the database records, reviews, ratings, lists, occasions, filters, and photos.
- External place providers can enrich records later through `external_provider` and `external_id`.
- The API is seeded with Hyderabad demo data so the frontend works before you connect a live provider.

This is better than relying only on a third-party place API because your product needs user-owned reviews, private lists, favorites, photos, occasion curation, and heatmap scoring. Supabase Postgres can be the source of truth, while Google Places/Foursquare/OSM can be used as enrichment sources.

## Run Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

For Supabase, set `DATABASE_URL` to the pooler connection string, for example:

```text
postgresql+asyncpg://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```
