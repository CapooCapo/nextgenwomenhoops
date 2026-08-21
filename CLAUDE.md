# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextGen Women Hoops (NGWH) — a basketball tournament & club management platform. Single Next.js app (`root-NGWH/`) that owns both the frontend and the backend (API Route Handlers talking directly to PostgreSQL). Core features are implemented and production-ready: club registration & approval, admin/subadmin console, live match scoring with OBS overlay sync, tournaments/seasons, news, gallery.

**Important**: the app directory is `root-NGWH/`, not `frontend/` — always `cd root-NGWH` before running any command below.

## Commands

All commands run from `root-NGWH/`:

```bash
npm run dev              # dev server (localhost:3000)
npm test                 # jest (all suites)
npm test -- <pattern>    # run a single test file/suite, e.g. npm test -- clubsServerService
npm run test:watch       # jest --watch
npx tsc --noEmit         # type check
npm run lint             # eslint
npm run build            # production build (next build, output: "standalone")
```

Local full stack (frontend + Postgres) via Docker, from the repo root:

```bash
docker compose up -d
```

`docker-compose.yml` only defines `frontend` and `postgres` — there is no `backend` service; the frontend container connects to Postgres directly.

## Architecture

**This was originally planned as Next.js frontend + a separate Django/DRF backend** (see "Historical docs" below), but that plan changed: the Django backend was fully migrated into Next.js API Route Handlers backed directly by PostgreSQL (`pg`, no ORM). There is no Django code and no separate backend process anywhere in this repo today.

Request flow for anything that touches the database:

```
src/app/api/**/route.ts        Route Handler — parses request, calls a server service, maps result → NextResponse
  → src/server/services/*      Business logic, validation orchestration, shaping the response payload
    → src/server/repositories/*  Parameterized SQL ($1, $2, ...) via the shared pg pool
      → src/server/db/client.ts  Pool singleton; src/server/db/schemaInit.ts owns schema creation/migration + admin bootstrap
```

Client-side code never queries the database directly and never talks to `src/server/*` — browser code goes through `src/services/*` (fetch wrappers), which call the `/api/*` routes above. Server Components/Server Actions may call `src/server/services/*` directly since they run server-side.

`src/app/` route groups: `(public)` (public site), `account/` (club-owner dashboard), `admin/` (admin console + its own `/api/admin/*` routes), `api/` (public/auth JSON endpoints), `media/[...path]` (serves club-uploaded media stored as DB blobs).

### Authentication (two independent systems)

- **Admin** (`src/server/auth/adminAuth.ts`): HMAC-SHA256-signed token in the `admin_session` cookie (24h expiry, `timingSafeEqual` verification). Roles: `admin` (full CRUD, approve/reject clubs, manage subadmins) and `subadmin` (read-only). Credentials resolve DB-first (`adminUsersRepository`, PBKDF2 password hashes) with an env-var fallback (`ADMIN_USERNAME`/`ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`) — production refuses to run securely without those env vars set to non-default values. A one-time superadmin bootstrap (`ADMIN_BOOTSTRAP`/`ADMIN_BOOTSTRAP_PASSWORD`) runs from `schemaInit.ts` on schema init.
- **User** (`src/server/auth/userAuth.ts`): `user_session` cookie, for club owners and public accounts (registration/login/forgot-password/reset-password under `/api/auth/*`).

Never trust a frontend-only check for either — every route handler that mutates or reveals non-public data re-verifies the session/role server-side.

### Club approval workflow (the central business rule)

- New club registrations default `is_approved = false`.
- Public endpoints (`/clubs`, `GET /api/clubs`) filter to `is_approved = true` only — enforced in the repository/service layer, not the UI.
- Owners can view/edit their own club regardless of approval state (`/account/clubs`, ownership checked via `user_id` on the club row).
- A non-owner requesting a pending club gets `404`/`403`, never the club data.
- Admins can see and approve/reject everything; subadmins are read-only.

### Real-time live matches

SSE endpoint `/api/matches/live-stream` + PostgreSQL `LISTEN`/`NOTIFY` (`src/server/db/pgListener.ts`) push score updates to the homepage scoreboard and the dedicated OBS overlay route (`/obs/scoreboard`) — no polling, no WebSocket layer.

### Media storage

Club-uploaded files (logos, capability profiles, U20 roster docs/images) are stored as binary blobs directly in Postgres (`clubMediaRepository`) and streamed back through `src/app/media/[...path]/route.ts`, not the filesystem. **Hero section is the exception**: it was deliberately converted to static, source-controlled assets (`public/assets/hero/` + `src/config/heroSlides.ts`) and decoupled from the database — the admin hero-upload UI/API routes are intentionally disabled and return `405`. Don't try to "fix" the hero admin routes into working mutation endpoints; that reversal was intentional (see `.ai/IMPLEMENTATION_STATUS.md`).

### i18n

`next-intl`, locale tracked via a `NEXT_LOCALE` cookie (no `[locale]` URL segment). Translation strings live in `messages/en.json` and `messages/vi.json`; a `setLocaleAction` Server Action (`src/i18n/actions.ts`) flips the cookie from the client `LanguageSwitcher`. Untranslated content fields (club names, achievements, etc.) render as stored — only UI copy is translated.

### Testing

Jest via `next/jest` (`jest.config.ts`), jsdom environment, `@/*` maps to `src/*`. `transformIgnorePatterns` is overridden to transpile `next-intl`/`use-intl`/`@formatjs`/etc. because they ship ESM-only — don't remove that override or ESM import errors come back.

## Historical planning docs (`.ai/`)

`.ai/ARCHITECTURE.md` and `.ai/RULES.md` describe the *original* architecture decision (Next.js frontend + separate Django/DRF backend + microservice-style module boundaries). That plan was superseded — `.ai/IMPLEMENTATION_STATUS.md` records the Django backend was fully migrated into this Next.js app. Treat `ARCHITECTURE.md`/`RULES.md` as historical rationale and background on business rules/Open-Questions discipline, not as a literal description of the current codebase; `IMPLEMENTATION_STATUS.md` is the current-state source of truth. `.ai/REQUIREMENTS.md` tracks the requirement workbook and open questions (`OQ-*`) that still gate unimplemented scope (live-score data source, RBAC role names beyond admin/subadmin, contact form backend, etc.) — don't implement against an open question as if it were resolved.
