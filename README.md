# El Greco Webapp – Portfolio Project

Live: [Frontend (Vercel)](https://YOUR-VERCEL-DOMAIN) • [API (Render)](https://YOUR-RENDER-DOMAIN)

## Overview
End‑to‑end demo (MongoDB + Express + JWT + vanilla JS) for managing categories, subcategories, artworks, exhibitions, and links.

## Architecture
- **Frontend:** static SPA (HTML/CSS/JS) on Vercel
- **Backend:** Node.js/Express API on Render
- **DB:** MongoDB (Mongoose)

## Quickstart
```bash
cp backend/.env.example backend/.env
npm install --prefix backend
npm run dev --prefix backend
```

## Security
- Helmet + CSP
- Login rate limiting
- Server‑side HTML sanitization for rich text fields

## API
OpenAPI spec: [`docs/openapi.yaml`](./docs/openapi.yaml)

## Pagination
All list endpoints accept `?page=&limit=`. If omitted, full list is returned (legacy behavior).

## Roadmap
- Tests (Jest + Supertest)
- S3 storage & thumbnails (future)


## API Docs
- Swagger UI available at: `/api/docs`
- Raw spec: `/api/docs/openapi.yaml` or `/api/docs/openapi.json`


## Tests & Lint (added)
- **Tests:** Jest + Supertest (backend). Run:
  ```bash
  cd backend
  npm i
  npm test
  ```
- **Coverage:** `npm run coverage`
- **Linting/Formatting:** ESLint + Prettier
  ```bash
  npm run lint
  npm run format
  ```

> Σημείωση: Το `server.js` πλέον κάνει export το `app` και αποφεύγει το `listen` όταν `NODE_ENV=test`, ώστε τα tests να τρέχουν χωρίς να ανοίγει port.
