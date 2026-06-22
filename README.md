# ShiftSync — Frontend

Next.js app for **ShiftSync**, a multi-location staff-scheduling platform. Backend repo: [`shiftsync-be`](https://github.com/awais-aman/shiftsync-be).

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (base-nova variant, built on `@base-ui/react`) |
| Server state | TanStack Query v5 |
| Forms / validation | React Hook Form + Zod |
| Auth | Supabase Auth via `@supabase/ssr` (browser + server-side helpers) |
| Realtime | Supabase Realtime (`postgres_changes` on the `notifications` table) |
| Time / timezones | `date-fns` + `date-fns-tz` |
| Toasts | `sonner` |
| Hosting | Vercel |

The backend is a NestJS API hosted on Railway and a Supabase Postgres database.

## Architecture

- **App Router** under `src/app/` — every route is a thin `page.tsx` that renders an async server component from `_components/`.
- **Component pattern** — pages render `_components/<Name>.tsx`, never inline JSX. Files are PascalCase. Async server components for data-loading + role gating; `'use client'` only where needed.
- **Per-feature folders** for `types/`, `hooks/`, and route components (e.g. `src/app/shifts/`, `src/hooks/shifts/`, `src/types/shift/`).
- **`apiFetch`** (`src/lib/api/server.ts`) for server components — returns `ApiResult<T>` discriminated union, never throws.
- **`apiClientFetch`** (`src/lib/api/client.ts`) for client components — throws on non-2xx, used inside TanStack Query mutations.
- **`shared/routes.ts`** centralises every backend URL + every frontend route. Pages and API calls reference these constants — no string URLs anywhere else.
- **`shared/constants.ts`** holds enums (`UserRole`, `QueryKeys`, etc).
- **Realtime + side-channel invalidation** — the `NotificationBell` subscribes to `notifications` rows for the current user via Supabase Postgres CHANGES. When a notification arrives it invalidates the relevant TanStack Query keys so swap inboxes / shift lists / assignments refetch live without their own subscriptions.
- **Proxy** (`src/proxy.ts`, replaces `middleware.ts` in Next 16) handles auth-gated routes — if there's no session, redirects to `/login?next=<path>`.

## Local development

Requirements: Node 22+, npm, the backend running locally on `:4000`.

```bash
git clone https://github.com/awais-aman/shiftsync-fe.git
cd shiftsync-fe
npm install

cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# NEXT_PUBLIC_BACKEND_ENDPOINT (point to your local BE)

npm run dev
```

Visit `http://localhost:3000`.

### Required env vars

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_BACKEND_ENDPOINT=http://localhost:4000/api    # in production: https://<railway-url>/api
```

The `NEXT_PUBLIC_*` prefix is required because these are read in client components.

## Deployment (Vercel)

This app is live at **https://shiftsync-fe-ten.vercel.app** (backed by `https://shiftsync-be-production.up.railway.app/api`).

To deploy a fresh copy:

1. New project → Import GitHub repo `shiftsync-fe`
2. **Settings → Environment Variables**: paste the three `NEXT_PUBLIC_*` vars above for **Production**
3. Set `NEXT_PUBLIC_BACKEND_ENDPOINT` to your Railway URL with `/api` suffix
4. Trigger a redeploy (env var changes need a redeploy to take effect)
5. Note the production URL (`<project>.vercel.app`); add it to the BE's `CORS_ORIGIN` env var on Railway

## Routes & roles

The dashboard at `/dashboard` shows links scoped to the user's role. Full route map:

| Route | Who can see it |
|---|---|
| `/login`, `/signup`, `/auth/callback` | Public |
| `/dashboard` | All signed-in users (role-aware sections) |
| `/locations`, `/locations/new` | Admin only (the page redirects non-admins) |
| `/skills`, `/skills/new` | Admin only |
| `/team`, `/team/[id]` | Admin only |
| `/shifts`, `/shifts/[id]` | All — list scoped per role (admin = all, manager = managed, staff = published at certified locations) |
| `/shifts/new` | Admin + Manager |
| `/availability` | Staff (manage own); admin/manager can view via `/team/[id]` |
| `/swaps` | All — admin/manager also see the approval queue |
| `/swaps/open` | Staff (claim drops they're qualified for) |
| `/on-duty` | All — currently active shifts grouped by location, scoped per role |
| `/analytics` | Admin + Manager (fairness + overtime cost dashboards) |
| `/admin/audit` | Admin only |

## Test credentials

Same password for all seeded accounts: `CoastalEats!2026`.

| Role | Email |
|---|---|
| admin | `admin@coastaleats.test` |
| manager | `east-manager@coastaleats.test` (Brooklyn + Boston) |
| manager | `west-manager@coastaleats.test` (Santa Monica + Berkeley) |
| staff | `sarah@coastaleats.test` (PT, bartender + server, has 7th-day override) |
| staff | `john@coastaleats.test` (cross-tz; bartender — Timezone Tangle scenario) |
| staff | `tom@coastaleats.test` (PT, line cook + server, has an in-flight drop) |

See the BE README for the full credential table.

## Scripts

```bash
npm run dev         # Next dev server (Turbopack)
npm run build       # production build
npm run start       # serve the production build
npm run lint
```
