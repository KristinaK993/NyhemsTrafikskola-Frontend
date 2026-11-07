# Nyhems Trafikskola – Frontend

The website for Nyhems Trafikskola (driving school): information about car and motorcycle licences, prices and packages, inquiry forms, a student portal with Riskettan booking, and an admin panel for staff.

The API lives in a separate repository: [NyhemsTrafikskola-Backend](https://github.com/KristinaK993/NyhemsTrafikskola-Backend).

> **Swedish terms:** the site content and URLs are in Swedish. *Riskettan* and *Risktvåan* are the mandatory risk education courses (part 1 and part 2) for a Swedish driving licence; *Bil* = car, *MC* = motorcycle, *elev* = student.

## Tech stack

- React 19 + TypeScript
- Vite
- React Router 7
- Tailwind CSS 4
- Oxlint

## Getting started

### Prerequisites

- Node.js 22
- The backend API running locally (see the backend repository's README)

### Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

Open the address Vite prints (usually `http://localhost:5173`).

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_DOTNET_API_BASE_URL` | Base URL of the .NET API, locally `https://localhost:7181` |

Anything prefixed with `VITE_` is bundled into the public code – never put secrets there.

> Auth cookies are issued with `SameSite=None; Secure`. If sign-in doesn't work locally, check that the API's development certificate is trusted (`dotnet dev-certs https --trust`) and that the frontend's origin is listed in the API's `Cors:AllowedOrigins`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type check (`tsc -b`) and production build to `dist/` |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build |

## Project structure

```
src/
├── api/         API client and backend calls (see src/api/README.md)
├── auth/        AuthContext and ProtectedRoute
├── components/  Reusable components (header, forms, price lists …)
├── data/        Static data, e.g. prices
├── layouts/     Page layout
├── pages/       One component per page
├── App.tsx      Routing
└── main.tsx     Entry point
```

## Pages and access

| Path | Access | Content |
| --- | --- | --- |
| `/`, `/bil-korkort`, `/mc-korkort`, `/om-oss`, `/kontakt` | Anyone | Information pages (home, car licence, MC licence, about, contact) |
| `/priser-och-paket`, `/bil-priser-och-paket`, `/mc-priser-och-paket` | Anyone | Prices and packages |
| `/riskettan-bil`, `/riskettan-mc`, `/risktvaan-bil`, `/risktvaan-mc` | Anyone | Risk education courses |
| `/forfragan-testlektion`, `/forfragan-mc-utbildning`, `/forfragan-risktvaan-mc` | Anyone | Inquiry forms (test lesson, MC training, Risktvåan MC) |
| `/login`, `/register` | Signed out | Sign in and student account registration |
| `/bokning-riskettan-bil`, `/bokning-riskettan-mc` | Student | Book Riskettan |
| `/elev` | Student | Student portal with "My bookings" and cancellation |
| `/admin` | Instructor/Admin | Manage course sessions, participants and manual bookings |

The role checks in the frontend only control navigation – the API is responsible for actual authorization.

## Authentication

`src/api/client.ts` sends every request with `credentials: "include"` so the browser handles the auth cookie. The antiforgery token is read from the `X-XSRF-TOKEN` response header, kept in memory and sent back in the same header on write requests. Sign-in state is loaded from `/api/auth/me` when the app starts.

## Booking terms

`BOOKING_TERMS_VERSION` in `src/api/courseSessionsApi.ts` must match `BookingTerms.CurrentVersion` in the backend. Update both (and the terms text in `RiskettanBookingForm`) whenever the terms change.

## CI

GitHub Actions (`.github/workflows/`) runs lint and build on pushes and pull requests to `main`.
