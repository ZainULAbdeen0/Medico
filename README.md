# Mediko Clinics &mdash; Hospital Manager

A full-stack hospital management application built as a university semester project for a Database Management Systems course. The emphasis is on **real MongoDB schema design** &mdash; relationships across collections, indexes, aggregation pipelines, role-based access &mdash; with a working web UI on top so the data layer can be exercised end to end.

> **Course context.** Built as the term project for an undergraduate DBMS module. The goal was to take a realistic operational domain (a small clinic / hospital), model it properly, and put it behind a typed REST API with an admin console. Not a production system.

---

## Tech stack

| Layer        | Stack |
|---           |---    |
| Database     | MongoDB (Mongoose ODM) |
| Backend      | Node.js, Express, TypeScript, Zod (request validation), JWT auth |
| Frontend     | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Axios |
| API docs     | OpenAPI 3 generated from JSDoc via `swagger-jsdoc`, rendered with Scalar at `/docs` |
| Tests        | Jest + Supertest (backend) |
| Deployment   | IIS on Windows Server &mdash; iisnode for the backend, static site for the frontend |

---

## Features

- **Authentication & RBAC.** JWT-based login with four roles: `admin`, `doctor`, `receptionist`, `patient`. Every protected route is gated by role.
- **Patients.** CRUD with search/pagination, medical history aggregate (appointments + prescriptions in one call), prescription list per patient.
- **Doctors.** Profile management linked to user accounts, specialization / department / qualifications, weekly schedule.
- **Schedules.** Per-doctor weekly availability slots.
- **Appointments.** Booking flow, status transitions (`pending` &rarr; `confirmed` &rarr; `completed` / `cancelled`), filterable list.
- **Prescriptions.** E-prescriptions tied to an appointment with multiple medicines (dosage, frequency, duration).
- **Analytics dashboard.** Aggregation-pipeline-backed totals and an appointment trend over the last N days.
- **Audit log.** Every mutation is recorded with actor, action, resource, and a JSON details payload.
- **Rate limiting, request sanitization, helmet** &mdash; sensible defaults out of the box.

---

## Repository layout

```
.
├─ backend/                  Express + TS API
│  ├─ src/
│  │  ├─ controllers/       Route handlers
│  │  ├─ models/            Mongoose schemas
│  │  ├─ routes/            Express routers (with @openapi JSDoc)
│  │  ├─ middleware/        auth, validate, rate limit, error handler
│  │  ├─ validators/        Zod request schemas
│  │  ├─ config/            db, env, openApi
│  │  └─ server.ts          Entrypoint
│  ├─ web.config             iisnode config (only used in IIS deploy)
│  └─ package.json
│
├─ frontend/                 React + Vite admin console
│  ├─ src/
│  │  ├─ pages/             Route-level screens
│  │  ├─ components/        Layout, modals, common UI
│  │  ├─ services/          axios wrappers per resource
│  │  ├─ context/           Auth context
│  │  ├─ routes/            Protected route guard
│  │  └─ assets/            Logo, favicon
│  ├─ web.config             IIS rewrite rules for SPA + static dist
│  └─ package.json
│
├─ docs/                     Design notes (schema, sprints)
├─ deploy.ps1                One-shot IIS deployment script
└─ README.md
```

---

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB running locally **or** a connection string to Atlas / a remote cluster
- npm

### 1. Clone & install

```bash
git clone https://github.com/ZainULAbdeen0/Medico.git
cd Medico
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure environment

**`backend/.env`**

```ini
PORT=3006
MONGODB_URI=mongodb://localhost:27017/mediko
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**`frontend/.env`** (or `.env.development`)

```ini
VITE_API_URL=http://localhost:3006
```

> The `VITE_API_URL` is the **host only**, no trailing `/api`. Every frontend service file already prefixes `/api/...` on the request path (see [`frontend/src/services/`](frontend/src/services/)), so adding it again to the base URL would double-prefix and 404.

### 3. Seed the database (optional)

```bash
cd backend
npm run seed
```

This populates demo users for each role, sample patients, doctors, and a few appointments / prescriptions so the dashboard isn't empty.

**Demo accounts** (after seeding, password for all: `password123`):

| Role         | Email                      |
|---           |---                         |
| Admin        | `admin@hospital.com`       |
| Receptionist | `reception@hospital.com`   |
| Doctor       | `sarah@hospital.com`       |

### 4. Run

```bash
# in one terminal
cd backend && npm run dev          # http://localhost:3006

# in another
cd frontend && npm run dev         # http://localhost:5173 by default
```

- API health check: `GET http://localhost:3006/`
- Interactive API docs (Scalar): `http://localhost:3006/docs`

### 5. Tests

```bash
cd backend && npm test
```

---

## API documentation

