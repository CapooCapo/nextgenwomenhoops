# CLAUDE.md — NextGen Women Hoops (NGWH)

## Project Overview & Current State
- **Project**: NextGen Women Hoops (Basketball Tournament & Club Management Platform)
- **Architecture**: Modular Monolith Next.js App Router (`root-NGWH/`) with PostgreSQL backend.
- **State**: Core features implemented & production ready (Hero uploads, Club Registrations & Approvals, Admin/Subadmin Access, Live Matches + OBS SSE Sync, Tournaments, News, Gallery).

---

## Directory Structure
- `root-NGWH/` — Primary application directory.
  - `src/app/` — App Router routes (Public, Account, Admin, APIs).
  - `src/components/` — UI components (SCSS Modules).
  - `src/server/` — Server services, repositories, DB client, Auth (`adminAuth`, `userAuth`).
  - `src/services/` — Client-side API fetch services.
  - `src/types/` — TypeScript interfaces & models.
- `.ai/` — Documentation & Architecture specs (`ARCHITECTURE.md`, `RULES.md`, `IMPLEMENTATION_STATUS.md`, `CLAUDE.md`).
- `media/` — File storage for local media uploads (Hero assets, Club logos, Athlete docs).

---

## Tech Stack & Core Conventions
1. **Framework**: Next.js (App Router, RSC, Server Actions, Route Handlers).
2. **Styling**: Vanilla SCSS / SCSS Modules (`.module.scss`). Avoid TailwindCSS.
3. **Database**: PostgreSQL (`pg` pool, parameterized SQL via `$1, $2`, schema init via `schemaInit.ts`). Single Source of Truth.
4. **Authentication**:
   - **Admin Auth** (`adminAuth.ts`): Cookie `admin_session`, roles `admin` (Superadmin) and `subadmin` (Read-only/restricted).
   - **User Auth** (`userAuth.ts`): Cookie `user_session`, club owners and public accounts.
5. **Real-time Live Sync**: SSE (`/api/matches/live-stream`) + PostgreSQL LISTEN/NOTIFY for Homepage Live Scoreboard and OBS Scoreboard (`/obs/scoreboard`).

---

## Key Business & Authorization Rules
- **Club Registration & Visibility**:
  - New club registrations default to `is_approved = false` (Pending).
  - Public endpoints (`/clubs`, `/api/clubs`) ONLY return `is_approved = true`.
  - Owners can view & edit their own pending/approved clubs (`/account/clubs`).
  - Non-owners accessing pending clubs receive `404 Not Found` or `403 Forbidden`.
- **Admin Workflow**:
  - Superadmin (`admin`): Full CRUD, Approve/Reject clubs, manage Subadmin accounts.
  - Subadmin (`subadmin`): Read-only view for administrative data.

---

## Development & Verification Commands
Always run commands inside `root-NGWH/`:
- **Dev Server**: `npm run dev`
- **Unit & Integration Tests**: `npm test`
- **Type Check**: `npx tsc --noEmit`
- **Linter**: `npm run lint`
- **Production Build**: `npm run build`

---

## Source-of-Truth Priority
1. Stakeholder-confirmed requirement updates (`CHANGE_LOG`).
2. `.ai/RULES.md` & `.ai/ARCHITECTURE.md`.
3. `.ai/CLAUDE.md` & `.ai/IMPLEMENTATION_STATUS.md`.
