# Deploy οδηγίες (Render + Vercel)

## Backend (Render)
1. Δημιούργησε Web Service από τον φάκελο `backend/`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Περιβάλλον (Env Vars):
   - `MONGO_URI` = σύνδεση προς MongoDB Atlas
   - `JWT_SECRET` = τυχαία συμβολοσειρά ≥ 32 bytes
   - (προαιρετικό) `ALLOWED_ORIGINS` = `https://<your-vercel-app>.vercel.app`
5. One-off seed admin:
   ```bash
   MONGO_URI="..." node scripts/seed-admin.js admin <ισχυρός_κωδικός>
   ```

## Frontend (Vercel)
1. Project root: `frontend/` (Static).
2. Το `frontend/vercel.json` κάνει proxy τα `/api/*` και `/auth/*` προς Render.
3. **Πριν το deploy** άλλαξε στο `frontend/vercel.json` το `<RENDER_URL>` με το domain του Render, π.χ. `your-backend.onrender.com`.

## Extra
- Το `backend/.env.example` δείχνει τα αναμενόμενα variables. Μην κάνεις commit πραγματικό `.env`.
- Login γίνεται από MongoDB, όχι από hardcoded κωδικό.
- Προστέθηκαν Helmet, Rate Limiting, health endpoint (`/healthz`) και έλεγχος mimetype για uploads εικόνων.
