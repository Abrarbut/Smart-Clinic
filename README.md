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
