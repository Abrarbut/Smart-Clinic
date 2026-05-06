# Smart Clinic — Patient Portal

A full-stack healthcare portal with Pakistani doctors, appointment booking, medical history, and role-based user accounts.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

Required env vars: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24 | **TypeScript**: 5.9
- **API**: Express 5 + express-session + bcryptjs
- **DB**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Codegen**: Orval from OpenAPI spec (`lib/api-spec/openapi.yaml`)
- **Frontend**: React 19 + Vite + Wouter + TanStack Query + shadcn/ui
- **Build**: esbuild (CJS bundle for API)

## Where things live

- `lib/db/src/schema/` — DB schema (doctors, appointments, medical_history, users)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks
- `lib/api-zod/src/generated/` — auto-generated Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/smartclinic/src/pages/` — React pages
- `artifacts/smartclinic/src/context/AuthContext.tsx` — Auth state & API calls

## Architecture decisions

- **Session auth**: express-session with MemoryStore; `SESSION_SECRET` env var required; cookie `sameSite: lax`
- **Custom fetch**: all API calls go through `lib/api-client-react/src/custom-fetch.ts`; auth uses direct fetch with `credentials: include`
- **Protected routes**: `AuthProvider` wraps entire app; unauthenticated users redirected to `/login`
- **Role-based UI**: sidebar shows role badge; admin sees extra "System Settings" nav section
- **Doctor names**: all include "Dr." prefix in DB — never add "Dr." in frontend templates

## Product

- Login / Register (patient, doctor, receptionist, admin roles)
- Dashboard with clickable stat cards linking to filtered appointment tabs
- Find Doctors — search/filter 10 Pakistani specialists
- Book Appointment — calendar, time slots, fee (Rs 1,500–3,500)
- My Appointments — tabbed (Upcoming / Completed / Cancelled) with cancel
- Medical History — accordion view with diagnosis and prescription
- Profile — edit personal and emergency contact info

## User preferences

- Pakistani doctor names with "Dr." prefix already in DB values
- Consultation fees in PKR (Rs format), 1,500–3,500 range
- Dates formatted as local time (YYYY-MM-DD parsed without UTC offset)

## Gotchas

- OpenAPI spec must have no duplicate schema keys — codegen silently fails with "Failed to resolve input"
- Do not add `Dr.` in frontend display strings; it's already in the DB name field
- `History` from lucide-react conflicts with browser global — use `ClipboardList` instead
- After any `codegen` run, verify `lib/api-client-react/src/generated/` has files (codegen cleans first)
