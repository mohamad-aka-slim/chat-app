# Chatterbox

A friendly, realtime chat app. Two independent apps, no root tooling — run each from its own directory.

- **`backend/`** — Python 3.13 · FastAPI · SQLAlchemy 2 async ORM (SQLite via aiosqlite)
- **`frontend/`** — Bun · React 19 · TypeScript (Tailwind v4, shadcn-style UI)

## Features

- Join with just a username — no sign-up or password (identity is idempotent; re-entering the same name logs you back in)
- Create rooms, browse room list with live message counts
- Realtime chat over WebSocket with persistent history
- Live connection status, automatic reconnect with backoff
- Message bubbles with per-user colors, avatars, and date separators
- Session + theme persist across refreshes; light/dark mode toggle
- Mobile-friendly responsive layout

## Requirements

- Python 3.13 (backend venv)
- [Bun](https://bun.sh) (frontend)

## Getting started

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
```

> Use the repo venv (`.venv\Scripts\python.exe`). On Linux/macOS the path is `.venv/bin/python`.

Run the dev server:

```bash
.venv\Scripts\python.exe app/main.py
```

- API: `http://localhost:8000` (health check at `/health`)
- WebSocket: `ws://localhost:8000/rooms/{id}/ws`
- Config is read from `backend/.env` (template: `backend/.env.example`), env prefix `CHAT_`

### 2. Frontend

```bash
cd frontend
bun install
bun dev
```

Open `http://localhost:3000` (or whatever port `bun dev` prints).

API/WS base URLs default to `localhost:8000`. To override, copy `frontend/.env.example` to `frontend/.env` and adjust `BUN_PUBLIC_API_BASE` / `BUN_PUBLIC_WS_BASE`.

## Tests & checks

```bash
# Backend (from backend/)
.venv\Scripts\python.exe -m pytest

# Frontend (from frontend/)
bunx tsc --noEmit   # typecheck
bun run build.ts    # production build to dist/
```

## Project structure

```
backend/app/
  api/routes/    FastAPI routers (health, users, rooms, websocket)
  core/          config, logging, exceptions
  db/            async engine + repositories (ORM → pydantic schemas)
  models/        SQLAlchemy ORM models
  schemas/       pydantic request/response schemas
  services/      business logic layer
  ws/            WebSocket connection manager

frontend/src/
  components/ui/ shared shadcn-style primitives
  hooks/         dark mode, etc.
  layouts/       shell layout
  pages/         Login, Rooms, Chat
  services/      REST + WebSocket clients
  types/         shared type definitions mirroring backend schemas
```

The SQLite schema is created automatically on first run (`create_all`, no migrations).

## Known limitations (v0.1)

- Username-only identity — no passwords, tokens, or permissions
- Message history is capped at the 200 most recent messages; no pagination UI yet
- No message edit/delete, private/DM rooms, typing indicators, or presence
- CORS defaults to `*` — set `CHAT_CORS_ORIGINS` in `.env` for stricter access