# Hospital Management System — Copilot Guide

## How to Use

1. Open this folder in VS Code
2. Open `COPILOT_START.md` in Copilot Chat
3. Say: **"Read COPILOT_START.md and all files it references. Then implement sprint 01."**
4. After each sprint is complete and tested, say: **"Implement sprint 02."**

## File Map

```
COPILOT_START.md                    ← Start here
│
├── docs/
│   ├── architecture/
│   │   └── stack.md                ← Architecture decisions
│   └── database/
│       └── schemas.md              ← All MongoDB schemas + index rationale
│
└── sprints/
    ├── sprint-01-foundation.md     ← Express setup, MongoDB, folder structure
    ├── sprint-02-auth.md           ← JWT, bcrypt, role middleware
    ├── sprint-03-patients.md       ← Patient CRUD, embedded docs, text search
    ├── sprint-04-doctors.md        ← Doctor profiles, schedule management
    ├── sprint-05-appointments.md   ← Booking, conflict detection, compound index
    ├── sprint-06-prescriptions.md  ← Prescriptions, embedded medicine array
    ├── sprint-07-patient-history.md← Aggregation pipeline with $lookup
    ├── sprint-08-analytics.md      ← Dashboard, $group, $sum, recharts
    └── sprint-09-security.md       ← Audit logs, rate limiting, TTL index
```

## Copilot Prompts That Work Well

- `"Implement sprint 01 following the exact structure in COPILOT_START.md"`
- `"Create the Patient Mongoose model as defined in docs/database/schemas.md"`
- `"Write tests for the appointment controller as specified in sprint-05-appointments.md"`
- `"The conflict detection logic in sprint 05 — implement the service function exactly as written"`
