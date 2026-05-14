# Security Layer

This document explains the security mechanisms protecting the Hospital
Management System.

## 1. Password hashing (bcrypt)

User passwords are never stored in plaintext. The `User` model's pre-save hook
hashes the password with **bcrypt** at **12 salt rounds** before persisting.

- A *salt* is random data mixed into the password before hashing, so two users
  with the same password get different hashes — defeating rainbow-table attacks.
- *Salt rounds* (the cost factor) control how many times the hashing is applied:
  12 rounds means 2^12 iterations. Higher cost = slower to brute-force.
- bcrypt is deliberately **slow** and adaptive. MD5/SHA-256 are fast
  general-purpose hashes — an attacker can try billions per second. bcrypt is
  designed for passwords specifically, making mass guessing impractical.

## 2. JWT authentication

Login returns a signed **JWT** (JSON Web Token). The server stores no session —
authentication is **stateless**: every request carries the token in the
`Authorization: Bearer <token>` header and `verifyToken` validates the
signature.

- Payload contains only `userId`, `role`, and `name` — enough to authorize
  requests without a database lookup.
- The payload is *signed, not encrypted* — anyone can read it. So it must never
  contain sensitive data (passwords, etc.). It only holds identifiers.
- Tokens expire after `JWT_EXPIRES_IN` (7 days), limiting the damage window of a
  leaked token.

## 3. NoSQL injection & `express-mongo-sanitize`

MongoDB queries are objects, so an attacker can inject operators. A login body
like `{ "email": { "$gt": "" } }` would make `User.findOne({ email })` match the
*first* user instead of a specific one.

`express-mongo-sanitize` runs as middleware before the routes and strips any
keys containing `$` or `.` from `req.body`, `req.params`, and `req.query`, so
injected operators never reach a query.

## 4. TTL indexes (audit log auto-expiry)

`auditLogs` has a **TTL index**:

```js
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
```

MongoDB's background TTL monitor deletes documents once `timestamp` is older
than 90 days. This keeps the audit collection bounded with zero application
code — no cron job, no cleanup script.

## 5. Rate limiting (brute-force prevention)

`express-rate-limit` caps requests per IP per 15-minute window:

- `authLimiter` — **10 requests** on `/api/auth/login` and `/api/auth/register`.
  An attacker can't sit and guess thousands of passwords; the 11th attempt in
  the window gets `429 Too Many Requests`.
- `apiLimiter` — **200 requests** across all of `/api`, a backstop against
  general abuse.

## 6. Role-based access control

Every protected route runs two middlewares in order:

1. `verifyToken` — decodes the JWT and attaches `req.user`.
2. `authorize([...roles])` — a factory that returns middleware checking
   `req.user.role` against the allowed list, responding `403` on mismatch.

Example: `authorize(['admin'])` on `/api/audit-logs` means only admins reach the
controller. Authorization is centralized in middleware, not scattered through
controller logic.

## 7. Audit logging

Sensitive actions (login, patient create/delete, appointment create/status
change, prescription create) write an `AuditLog` document via a **fire-and-forget**
service — it is never `await`ed, so a logging failure can never block or break
the user's request. Admins review the trail at `GET /api/audit-logs` with
filtering by user, action, and date range.

## 8. Security headers (helmet)

`helmet()` sets hardening HTTP headers on every response: `X-Frame-Options`
(clickjacking), `X-Content-Type-Options: nosniff` (MIME sniffing),
`Strict-Transport-Security` (HTTPS enforcement), and more.
