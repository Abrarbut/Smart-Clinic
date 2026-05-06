# SmartClinic – Software Requirements Specification (SRS)

**Project:** SmartClinic – Online Medical Appointment & Patient Portal  
**Date:** 2026-05-06  
**Version:** 1.0 (based on current codebase)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non‑functional requirements for the SmartClinic web portal based on the current implementation. It aligns the original idea with what is actually built in this repository.

### 1.2 Scope
SmartClinic is a role‑aware healthcare portal with separate experiences for Patients, Doctors, Receptionists, and Admins. It provides appointment booking, doctor discovery, and basic clinic dashboards. The system is a browser‑based web app with a REST API and PostgreSQL database.

### 1.3 Definitions
- **Patient**: End user who books appointments and views history.  
- **Doctor**: Provider who views dashboard and patient list.  
- **Receptionist**: Staff who manages appointments and booking.  
- **Admin**: Staff who manages users and clinic stats.

---

## 2. Overall Description

### 2.1 Product Perspective
- Frontend: React + Vite + Tailwind + TanStack Query + Wouter.
- Backend: Node.js + Express (REST API).
- Database: PostgreSQL (via Drizzle ORM).
- Auth: Session‑based (express‑session, cookie). **No JWT.**

### 2.2 User Classes
- **Patient**: Browses doctors, books appointments, sees history.
- **Doctor**: Views schedule/dashboard and patient lists.
- **Receptionist**: Books appointments and manages queues.
- **Admin**: Views users, clinic stats, and admin dashboards.

### 2.3 Operating Environment
- Node.js 20+ for frontend dev (Vite requirement).
- PostgreSQL 15 (Docker or local).
- Docker + Docker Compose (optional but supported).

### 2.4 Constraints
- API requires `DATABASE_URL`, `SESSION_SECRET`, and `PORT`.
- Frontend dev server requires `PORT` and `BASE_PATH`.
- API is expected at `/api` during local dev via Vite proxy.

### 2.5 Assumptions & Dependencies
- Users must register via `/api/auth/register` (no seeded accounts).
- PostgreSQL must be running and schema pushed before use.

---

## 3. Functional Requirements (Implemented)

### 3.1 Authentication
- **FR‑AUTH‑01**: Register user with role (patient/doctor/receptionist/admin).  
  - Endpoint: `POST /api/auth/register`
- **FR‑AUTH‑02**: Login and create session cookie.  
  - Endpoint: `POST /api/auth/login`
- **FR‑AUTH‑03**: Logout and clear session cookie.  
  - Endpoint: `POST /api/auth/logout`
- **FR‑AUTH‑04**: Fetch current session user.  
  - Endpoint: `GET /api/auth/me`

### 3.2 Patient Features
- **FR‑PAT‑01**: Browse doctors list with optional specialty filter.  
  - Endpoint: `GET /api/doctors`
- **FR‑PAT‑02**: View doctor details.  
  - Endpoint: `GET /api/doctors/:id`
- **FR‑PAT‑03**: Book appointment.  
  - Endpoint: `POST /api/appointments`
- **FR‑PAT‑04**: View appointments list (filter by status).  
  - Endpoint: `GET /api/appointments`
- **FR‑PAT‑05**: View medical history records.  
  - Endpoint: `GET /api/medical-history`

### 3.3 Doctor Features
- **FR‑DOC‑01**: View doctor dashboard page (UI).  
- **FR‑DOC‑02**: View schedule page (UI).  
- **FR‑DOC‑03**: View patient list page (UI).  

### 3.4 Receptionist Features
- **FR‑REC‑01**: View receptionist dashboard page (UI).  
- **FR‑REC‑02**: View all appointments page (UI).  
- **FR‑REC‑03**: Book appointments page (UI).

### 3.5 Admin Features
- **FR‑ADM‑01**: View admin dashboard (summary stats).  
  - Endpoint: `GET /api/dashboard/summary`
- **FR‑ADM‑02**: View users list.  
  - Endpoint: `GET /api/admin/users`
- **FR‑ADM‑03**: Update user role.  
  - Endpoint: `PATCH /api/admin/users/:id/role`
- **FR‑ADM‑04**: View clinic stats.  
  - Endpoint: `GET /api/admin/stats`

### 3.6 Appointment Management
- **FR‑APT‑01**: Create appointment.  
  - Endpoint: `POST /api/appointments`
- **FR‑APT‑02**: View appointment by ID.  
  - Endpoint: `GET /api/appointments/:id`
- **FR‑APT‑03**: Cancel appointment.  
  - Endpoint: `PATCH /api/appointments/:id/cancel`

### 3.7 Utilities
- **FR‑SYS‑01**: Health endpoint.  
  - Endpoint: `GET /api/healthz`
- **FR‑SYS‑02**: List specialties.  
  - Endpoint: `GET /api/specialties`

---

## 4. Data Requirements

### 4.1 Database Tables (PostgreSQL)
- **users**: id, name, email, passwordHash, role, createdAt
- **doctors**: id, name, specialty, qualification, experience, fee
- **appointments**: id, doctorId, doctorName, specialty, date, time, reason, status, fee
- **medical_history**: id, doctorName, specialty, date, diagnosis, prescription, notes

---

## 5. Non‑Functional Requirements

- **NFR‑01**: Response time under 2s for typical list endpoints (local dev).
- **NFR‑02**: Session cookies are HTTP‑only and SameSite=Lax.
- **NFR‑03**: Data persists in Docker volume `postgres_data`.
- **NFR‑04**: Frontend responsive for desktop/mobile.
- **NFR‑05**: Basic input validation via Zod schemas on API.

---

## 6. Interfaces

### 6.1 REST API
Base path: `/api`  
OpenAPI contract: `lib/api-spec/openapi.yaml`

### 6.2 UI Routes (Frontend)
- `/login`, `/register`
- Patient: `/doctors`, `/doctors/:id`, `/appointments`, `/medical-history`, `/profile`
- Doctor: `/doctor`, `/doctor/schedule`, `/doctor/patients`
- Receptionist: `/receptionist`, `/receptionist/appointments`, `/receptionist/book`
- Admin: `/admin`, `/admin/users`, `/admin/doctors`

---

## 7. Gaps vs Original Idea (Not Implemented Yet)

The following items from the initial idea are **not implemented** in the current codebase:
- JWT authentication (uses session cookies instead).
- MySQL database (uses PostgreSQL instead).
- Drag‑and‑drop scheduling UI.
- Appointment slot lock / concurrency control.
- Email reminders or cancellation notifications.
- Doctor leave & substitution board.
- Prescription PDF generation.
- Live analytics charts (current dashboard is summary stats only).
- Cancellation reason tracking and broadcast notifications.

---

## 8. Deployment Notes (Current)

- Docker compose services: `postgres`, `api`, `frontend`, `nginx`.
- Default local ports: API `8080`, Frontend `5173` (dev) or `8081` (Docker), Nginx `8082`.

---

## 9. Approval

This SRS reflects the **current implementation** and can be used as the baseline for grading, sprint planning, and further expansion.
