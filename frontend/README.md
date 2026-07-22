# StayEase — Frontend (React + TypeScript)

Single-page app for the StayEase platform.

## Stack
React 18 · TypeScript · Vite · Redux Toolkit · React Router · Axios · TailwindCSS · Recharts

## Run locally
```bash
cp .env.example .env       # default /api works with the Vite proxy → localhost:8080
npm install
npm run dev                # http://localhost:5173
```

## Build
```bash
npm run build              # type-check + production bundle in dist/
npm run preview            # preview the built bundle
```

## Structure
```
src/
├── app/            # Redux store + typed hooks
├── features/auth/  # auth slice (persisted to localStorage)
├── lib/            # axios client with JWT + refresh interceptors
├── components/     # Navbar, Layout, HotelCard, SearchBar, dashboard widgets, UI atoms
├── pages/          # route pages (public, customer, manager/, admin/, dashboards/)
└── types/          # shared TypeScript models
```

## Environment
- `VITE_API_BASE_URL` — backend API base. Local dev uses `/api` (proxied). For production, set to `https://<backend>/api`.
