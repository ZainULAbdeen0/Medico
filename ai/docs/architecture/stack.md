# Architecture Overview

## Backend Architecture

Express follows a layered architecture:

```
Request → Middleware (auth/role) → Route → Controller → Service/Model → Response
```

- **Routes** only declare endpoints and attach middleware
- **Controllers** handle request/response and call services
- **Services** contain reusable business logic (e.g., conflict checking for appointments)
- **Models** are Mongoose schemas only — no logic

## Frontend Architecture

```
Page → Hook (usePatients, useAppointments) → Service (axios) → API
```

- Pages are thin — just layout + component composition
- All API calls live in `src/services/`
- Auth state lives in `AuthContext` (JWT stored in httpOnly cookie or localStorage with care)
- React Hook Form + Zod handles all form validation client-side

## Authentication Flow

```
POST /auth/login
  → validate credentials
  → compare bcrypt hash
  → sign JWT { userId, role, name }
  → return token

Protected routes:
  → verifyToken middleware decodes JWT
  → authorize(['role']) middleware checks role array
  → req.user available in controller
```

## Error Handling

Global error handler in `middleware/errorHandler.js`:

```js
// All controllers use next(error) pattern
// Error handler returns: { success: false, message, ...(dev: stack) }
```

Zod validation errors are caught and formatted before reaching the global handler.

## Environment Variables Required

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Use `dotenv` + validate all env vars on startup in `config/env.js`.
