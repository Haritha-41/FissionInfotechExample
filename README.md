# Restaurant Reservation Management System

A full-stack reservation system with customer and admin roles, JWT auth, and
automatic table assignment. Built for a junior full-stack developer assignment.

The focus is correct backend business logic (table availability, no double
booking, role-based access) with a clean, simple, functional UI.

## Tech Stack

| Layer    | Tech                                             |
| -------- | ------------------------------------------------ |
| Frontend | React (Vite), React Router, Axios                |
| Backend  | Node.js, Express                                 |
| Database | MongoDB + Mongoose                               |
| Auth     | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| Validation | `express-validator`                            |

## Project Structure

```
server/   Express API (routes → controllers → models, JWT + role middleware)
client/   React + Vite SPA (pages, api layer, auth context, protected routes)
```

See `server/src` and `client/src` — each file is small and single-purpose.

## Setup

Prerequisites: **Node 18+** and a **MongoDB** instance (local `mongod` or a
free MongoDB Atlas cluster).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit values (see below)
npm run seed                # seeds tables + admin user
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env        # VITE_API_URL defaults to http://localhost:5000/api
npm run dev                 # starts app on http://localhost:5173
```

## Environment Variables

### server/.env

| Variable         | Description                                  |
| ---------------- | -------------------------------------------- |
| `PORT`           | API port (default 5000)                      |
| `MONGO_URI`      | MongoDB connection string                    |
| `JWT_SECRET`     | Secret for signing JWTs (use a long random)  |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                     |
| `CLIENT_ORIGIN`  | Allowed CORS origin, e.g. `http://localhost:5173` |
| `ADMIN_NAME`     | Seed admin display name                      |
| `ADMIN_EMAIL`    | Seed admin email                             |
| `ADMIN_PASSWORD` | Seed admin password                          |

### client/.env

| Variable       | Description                       |
| -------------- | -------------------------------- |
| `VITE_API_URL` | Base URL of the backend API      |

Secrets live only in `.env` (git-ignored). Nothing is hardcoded.

## Seeding

`npm run seed` (in `server/`) is idempotent — safe to re-run. It:

- Upserts six tables (capacities 2, 2, 4, 4, 6, 8) by `tableNumber`.
- Creates the admin user from `ADMIN_*` env vars if it doesn't already exist.

## Test Credentials

After seeding, log in as admin with the `.env` values. Defaults from
`.env.example`:

| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Admin    | `admin@restaurant.com` | `Admin@12345` |
| Customer | *register your own via the Register page* | — |

Registration always creates a **customer**. Admins are provisioned only by the
seed script (customers cannot self-promote).

## Reservation Availability Logic

The core of the system (`server/src/utils/availability.js`). When a customer
requests a reservation for a `date`, `timeSlot`, and `guests`:

1. **Validate** the date (`YYYY-MM-DD`, not in the past), the time slot (must be
   one of the fixed slots), and guest count (1–20).
2. **Find candidate tables**: active tables with `capacity >= guests`, sorted by
   capacity ascending (then table number) so the *smallest fitting* table wins.
3. **Find booked tables** for that exact `date` + `timeSlot` among `active`
   reservations.
4. **Exclude** booked tables from the candidates.
5. **Assign** the first (smallest) remaining table.
6. If none remain, return a clean **409** ("No table available…").
7. **Prevent double booking** at the database level with a partial unique index
   on `{ table, reservationDate, timeSlot }` where `status: "active"`. This
   backstops any race between the availability check and the insert — a
   concurrent duplicate fails with a 409 instead of double-booking.

Dates are stored as `YYYY-MM-DD` strings so "same date" matching is an exact
equality check, free of timezone range-query bugs. Cancelling a reservation
(`status → "cancelled"`) frees its table for that slot immediately.

## Role-Based Access

- **JWT auth** (`authMiddleware.protect`) verifies the Bearer token and loads
  the user onto `req.user`.
- **Role guard** (`roleMiddleware.requireRole('admin')`) protects every
  `/api/admin/*` route; non-admins get **403**.
- **Ownership checks**: customers can view/cancel only their **own**
  reservations — the controller compares `reservation.user` to `req.user._id`.
- **Frontend** mirrors this with `ProtectedRoute` (must be logged in) and
  `RoleRoute` (must have the right role), and role-aware redirects after login.

| Action                        | Customer | Admin |
| ----------------------------- | :------: | :---: |
| Register / Login              |    ✅    |  ✅   |
| Create reservation            |    ✅    |  —    |
| View own reservations         |    ✅    |  ✅   |
| Cancel own reservation        |    ✅    |  ✅   |
| View **all** reservations     |    —     |  ✅   |
| Filter reservations by date   |    —     |  ✅   |
| Update / cancel any reservation |  —     |  ✅   |
| Create / update tables        |    —     |  ✅   |

## API Reference

| Method | Route                                   | Access   |
| ------ | --------------------------------------- | -------- |
| POST   | `/api/auth/register`                    | Public   |
| POST   | `/api/auth/login`                       | Public   |
| GET    | `/api/auth/me`                          | Auth     |
| GET    | `/api/tables`                           | Public   |
| POST   | `/api/reservations`                     | Customer |
| GET    | `/api/reservations/my`                  | Auth     |
| PATCH  | `/api/reservations/:id/cancel`          | Owner    |
| GET    | `/api/admin/reservations?date=YYYY-MM-DD` | Admin  |
| PATCH  | `/api/admin/reservations/:id`           | Admin    |
| PATCH  | `/api/admin/reservations/:id/cancel`    | Admin    |
| POST   | `/api/admin/tables`                     | Admin    |
| PATCH  | `/api/admin/tables/:id`                 | Admin    |

## Assumptions

- Registration is customer-only; admins are seeded, not self-registered.
- Time slots are a fixed set (`12:00, 13:30, 18:00, 19:30, 21:00`) shared by
  frontend and backend.
- A reservation occupies one whole table (no table sharing / combining).
- "Availability" is per (table, date, slot); a table can be re-booked at a
  different slot the same day.

## Known Limitations

- No email verification or password reset.
- No pagination on the admin reservation list (fine for assignment scale).
- No automated test suite beyond a unit self-check for the availability logic
  (`node src/utils/availability.test.js`).
- Table management UI is minimal (API is complete; seed covers typical needs).

## Future Improvements

- Reservation editing for customers (currently cancel-and-rebook).
- Configurable slots / opening hours per day.
- Pagination + search on the admin dashboard.
- Email confirmations and reminders.

## Live Deployment

- Frontend: _TODO — add deployed URL (e.g. Vercel/Netlify)_
- Backend: _TODO — add deployed URL (e.g. Render/Railway)_
- Database: MongoDB Atlas

> Deploy notes: set the same env vars in the host dashboards, point
> `VITE_API_URL` at the deployed backend, and run `npm run seed` once against
> the production database.
