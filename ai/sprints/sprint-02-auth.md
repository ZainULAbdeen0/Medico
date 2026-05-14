# Sprint 02 — Authentication + Role Management

## Goal
JWT login system. Role-based middleware. Protect all future routes.

---

## Database

### Model: `models/User.js`
- Fields: per `docs/database/schemas.md` — users collection
- Pre-save hook: hash password with bcrypt (saltRounds: 12) if modified
- Instance method: `comparePassword(plainText)` → returns boolean
- Never return `password` field in queries — use `.select('-password')` everywhere
- Index: `email` unique

---

## Backend Tasks

### 1. Zod Validators — `validators/authValidators.js`
```js
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
})

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'doctor', 'receptionist', 'patient'])
  })
})
```

### 2. Validation Middleware — `middleware/validate.js`
```js
// Takes a Zod schema, validates req against it
// On failure: returns 400 with formatted error messages
// On success: calls next()
```

### 3. Auth Controller — `controllers/authController.js`

**`register`**
- Check if email exists (return 409 if yes)
- Create user (password hashed via pre-save hook)
- Return user without password

**`login`**
- Find user by email (include password for this query only)
- Call `user.comparePassword(req.body.password)`
- On success: sign JWT `{ userId: user._id, role: user.role, name: user.name }`
- Return `{ token, user: { id, name, email, role } }`

**`getMe`**
- Protected route — return `req.user` populated from token

### 4. Auth Middleware — `middleware/auth.js`

**`verifyToken`**
```js
// Extract Bearer token from Authorization header
// jwt.verify → attach decoded payload to req.user
// On failure: 401
```

**`authorize(roles = [])`**
```js
// Factory function returning middleware
// Checks req.user.role against roles array
// On failure: 403
// Usage: authorize(['admin', 'doctor'])
```

### 5. Routes — `routes/authRoutes.js`
```
POST /api/auth/register    → validate(registerSchema), register
POST /api/auth/login       → validate(loginSchema), login
GET  /api/auth/me          → verifyToken, getMe
```

Register router in `server.js`.

---

## Frontend Tasks

### 1. `context/AuthContext.jsx`
- State: `{ user, token, isLoading }`
- `login(email, password)` → call API, store token in localStorage, set user state
- `logout()` → clear localStorage, reset state
- `isAuthenticated` computed boolean

### 2. `pages/Login.jsx`
- React Hook Form + Zod resolver
- Fields: email, password
- On submit: call `authContext.login()`
- Show error message on failure
- Redirect to `/dashboard` on success

### 3. Protected Route — `routes/ProtectedRoute.jsx`
```jsx
// Reads from AuthContext
// If not authenticated: redirect to /login
// If role provided and doesn't match: redirect to /unauthorized
```

### 4. `App.jsx` routing
```jsx
<Route path="/login" element={<Login />} />
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  // all other protected routes go here
</Route>
```

### 5. Sidebar — update with role-aware links
```jsx
// Use AuthContext to conditionally show links based on user.role
```

---

## Tests — `tests/auth.test.js`

```js
describe('POST /api/auth/register', () => {
  test('creates user and returns 201')
  test('returns 409 on duplicate email')
  test('returns 400 on invalid body')
})

describe('POST /api/auth/login', () => {
  test('returns token on valid credentials')
  test('returns 401 on wrong password')
  test('returns 400 on missing fields')
})

describe('GET /api/auth/me', () => {
  test('returns user when valid token provided')
  test('returns 401 when no token')
})
```

---

## Acceptance Criteria

- [ ] Register creates hashed password in DB (verify in MongoDB Atlas)
- [ ] Login returns valid JWT
- [ ] `GET /api/auth/me` with token returns user (no password field)
- [ ] Protected route with wrong role returns 403
- [ ] Login form works, stores token, redirects to dashboard
- [ ] Sidebar shows only role-appropriate links
- [ ] All 8 tests pass
