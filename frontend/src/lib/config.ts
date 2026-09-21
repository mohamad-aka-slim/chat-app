// Client-side config. Bun exposes only BUN_PUBLIC_* vars, and only when they are set
// at build/dev time; `import.meta.env` can be undefined at runtime, so access it defensively.
const clientEnv: ImportMetaEnv = import.meta.env ?? {};

export const config = {
    apiBase: clientEnv.BUN_PUBLIC_API_BASE ?? "http://localhost:8000/api",
    wsBase: clientEnv.BUN_PUBLIC_WS_BASE ?? "ws://localhost:8000",
} as const;