# Voallen

Voallen is a marketplace where families find, compare and book in-home care agencies.
Families browse agencies by city and specialty, read reviews, and request a consultation.
Agencies accept or decline requests, mark visits complete, and collect reviews from verified clients.

## Features

- Sign up as a family (client) or an agency, and log in with JWT tokens
- Browse and filter agencies by city, specialty or keyword
- Agency pages with a photo gallery, stats and reviews
- Book a consultation; the client and the agency both get an email
- Agency dashboard: create a profile, then accept, decline or complete visits
- Client dashboard: track bookings, cancel, and leave a review after a completed visit
- Admin dashboard: approve new agencies, switch any agency between available and unavailable, verify badges,
  and open any agency to see all its bookings with a full history of who accepted, declined or cancelled what
  (admins can override a booking's status; the change is logged and both sides are emailed)
- Light and dark mode (follows the system setting, with a toggle in the header)

## Tech stack

| Part | Stack |
| --- | --- |
| Frontend | React 19 (Create React App + craco), Tailwind CSS, shadcn/Radix UI, Framer Motion |
| Backend | FastAPI, MongoDB (motor), PyJWT, bcrypt |
| Email | Any SMTP server (logs to the console when SMTP is not set up) |

## Project layout

```
backend/server.py        API routes, models and the 7 sample Philadelphia agencies
backend/.env.example     Backend settings to copy into backend/.env
frontend/src/App.js      Pages, routing and app state
frontend/src/components  Hero, agency cards, sign-up, theme toggle and the UI kit
tests/test_api.py        Backend API tests (no database needed)
```

## Running locally

You need Python 3.11+, Node 20+ with Yarn 1, and MongoDB.

**Backend**

```bash
cd backend
cp .env.example .env          # set MONGO_URL, DB_NAME and JWT_SECRET
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

On startup the backend loads 7 sample Philadelphia agencies if the database is empty, and removes the old sample agencies for Washington D.C., Pittsburgh and Newark if they are still there.
Set `SEED_SAMPLE_DATA=false` to turn that off.

**Frontend**

```bash
cd frontend
cp .env.example .env          # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start                    # http://localhost:3000
```

## Deploying (Render + MongoDB Atlas)

The `Dockerfile` builds the React app and serves it from the FastAPI backend, so the
whole site runs as one service. `render.yaml` sets that service up on Render.

1. **Database:** create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   Add a database user, allow access from anywhere (`0.0.0.0/0`) under Network Access,
   and copy the connection string (`mongodb+srv://...`).
2. **Deploy:** open [Deploy to Render](https://render.com/deploy?repo=https://github.com/nwageorge/careconnect),
   sign in with GitHub and give Render access to this repository.
3. When asked, paste the Atlas string into `MONGO_URL` and your email into `ADMIN_EMAILS`.
   Leave the SMTP fields blank unless you have an email server.
4. Click **Apply**. The first build takes about 5–10 minutes, then the site is live at
   `https://voallen-xxxx.onrender.com`. Every push to `main` redeploys it.

On Render's free plan the site sleeps after 15 minutes without visits, so the first
load after that takes about a minute.

To run the same container yourself: `docker build -t voallen . && docker run -p 8000:8000 -e MONGO_URL=... voallen`.

## Configuration

All backend settings live in `backend/.env` (see `backend/.env.example`).

| Variable | Purpose |
| --- | --- |
| `MONGO_URL`, `DB_NAME` | MongoDB connection |
| `JWT_SECRET` | Signs login tokens. **Required in production.** If missing, a random one is used and logins reset on restart. |
| `ADMIN_EMAILS` | Comma-separated emails with admin access. These accounts get an **Admin** tab on their dashboard next to their own family or agency view. Nobody can make themselves an admin. |
| `CORS_ORIGINS` | Comma-separated frontend URLs allowed to call the API |
| `SEED_SAMPLE_DATA` | `true` to load sample agencies into an empty database |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_USE_TLS`, `EMAIL_FROM` | Booking emails. Leave `SMTP_HOST` empty to log emails instead. |

## Booking flow

0. A new agency profile is **awaiting approval** and hidden from families until an admin approves it.
1. A client requests a consultation → status **pending**. Client and agency are emailed.
2. The agency **accepts** (confirmed) or **declines** it. The client is emailed.
3. After the visit the agency marks it **completed**. The client is emailed and can leave one review.
4. A client can **cancel** a pending or confirmed booking. The agency is emailed.

Every status change is recorded in the booking's history (who, which role, when), and admins can override any status.

Reviews are stored on the agency, and each new review is averaged into the existing rating.

## Tests

```bash
pip install -r backend/requirements.txt -r tests/requirements.txt
pytest tests
```

## Main API routes

| Method | Route | Who |
| --- | --- | --- |
| POST | `/api/auth/signup`, `/api/auth/login` | Anyone |
| GET | `/api/agencies`, `/api/agencies/{id}`, `/api/reviews/{agency_id}` | Anyone |
| POST | `/api/agencies` | Agency accounts (one profile each) |
| GET | `/api/agency/me`, `/api/agency/bookings` | Agency accounts |
| POST / GET | `/api/bookings` | Signed-in users |
| PATCH | `/api/bookings/{id}/status` | The booking's agency or client |
| POST | `/api/reviews` | Client, after a completed visit |
| GET | `/api/admin/overview`, `/api/admin/agencies`, `/api/admin/bookings`, `/api/admin/users`, `/api/contact/messages` | Admins |
| GET | `/api/admin/agencies/{id}` (profile, owner, all bookings with history) | Admins |
| PATCH | `/api/admin/agencies/{id}` (approve, available/unavailable, verify badge) | Admins |
| PATCH | `/api/admin/bookings/{id}/status` (override, with optional note) | Admins |
| POST | `/api/seed` | Admins |
