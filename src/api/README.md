# Booking API

`bookingApi.ts` and `types.ts` contain the frontend contract for the future Nyhems .NET API. Screens use these methods and types rather than defining booking payloads or URLs.

Configure the API base URL with `VITE_DOTNET_API_BASE_URL` (for local development, `https://localhost:7181`). Never put secrets in frontend environment variables.

`client.ts` sends cookies with `credentials: "include"`. The auth API returns the antiforgery request token in the `X-XSRF-TOKEN` response header; the frontend keeps that request token in memory and sends it in the same named header on write requests. It is distinct from the `NyhemsTrafikskola.XSRF` cookie. The browser manages both cookies, including the HttpOnly authentication cookie.

Authentication state is refreshed from `/api/auth/me` on app startup. Staff only routes require an `Admin` or `Instructor` role in that response. These client-side checks support navigation; the API remains responsible for authorization.

Riskettan sessions are read from `GET /api/course-sessions?courseType=RiskettanBil|RiskettanMC` (`courseSessionsApi.ts`). A signed-in student books with `POST /api/course-sessions/{id}/bookings` and the body `{ "termsAccepted": true }`; the API identifies the student from the authentication cookie, so no profile id or contact details are sent. A booking is presented as confirmed only after the API returns status `Confirmed`.

`bookingApi.ts` and `types.ts` still describe the inquiry endpoints (`/api/requests/*`), which the backend does not implement yet.
