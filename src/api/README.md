# Booking API

`bookingApi.ts` and `types.ts` contain the frontend contract for the future Nyhems .NET API. Screens use these methods and types rather than defining booking payloads or URLs.

Configure the public API base URL with `VITE_DOTNET_API_BASE_URL` after the backend is deployed. Leave it empty while no backend is available. Never put secrets in frontend environment variables.

Riskettan sessions and bookings use separate `car` and `mc` routes. The frontend only offers sessions returned by the API with available places. A booking is presented as confirmed only after the API returns a valid confirmation response.
