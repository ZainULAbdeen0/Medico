# Sprint 07 — Patient History (Aggregation Pipeline)

## Goal
Aggregate complete patient medical profile in a single query using MongoDB `$lookup` and `$unwind`.
This is the most academically important sprint — the aggregation pipeline is presentation gold.

---

## No new models required
This sprint is purely query/service logic.

---

## Backend Tasks

### 1. Service — `services/patientHistoryService.js`

This is the core of the sprint. Write and document every stage.

```js
export async function getFullPatientHistory(patientId) {
  const objectId = new mongoose.Types.ObjectId(patientId)

  const result = await Appointment.aggregate([

    // STAGE 1: Filter appointments for this patient
    {
      $match: { patientId: objectId }
    },

    // STAGE 2: Sort by most recent first
    {
      $sort: { appointmentDate: -1 }
    },

    // STAGE 3: Join prescriptions for each appointment
    {
      $lookup: {
        from: 'prescriptions',
        localField: '_id',
        foreignField: 'appointmentId',
        as: 'prescription'
      }
    },

    // STAGE 4: Unwind prescription array → each appointment has one or zero
    // preserveNullAndEmpty keeps appointments without prescriptions
    {
      $unwind: {
        path: '$prescription',
        preserveNullAndEmptyArrays: true
      }
    },

    // STAGE 5: Join doctor info
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },

    // STAGE 6: Join doctor's user info (name)
    {
      $lookup: {
        from: 'users',
        localField: 'doctor.userId',
        foreignField: '_id',
        as: 'doctorUser'
      }
    },
    { $unwind: { path: '$doctorUser', preserveNullAndEmptyArrays: true } },

    // STAGE 7: Shape the output — only return what frontend needs
    {
      $project: {
        appointmentDate: 1,
        status: 1,
        type: 1,
        notes: 1,
        doctorName: '$doctorUser.name',
        specialization: '$doctor.specialization',
        department: '$doctor.department',
        prescription: {
          _id: '$prescription._id',
          diagnosis: '$prescription.diagnosis',
          medicines: '$prescription.medicines',
          notes: '$prescription.notes',
          createdAt: '$prescription.createdAt'
        }
      }
    }
  ])

  return result
}
```

### 2. Patient Summary — `services/patientHistoryService.js`

Separate function for the summary header:

```js
export async function getPatientSummary(patientId) {
  const objectId = new mongoose.Types.ObjectId(patientId)

  const [patient, appointmentStats] = await Promise.all([
    Patient.findById(objectId).select('-__v'),
    Appointment.aggregate([
      { $match: { patientId: objectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ])

  return { patient, appointmentStats }
}
```

### 3. Controller — `controllers/patientHistoryController.js`

**`getPatientHistory`**
- Role: doctor, admin, receptionist
- Call both service functions in parallel with `Promise.all`
- Return combined response: `{ patient, appointmentStats, history }`

### 4. Routes
```
GET /api/patients/:patientId/history   → verifyToken, authorize(['doctor','admin','receptionist']), getPatientHistory
```

---

## Frontend Tasks

### 1. `services/historyService.js`
```js
export const getPatientHistory = (patientId) => api.get(`/patients/${patientId}/history`)
```

### 2. `pages/Patients/PatientHistory.jsx`

Layout sections:
- **Summary Card**: name, DOB, blood group, allergies (as badges)
- **Stats Row**: total appointments, completed, cancelled
- **Timeline**: vertically stacked appointment cards

Each appointment card shows:
- Date, doctor name, department, type, status
- If prescription exists: expandable section showing diagnosis + medicine table
- If no prescription: "No prescription" label

### 3. Link from `PatientDetail.jsx`
- "View Full History" button → navigates to `/patients/:id/history`

---

## Tests — `tests/patientHistory.test.js`

```js
describe('GET /api/patients/:id/history', () => {
  test('returns appointment history with embedded prescriptions')
  test('appointments without prescriptions still appear (preserveNullAndEmptyArrays)')
  test('returns 404 if patient does not exist')
  test('history sorted by appointmentDate descending')
})
```

---

## Documentation — `docs/database/patient-history.md`

Write an explanation of the aggregation pipeline covering:
1. Why `$lookup` instead of multiple separate queries
2. What `preserveNullAndEmptyArrays` does and why it matters here
3. How `$project` reduces data transfer
4. Index impact: why `patientId` index on appointments makes `$match` fast
5. Performance note: this pipeline runs on indexed fields only — no collection scan

---

## Acceptance Criteria

- [ ] Single aggregation query returns appointments + prescriptions in one response
- [ ] Appointments without prescriptions still included
- [ ] Doctor name resolved through double `$lookup` (doctors → users)
- [ ] Frontend timeline renders correctly with and without prescriptions
- [ ] `docs/database/patient-history.md` written with full pipeline explanation
- [ ] All tests pass
