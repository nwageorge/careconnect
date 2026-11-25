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
- Light and dark mode (follows the system setting, with a toggle in the header)

## Tech stack

| Part | Stack |
| --- | --- |
| Frontend | React 19 (Create React App + craco), Tailwind CSS, shadcn/Radix UI, Framer Motion |
| Backend | FastAPI, MongoDB (motor), PyJWT, bcrypt |
| Email | Any SMTP server (logs to the console when SMTP is not set up) |

## Project layout

```
backend/server.py        API routes, models and the 22 sample agencies
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

On startup the backend loads 22 sample agencies if the database is empty.
Set `SEED_SAMPLE_DATA=false` to turn that off.

**Frontend**

```bash
cd frontend
cp .env.example .env          # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start                    # http://localhost:3000
```

## Configuration

All backend settings live in `backend/.env` (see `backend/.env.example`).

| Variable | Purpose |
| --- | --- |
| `MONGO_URL`, `DB_NAME` | MongoDB connection |
| `JWT_SECRET` | Signs login tokens. **Required in production.** If missing, a random one is used and logins reset on restart. |
| `ADMIN_EMAILS` | Comma-separated emails that become admins when they sign up. Nobody can choose the admin role themselves. |
| `CORS_ORIGINS` | Comma-separated frontend URLs allowed to call the API |
| `SEED_SAMPLE_DATA` | `true` to load sample agencies into an empty database |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_USE_TLS`, `EMAIL_FROM` | Booking emails. Leave `SMTP_HOST` empty to log emails instead. |

## Booking flow

1. A client requests a consultation → status **pending**. Client and agency are emailed.
2. The agency **accepts** (confirmed) or **declines** it. The client is emailed.
3. After the visit the agency marks it **completed**. The client is emailed and can leave one review.
4. A client can **cancel** a pending or confirmed booking. The agency is emailed.

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
| POST | `/api/seed`, GET `/api/contact/messages` | Admins |
