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
