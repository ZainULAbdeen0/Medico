# MongoDB Schema Reference

## Design Decisions Summary

| Decision | When Used | Reason |
|---|---|---|
| Embedded document | Data always fetched with parent, belongs only to parent | Faster reads, fewer queries |
| Reference (ObjectId) | Data has independent lifecycle, shared across collections | Avoid duplication, easier updates |
| Array of embedded docs | Small list of sub-items per document | Prescriptions → medicines, Patient → allergies |

---

## Collection: `users`

```js
{
  _id: ObjectId,
  name: String,           // required
  email: String,          // required, unique, indexed
  password: String,       // bcrypt hashed, never returned in queries
  role: String,           // enum: ['admin', 'doctor', 'receptionist', 'patient']
  isActive: Boolean,      // default: true — soft disable accounts
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` — unique index (fast login lookup, uniqueness enforcement)

**Notes:**
- This is the auth collection only. Doctor-specific data lives in `doctors`
- `role` drives all authorization decisions via middleware

---

## Collection: `doctors`

```js
{
  _id: ObjectId,
  userId: ObjectId,         // ref: users — linked auth account
  specialization: String,   // e.g., "Cardiologist"
  department: String,       // e.g., "Cardiology"
  qualifications: [String], // embedded array — simple, always fetched with doctor
  bio: String,
  createdAt: Date
}
```

**Indexes:**
- `userId` — for joining with users
- `department` — for filtering by department

**Why reference `users`?**
Doctor profile and auth account have separate concerns. Keeps `users` collection clean for auth logic.

---

## Collection: `schedules`

```js
{
  _id: ObjectId,
  doctorId: ObjectId,   // ref: doctors
  day: String,          // enum: ['Monday'...'Sunday']
  startTime: String,    // "09:00"
  endTime: String,      // "17:00"
  isActive: Boolean
}
```

**Indexes:**
- `doctorId` — for fetching doctor's full schedule

**Why separate collection?**
Schedules can be reused, updated independently, and queried without loading doctor data.

---

## Collection: `patients`

```js
{
  _id: ObjectId,
  name: String,
  dob: Date,
  gender: String,          // enum: ['male', 'female', 'other']
  bloodGroup: String,      // enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  allergies: [String],     // embedded array — simple string list
  contacts: {              // embedded document — always fetched with patient
    phone: String,
    emergency: String,
    address: String
  },
  registeredBy: ObjectId,  // ref: users (receptionist who created)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` — text index for search
- `contacts.phone` — for lookup by phone

**Why embed `contacts`?**
Always fetched with the patient. No independent lifecycle. Embedding avoids a join.

---

## Collection: `appointments`

```js
{
  _id: ObjectId,
  patientId: ObjectId,      // ref: patients
  doctorId: ObjectId,       // ref: doctors
  appointmentDate: Date,    // full datetime
  status: String,           // enum: ['pending', 'confirmed', 'completed', 'cancelled']
  type: String,             // enum: ['general', 'follow-up', 'emergency']
  notes: String,            // receptionist notes
  createdBy: ObjectId,      // ref: users
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound: `{ doctorId: 1, appointmentDate: 1 }` — fast availability queries, conflict detection
- `patientId` — for patient history lookup
- `status` — for filtered dashboard queries

**Key Relationship:**
- One patient → many appointments
- One doctor → many appointments
- One appointment → one prescription (in prescriptions collection)

---

## Collection: `prescriptions`

```js
{
  _id: ObjectId,
  appointmentId: ObjectId,  // ref: appointments — 1:1 link
  patientId: ObjectId,      // ref: patients — for direct history queries
  doctorId: ObjectId,       // ref: doctors
  medicines: [              // embedded array of objects
    {
      name: String,
      dosage: String,         // "500mg"
      frequency: String,      // "2x daily"
      duration: String        // "7 days"
    }
  ],
  diagnosis: String,
  notes: String,
  createdAt: Date
}
```

**Indexes:**
- `patientId` — for patient prescription history
- `appointmentId` — unique, enforces one prescription per appointment

**Why embed `medicines`?**
Medicines belong entirely to this prescription. Never queried independently. Embedding is the correct choice.

---

## Collection: `auditLogs`

```js
{
  _id: ObjectId,
  userId: ObjectId,     // who performed the action
  action: String,       // e.g., "CREATE_PATIENT", "DELETE_APPOINTMENT"
  resource: String,     // collection name
  resourceId: ObjectId, // affected document
  ipAddress: String,
  timestamp: Date
}
```

**Indexes:**
- `userId` — user activity lookup
- `timestamp` — time-range queries
- TTL index on `timestamp` (expire after 90 days) — auto-cleanup

---

## Relationship Map

```
users (1)
  └── doctors (1)       [userId ref]
        └── schedules (many)    [doctorId ref]
        └── appointments (many) [doctorId ref]
              └── prescriptions (1)  [appointmentId ref]

patients (1)
  └── appointments (many) [patientId ref]
  └── prescriptions (many) [patientId ref]
```
