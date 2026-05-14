# Sprint 01 — Project Foundation

## Goal
Scaffold both apps. Connect to MongoDB. Verify connection. Set up middleware skeleton.

---

## Backend Tasks

### 1. Init project
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken zod cors morgan helmet
npm install @scalar/express-api-reference swagger-jsdoc
npm install -D typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/morgan @types/cors jest supertest nodemon ts-jest @types/jest @types/supertest
npx tsc --init
```

Update `tsconfig.json`:
- `strict: true`
- `outDir: ./dist`
- `rootDir: ./src`
- `esModuleInterop: true`

### 2. `server.ts`
- All files use `.ts` — no `.js`
- Typed with `Request`, `Response`, `NextFunction` from express
- Create express app
- Apply `cors`, `morgan`, `helmet`, `express.json()`
- Mount Scalar: `GET /docs` using `@scalar/express-api-reference`
- Apply global error handler (last middleware)
- Connect to MongoDB via `config/db.ts`
- Start server on `process.env.PORT`

### 3. `config/db.js`
- `mongoose.connect(process.env.MONGODB_URI)`
- Log success or throw on failure
- Export connect function

### 4. `config/env.js`
- Validate required env vars on startup using Zod
- Throw descriptive error if any are missing
- Required: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`

### 5. `middleware/errorHandler.js`
```js
// Signature: (err, req, res, next)
// Returns: { success: false, message: err.message }
// In dev: include err.stack
// Handle Mongoose validation errors (400), cast errors (400), duplicate key (409)
```

### 6. `middleware/notFound.js`
```js
// Returns 404 { success: false, message: "Route not found" }
```

### 7. Folder structure
Create empty placeholder files for all folders listed in COPILOT_START.md.

---

## Frontend Tasks

### 1. Init project
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios react-hook-form @hookform/resolvers zod
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Tailwind config
Configure `content` paths in `tailwind.config.js`. Add directives to `index.css`.

### 3. App layout
- `App.jsx` — router setup with React Router v6
- `components/layout/Sidebar.jsx` — static sidebar with placeholder nav links
- `components/layout/Layout.jsx` — sidebar + main content area
- All pages render inside `<Layout />`

### 4. Pages (stub only, no data yet)
- `pages/Dashboard.jsx` — "Dashboard coming soon"
- `pages/Login.jsx` — empty login form shell

### 5. `services/api.js`
```js
// Axios instance with baseURL: import.meta.env.VITE_API_URL
// Request interceptor: attach JWT from localStorage
// Response interceptor: redirect to /login on 401
```

---

## Acceptance Criteria

- [ ] `npm run dev` starts backend, logs "MongoDB connected" and "Server running on port 5000"
- [ ] `GET /` returns `{ success: true, message: "Hospital API" }`
- [ ] Invalid route returns 404 JSON (not HTML)
- [ ] Frontend runs on `localhost:5173`, shows sidebar layout
- [ ] No console errors on either side

---

## package.json scripts (backend)
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest --forceExit",
    "test:watch": "jest --watch"
  }
}
```
