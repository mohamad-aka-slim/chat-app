# Chatterbox Frontend

See the [root README](../README.md) for full setup instructions.

Quick start:

```bash
bun install
bun dev
```

- Dev server with hot reload: `bun dev`
- Production build to `dist/`: `bun run build.ts`
- Production serve: `bun start`
- Typecheck: `bunx tsc --noEmit`

API/WS base URLs default to `localhost:8000`; override with `BUN_PUBLIC_API_BASE` / `BUN_PUBLIC_WS_BASE` (see `.env.example`).