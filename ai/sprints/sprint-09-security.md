# Sprint 09 — Security Layer + Audit Logs

## Goal
Add audit logging, rate limiting, and security hardening. Complete the security story for presentation.

---

## Database

### Model: `models/AuditLog.js`
Fields: per `docs/database/schemas.md` — auditLogs collection.

```js
// TTL index — auto-delete logs older than 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
AuditLogSchema.index({ userId: 1 })
```

---

## Backend Tasks

### 1. Audit Log Service — `services/auditService.js`

```js
export async function log({ userId, action, resource, resourceId, ipAddress }) {
  // Fire and forget — don't await, don't let failures block the main request
  AuditLog.create({
    userId,
    action,
    resource,
    resourceId,
    ipAddress,
    timestamp: new Date()
  }).catch(err => console.error('Audit log failed:', err))
}
```

**Action constants — `utils/auditActions.js`**
```js
export const AUDIT_ACTIONS = {
  CREATE_PATIENT: 'CREATE_PATIENT',
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  DELETE_PATIENT: 'DELETE_PATIENT',
  CREATE_APPOINTMENT: 'CREATE_APPOINTMENT',
  UPDATE_APPOINTMENT_STATUS: 'UPDATE_APPOINTMENT_STATUS',
  CREATE_PRESCRIPTION: 'CREATE_PRESCRIPTION',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT'
}
```

### 2. Integrate into Controllers

Add `auditService.log(...)` calls in:
- `authController.login` → `USER_LOGIN`
- `patientController.createPatient` → `CREATE_PATIENT`
- `patientController.deletePatient` → `DELETE_PATIENT`
- `appointmentController.createAppointment` → `CREATE_APPOINTMENT`
- `appointmentController.updateStatus` → `UPDATE_APPOINTMENT_STATUS`
- `prescriptionController.createPrescription` → `CREATE_PRESCRIPTION`

### 3. Rate Limiting — `middleware/rateLimiter.js`
```bash
npm install express-rate-limit
```

```js
import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 requests per window
  message: { success: false, message: 'Too many attempts. Try again later.' }
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
})
```

Apply:
- `authLimiter` on `POST /auth/login` and `POST /auth/register`
- `apiLimiter` globally on `/api`

### 4. Input Sanitization
```bash
npm install express-mongo-sanitize
```

```js
// In server.js — before routes
import mongoSanitize from 'express-mongo-sanitize'
app.use(mongoSanitize())
// Strips $ and . from request body/params/query — prevents NoSQL injection
```

### 5. Security Headers
`helmet` should already be in Sprint 01. Verify it's applied:
```js
app.use(helmet())
// Adds: X-Frame-Options, X-XSS-Protection, no-sniff, HSTS, etc.
```

### 6. Audit Log Controller — `controllers/auditController.js`

**`getAuditLogs`**
- Role: admin only
- Support filters: `?userId=`, `?action=`, `?startDate=`, `?endDate=`
- Paginated response
- Populate userId → name, email

### 7. Routes
```
GET /api/audit-logs   → verifyToken, authorize(['admin']), getAuditLogs
```

---

## Frontend Tasks

### 1. `pages/Admin/AuditLogs.jsx`
- Table: Timestamp, User, Action, Resource, IP
- Filters: action dropdown, date range
- Admin sidebar link

---

## Documentation — `docs/database/security.md`

Write explanations for:
1. **Password hashing**: why bcrypt, what salt rounds mean, why not MD5/SHA
2. **JWT**: stateless auth, what's in the payload, why not store sensitive data in token
3. **NoSQL injection**: what it is, how `mongoSanitize` prevents it
4. **TTL indexes**: how MongoDB auto-expires audit logs
5. **Rate limiting**: brute force prevention on auth routes
6. **Role-based access**: how `authorize()` middleware works

---

## Tests — `tests/audit.test.js`

```js
describe('Audit Logging', () => {
  test('login creates audit log entry')
  test('creating patient creates audit log entry')
})

describe('GET /api/audit-logs', () => {
  test('admin can view logs')
  test('non-admin gets 403')
  test('filter by action works')
})

describe('Rate Limiting', () => {
  test('returns 429 after 10 failed login attempts in window')
})
```

---

## Acceptance Criteria

- [ ] TTL index on `auditLogs.timestamp` exists in Atlas
- [ ] Login creates an audit log document (verify in Atlas)
- [ ] 11th login attempt in 15 minutes returns 429
- [ ] `mongoSanitize` strips `$` from body (test manually with `{ "email": { "$gt": "" } }`)
- [ ] Audit log page renders for admin with correct data
- [ ] `docs/database/security.md` written
- [ ] All tests pass