The OpenAPI spec is generated at runtime from `@openapi` JSDoc blocks above each route in [`backend/src/routes/`](backend/src/routes/). The configuration and shared schemas (`User`, `Patient`, `Doctor`, `Appointment`, `Prescription`, &hellip;) live in [`backend/src/config/openApi.ts`](backend/src/config/openApi.ts). Scalar renders it interactively at `/docs` with an Authorize button for the JWT bearer scheme so you can try protected routes directly.

To document a new endpoint, drop a JSDoc block above the route definition. Example:

```ts
/**
 * @openapi
 * /api/example:
 *   get:
 *     tags: [Example]
 *     summary: Example endpoint
 *     responses:
 *       200: { description: OK }
 */
router.get("/example", handler);
```

`swagger-jsdoc` auto-discovers it on the next build.

---

## Deployment (Windows / IIS)

The repo ships a one-shot deployment script [`deploy.ps1`](deploy.ps1) intended to run on a Windows server with IIS, iisnode, and URL Rewrite installed. It expects the repo to already be cloned on the box and two IIS sites to exist.

### IIS topology this script assumes

| IIS site            | Physical path                                | Binding port | App pool          |
|---                  |---                                           |---           |---                |
| `mediko_frontend`   | `<repo>\frontend\`                           | 3005         | `DefaultAppPool`  |
| `mediko_backend`    | `<repo>\backend\`                            | 3006         | `DefaultAppPool`  |

The site names, ports, and pool are configurable via parameters &mdash; they're the defaults if you don't pass anything:

```powershell
.\deploy.ps1                                       # uses the defaults above
.\deploy.ps1 -Branch main                          # deploy a different branch
.\deploy.ps1 -AppPool MyPool -FrontSite custom_fe  # override names
```

### What it does, in order

1. `git fetch` + `git reset --hard origin/<branch>` (default branch: `development`).
2. `npm ci --include=dev` then `npm run build` in `backend/`, with a hard check that `dist/server.js` was actually emitted afterwards.
3. Same for `frontend/`, checking `dist/index.html` exists.
4. `Restart-WebAppPool DefaultAppPool` and stop/start both sites.
5. Touches `backend/web.config` so iisnode picks up the new build immediately.

All steps are logged to `deploy.log` next to the script. The script forces `NODE_ENV=development` + `NPM_CONFIG_PRODUCTION=false` for the install step so `devDependencies` (TypeScript, Vite) are present at build time even if the host has a system-wide `NODE_ENV=production`.

### Required server-side `.env` files

`deploy.ps1` does **not** create these &mdash; you place them once on the server and they persist across deploys (they're git-ignored on purpose).

**`<repo>\backend\.env`**

```ini
PORT=3006
MONGODB_URI=mongodb://your-mongo-host:27017/mediko
JWT_SECRET=long-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

> `PORT` here is overridden by iisnode at runtime (it injects a named-pipe path). The key still needs to exist so the Zod env validator passes.

**`<repo>\frontend\.env.production`**

```ini
VITE_API_URL=http://<public-host>:3006
```

Vite reads this on every `vite build` and inlines the value into the JS bundle, so any change requires a redeploy.

### IIS permissions

The app-pool identity needs read+execute on both site folders and **write on the backend folder** (iisnode creates its log dir and per-request asset cache inside it):

```powershell
icacls "<repo>\backend"  /grant "IIS APPPOOL\DefaultAppPool:(OI)(CI)M"  /T
icacls "<repo>\frontend" /grant "IIS APPPOOL\DefaultAppPool:(OI)(CI)RX" /T
```

### Production gotchas worth knowing

- **HTTPS.** The backend's `/docs` ships with a relaxed Content Security Policy override so Scalar's jsDelivr bundle can load over plain HTTP. Once you put a TLS terminator in front of it, that override in [`backend/src/app.ts`](backend/src/app.ts) becomes unnecessary.
- **CORS.** The backend uses `cors()` with no options &mdash; allow-all. Tighten this before exposing publicly.
- **Mongo on the same box.** If MongoDB runs on the same Windows server, set `MONGODB_URI=mongodb://localhost:27017/mediko` in the backend `.env`.

---

## Scripts

| Where         | Command            | What it does                            |
|---            |---                 |---                                      |
| `backend/`    | `npm run dev`      | nodemon + ts-node, watches `src/`       |
| `backend/`    | `npm run build`    | `tsc` &rarr; `dist/`                    |
| `backend/`    | `npm start`        | `node dist/server.js` (after build)     |
| `backend/`    | `npm run seed`     | Inserts demo data                       |
| `backend/`    | `npm test`         | Jest + Supertest                        |
| `frontend/`   | `npm run dev`      | Vite dev server                         |
| `frontend/`   | `npm run build`    | Vite production build &rarr; `dist/`    |
| `frontend/`   | `npm run preview`  | Serve the built bundle locally          |
| repo root     | `.\deploy.ps1`     | IIS deploy (see above)                  |

---

## License

No license. feel free to use, copy, fork, or learn from any part of this repo.
