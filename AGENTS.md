# AGENTS.md

Flutter-free monorepo: two independent apps, no root tooling. Run each from its own directory.
- `backend/` — Python 3.13 + FastAPI + SQLAlchemy 2 async ORM (driver: aiosqlite)
- `frontend/` — Bun + React 19 + TypeScript (Tailwind v4, shadcn-style UI)

## Backend (`backend/`)

- Dev server: `python app/main.py` (uvicorn `--reload`, port 8000, host 0.0.0.0). Use the repo venv: `.venv\Scripts\python.exe`.
- Tests: `pytest` from `backend/` (dev deps: `pip install -r requirements-dev.txt`). `tests/conftest.py` monkeypatches `app.db.database.DATABASE_URL` to a tmp SQLite, so tests never touch `database.db`.
- Typecheck/lint: no rules configured; `ruff` exists in `.venv`.
- Config is pydantic-settings with `CHAT_` env prefix, reads `.env` (template: `.env.example`). The SQLite schema is created lazily by the app lifespan via `Base.metadata.create_all`; there are no migrations.
- Layering: `app/api/routes` (routers) → `app/services` → `app/db/repositories` (SQLAlchemy async sessions via `get_db`). ORM models live in `app/models/` (must be imported in `app/models/__init__.py` to register on `Base`); pydantic schemas live in `app/schemas/`. Repositories return pydantic schema objects, so services don't touch ORM.
- WebSocket endpoint is `/rooms/{room_id}/ws` — NOT `/ws/{room_id}`.
- Logs go to `logs/app.log` via loguru.

### Gotchas
- ORM model PKs are `Mapped[int]` autoincrement (matches `database.db`); timestamps use `server_default=func.current_timestamp()` to mirror SQLite `DEFAULT CURRENT_TIMESTAMP`. Schema is client-side insensitive: `create_all` won't alter existing tables.
- `database.get_engine()` rebuilds the async engine when `DATABASE_URL` changes (this is how per-test tmp DBs take effect); PRAGMA foreign_keys is enabled per-connection.
- Working tree has an in-progress, uncommitted backend refactor (schemas moved into `app/schemas/`, `app/models/schemas.py` deleted, raw SQL → SQLAlchemy ORM). Verify current state with `git status` before assuming structure.

## Frontend (`frontend/`)

- Use `bun`, not npm. `bun install`, `bun dev` (dev server w/ hot reload), `bun run build.ts` (builds to `dist/`), `bun start` (production). Typecheck: `bunx tsc --noEmit`.
- Path alias `@/*` → `src/*`. Shared UI components in `src/components/ui/` (Tailwind v4 via `bun-plugin-tailwind`).
- API base URL is hardcoded in `src/services/api.ts` (`http://localhost:8000/api`); WebSocket URL is hardcoded in `src/services/websocket.ts`. The WS URL (`ws://localhost:8000/ws/${roomId}`) is stale — the backend only serves `/rooms/{id}/ws`. If you touch the WS client, fix this to match.
- Browser env vars must be prefixed `BUN_PUBLIC_` (see `bunfig.toml`); only those are exposed to client code.