# COPILOT_START.md — Smart Hospital Management System

## READ THIS FIRST

This is your instruction manifest. You are helping build a **database-centric hospital management system** as an academic DBMS project. The evaluation is primarily on **MongoDB schema design, relationships, indexing, and aggregation pipelines** — not UI polish.

---

## HOW TO USE THIS GUIDE

1. Read this file completely before writing any code
2. Then read `docs/architecture/stack.md`
3. Then read `docs/database/schemas.md`
4. Then execute sprints **in order**, one at a time
5. Each sprint file is in `sprints/sprint-XX-name.md`
6. Do not skip sprints or merge them

When I say "implement sprint X", read the corresponding sprint file and follow it precisely.

---

## PROJECT STRUCTURE TO GENERATE

```
hospital-management-system/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/          # axios API calls
│   │   ├── context/           # AuthContext
│   │   └── routes/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/            # db.js, env validation
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routers
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/         # auth, error, roles
│   │   ├── services/          # reusable logic
│   │   ├── validators/        # Zod schemas
│   │   ├── utils/             # helpers
│   │   └── tests/             # Jest + Supertest
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── database/
│   └── sprints/
│
└── README.md
```

---

## TECH STACK

- Language: TypeScript (strict mode, no `any`)
- API Docs: Scalar (via @scalar/express-api-reference + openapi-types)

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind, React Router, Axios, React Hook Form |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Testing | Jest, Supertest |

---

## ROLES IN THE SYSTEM

| Role | Permissions |
|---|---|
| `admin` | Full access, manage doctors, view analytics |
| `doctor` | View own appointments, write prescriptions, view patient history |
| `receptionist` | Create/search patients, book appointments |
| `patient` | View own records (optional sprint) |

---

## DEVELOPMENT RULES

- Every Mongoose model must have explicit indexes documented
- Every route must go through role-based middleware: `authorize(['admin', 'doctor'])`
- Passwords are always hashed with bcrypt before save
- JWTs expire in 7d (access token)
- All inputs validated with Zod before hitting the controller
- Tests live in `backend/src/tests/` and mirror the route they test
- No inline MongoDB queries in routes — all DB logic goes in controllers or services

---

## SPRINT ORDER

| Sprint | Focus |
|---|---|
| 01 | Project Foundation |
| 02 | Authentication + Role Middleware |
| 03 | Patient Management |
| 04 | Doctor Management + Scheduling |
| 05 | Appointment System |
| 06 | E-Prescriptions |
| 07 | Patient History (Aggregation) |
| 08 | Analytics Dashboard |
| 09 | Security Layer + Audit Logs |

---

## UI DESIGN CONSTRAINTS

- Neutral color palette: grays, whites, one accent color (blue or teal)
- Sidebar navigation with role-aware links
- Tables for list views (patients, doctors, appointments)
- No glassmorphism, no gradients, no emoji in UI copy
- Forms use React Hook Form with Zod resolver
- Loading states and error boundaries required

---

## WHEN IMPLEMENTING EACH SPRINT

Follow this loop every time:

```
1. Create/update Mongoose model
2. Write Zod validator
3. Write controller
4. Register route with middleware
5. Write Jest test for the route
6. Build frontend page/component
7. Connect via axios service
8. Update relevant docs/database/*.md
```

---

## GIT CONFIGURATION

Run once at project init (Sprint 01):
```bash
git init
git config user.email "mujtabazain183@gmail.com"
git config user.name "Zain Ul Abdeen"
git remote add origin https://github.com/ZainULAbdeen0/Medico.git
git checkout -b development
git add .
git commit -m "chore: initial project setup"
git push -u origin development
```

## GIT WORKFLOW — Every Sprint

```bash
# 1. Always branch from development
git checkout development
git checkout -b feature/sprint-XX-name

# 2. Do the work, then commit
git add .
git commit -m "feat(sprint-XX): description"

# 3. Push the feature branch
git push origin feature/sprint-XX-name

# 4. Merge back into development
git checkout development
git merge feature/sprint-XX-name
git push origin development
```

## START HERE

Read next: `docs/architecture/stack.md`
Then: `docs/database/schemas.md`
Then: `sprints/sprint-01-foundation.md`
