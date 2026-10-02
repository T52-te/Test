# AGENTS.md

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Web app on host port 3000 (`/login` is the unauthenticated health path). Postgres runs as the
`db` service; credentials are local dev values defined inline in the compose file.

## Stack

- Next.js 15 App Router + React 19, TypeScript, plain CSS in `app/globals.css` (no CSS framework).
- Postgres via the `pg` driver (no ORM). Schema lives in `scripts/migrate.mjs`, which is
  idempotent and runs on every `web` container start before `next dev`.
- Auth: email + password (bcryptjs), sessions in the `sessions` table, session token in an
  httpOnly `session` cookie. UI and API share one origin, so no CORS configuration is needed and
  cookies stay same-site.

## Quirks

- `node_modules` is a named Docker volume populated by `npm ci` at container startup, not a host
  directory. After editing `package.json` / `package-lock.json`, restart the service:
  `docker compose -f docker-compose.base44.yml restart web`.
- `next.config.mjs` derives `allowedDevOrigins` from `BASE44_PUBLIC_HOST_SUFFIX`, which compose
  passes into the container. Without it Next.js blocks dev assets/HMR from the preview origin.
- `WATCHPACK_POLLING=true` is set because the source is bind-mounted.

## Verify it works

```bash
docker compose -f docker-compose.base44.yml ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/login   # expect 200
curl -s -X POST http://localhost:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"x"}'
# expect 401 — unauthenticated requests are rejected, proving auth is wired up
```

End-to-end: create an account at `/signup`, add a task, move it with the ← / → buttons, sign out.
