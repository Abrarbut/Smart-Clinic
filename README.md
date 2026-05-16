<<<<<<< HEAD
# SmartClinic

A role‑aware healthcare portal for patients, doctors, receptionists, and admins. It supports appointment booking, doctor discovery, and clinic dashboards with a REST API and PostgreSQL database.

## ✨ Key Features

### Authentication
- Register users with roles (patient/doctor/receptionist/admin)
- Login/logout with session cookies
- Fetch current session user

### Patient Features
- Browse doctors with specialty filters
- View doctor details
- Book appointments
- View appointments and medical history

### Doctor Features
- Doctor dashboard UI
- Schedule view UI
- Patient list UI

### Receptionist Features
- Receptionist dashboard UI
- Appointment list UI
- Book appointments UI

### Admin Features
- Admin dashboard summary
- View users list
- Update user roles
- View clinic stats

### Utilities
- Health endpoint
- List specialties

## 🧰 Tech Stack

- **Frontend:** React + Vite + Tailwind + TanStack Query + Wouter
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Session‑based (express‑session, cookies)

## 📁 Project Structure

- `artifacts/smartclinic` – Frontend (Vite)
- `artifacts/api-server` – Backend API
- `lib/db` – Drizzle ORM schema & DB utilities
- `lib/api-spec` – OpenAPI spec
- `DEPLOYMENT_*` – Deployment documentation

## ✅ Local Development (Recommended)

### 1) Start Postgres (Docker)

```bash
sudo docker start smartclinic-db || sudo docker run -d --name smartclinic-db \
  -e POSTGRES_USER=smartclinic_user \
  -e POSTGRES_PASSWORD=love6767 \
  -e POSTGRES_DB=smartclinic \
  -p 5433:5432 \
  postgres:15-alpine
```

### 2) Apply DB schema

```bash
DATABASE_URL="postgresql://smartclinic_user:love6767@localhost:5433/smartclinic" pnpm --filter @workspace/db push
```

### 3) Start API

```bash
DATABASE_URL="postgresql://smartclinic_user:love6767@localhost:5433/smartclinic" \
SESSION_SECRET="lovelovelove" \
PORT=8080 NODE_ENV=development \
pnpm --filter @workspace/api-server dev
```

### 4) Start Frontend

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/smartclinic dev
```

Open: `http://localhost:5173`

## 🔐 Environment Variables

**API (local)**
```
DATABASE_URL=postgresql://smartclinic_user:love6767@localhost:5433/smartclinic
SESSION_SECRET=lovelovelove
PORT=8080
NODE_ENV=development
```

**Frontend (local)**
```
PORT=5173
BASE_PATH=/
```

## 🗄️ Database Tables

- `users`
- `doctors`
- `appointments`
- `medical_history`
- `specialties`

## 🔌 API Endpoints (Highlights)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/medical-history`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `GET /api/dashboard/summary`
- `GET /api/healthz`
- `GET /api/specialties`

Full contract: `lib/api-spec/openapi.yaml`

## 📚 Deployment Docs

See:
- `README_DEPLOYMENT.md`
- `DEPLOYMENT_GUIDE.md`
- `DEPLOYMENT_CHECKLIST.md`

## ✅ Notes

- No default admin account. Create an admin user via the registration form.
- Session cookies are HTTP‑only, SameSite=Lax.
=======
# Smart Clinic (local development)

Patient portal with Express API, PostgreSQL, and a Vite + React frontend. This repo uses **npm workspaces** — no pnpm or Docker required for day-to-day work.

## Prerequisites (Windows)

1. **Node.js** 20 or newer (LTS recommended; Node 22 is fine).
2. **PostgreSQL** installed and running (default port `5432`).
3. **npm** (comes with Node).

Native tooling used by the build (for example **Rollup**, **Lightning CSS**, **esbuild**) is installed automatically for your OS and CPU when you run `npm install`; you do not need to configure optional binaries by hand.

## 1. Clone or copy the project

Open a terminal in the project root (the folder that contains this `README.md`).

## 2. Create the database role and database

Using **SQL Shell (psql)** or **pgAdmin**, connect as a PostgreSQL superuser (often `postgres`) and run:

```sql
CREATE USER smartclinic_user WITH PASSWORD 'password';
CREATE DATABASE smartclinic OWNER smartclinic_user;
GRANT ALL ON SCHEMA public TO smartclinic_user;
```

Use your own password if you prefer; if you do, update `DATABASE_URL` in `.env` to match.

## 3. Install dependencies

```powershell
cd path\to\Smart-Clinic
npm install
```

## 4. Environment file

In the **repository root** (`Smart-Clinic`), create a file named `.env` with at least:

```env
DATABASE_URL="postgresql://smartclinic_user:password@localhost:5432/smartclinic"
API_PORT=8080
PORT=5173
NODE_ENV=development
SESSION_SECRET="replace-with-a-long-random-string-at-least-32-characters"
BASE_PATH=/
```

- **API** listens on `API_PORT` (the Vite dev server proxies `/api` to `http://localhost:8080`).
- **Frontend** dev server uses `PORT` (open `http://localhost:5173`).

## 5. Apply the database schema

```powershell
npm run setup
```

This runs Drizzle `push` for `@workspace/db` using `DATABASE_URL` from `.env`.

## 6. Run API and frontend together

```powershell
npm run dev
```

You should see both processes in one terminal (labels `api` and `web`).

## Useful commands

| Command | Description |
|--------|-------------|
| `npm run dev` | API + Smart Clinic UI concurrently |
| `npm run setup` | Push DB schema (Drizzle) |
| `npm run build` | Typecheck and build all workspaces that define `build` |
| `npm run typecheck` | Typecheck libraries and workspaces |

## Troubleshooting

- **`npm run setup` fails with authentication errors** — PostgreSQL is not accepting `DATABASE_URL`. Confirm the DB and user exist and the password in `.env` is correct.
- **Port already in use** — Change `API_PORT` and/or `PORT` in `.env`. If you change `API_PORT`, update the `/api` proxy `target` in `artifacts/smartclinic/vite.config.ts` to match.
- **`npm run dev` and the API rebuilds every time** — Expected: the API `dev` script runs a full build before start. For faster API iteration after the first build, run `npm run build -w @workspace/api-server` once, then `npm run start -w @workspace/api-server`.
>>>>>>> 596d5e7619a8166c8551d060a1d9993df138c582
