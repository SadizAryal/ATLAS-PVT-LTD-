# Atlas Induct 360 V1.0 Final - Team 6 Atlas Labs (B6)

## Run
1. Install: `pnpm install` (or `npm install`)
2. Dev: `pnpm dev` then open http://localhost:3000
3. Production: `pnpm build` then `pnpm start`
4. Live reference: https://atlas-xi-beige.vercel.app/

## Demo path (7 minutes)
1. Home: enter full name (2 chars or more), Start induction.
2. Scene: drag or swipe, open all 5 hotspots (forklift, PPE, fire exit, manual handling bay, spill point). Counter N of N fills, quiz unlocks.
3. Quiz: 5 multiple choice with Check and reasons, then 1 written answer about the blocked exit, Submit. Score percent with 70 pass.
4. Certificate: name, score, date, Print button.
5. Manager: code COLAB-2026 (demo only), filter all/passed/failed, search, sort, follow up flagged rows.
6. Hotspots admin (/admin, same code): add a point live with label, role tag, yaw, pitch, hazard and fix. Reload scene to show the new marker. Deactivate to hide.

## The hotspot fix (say on stage)
Amin 25 Sep: three hotspots are too few and dynamic add is essential, with points for specific roles. V1.0 answers with the admin page: POST /api/hotspots saves JSON (data/hotspots.json locally, documented Postgres swap per B1 ERD), scene reloads markers with no code deploy. Demo adds one live point on stage.

## API
- GET/POST /api/hotspots (admin JSON store, merged over base config)
- GET/POST /api/attempts (attempt log, browser store mirrors it)
- POST /api/judge {text} returns {label: safe|unsafe|unknown, confidence}. Rule based in V1.0 with identical labels, server key hook ready (TYPESAFE_API_KEY) for service swap. Timeout 8s, fail open to model answer with review flag.

## Test
`npx tsc --noEmit` clean. Manual plan TC-01 to TC-16 in B1 Section 3.4, executed on demo laptop in Chrome and Edge before the client call with backup recording ready.
