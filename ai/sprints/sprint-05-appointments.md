# Sprint 05 — Appointment System

## Goal
Receptionists book appointments. Doctors view their own. Conflict detection via compound index.

---

## Database

### Model: `models/Appointment.js`
Fields: per `docs/database/schemas.md` — appointments collection.

Critical indexes:
```js
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 })
AppointmentSchema.index({ patientId: 1 })
AppointmentSchema.index({ status: 1 })
```

---

## Backend Tasks

### 1. Validator — `validators/appointmentValidators.js`
```js
createAppointmentSchema: {
  patientId: ObjectId string,
  doctorId: ObjectId string,
  appointmentDate: z.coerce.date(),   // coerce ISO string to Date
  type: enum(['general','follow-up','emergency']),
  notes: optional string
}
```

### 2. Conflict Detection — `services/appointmentService.js`

```js
export async function checkConflict(doctorId, appointmentDate) {
  // Define a 30-minute window around the requested time
  const windowStart = new Date(appointmentDate.getTime() - 30 * 60000)
  const windowEnd   = new Date(appointmentDate.getTime() + 30 * 60000)

  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate: { $gte: windowStart, $lte: windowEnd },
    status: { $nin: ['cancelled'] }
  })

  return !!conflict
}
```

This uses the compound index `{ doctorId, appointmentDate }` — explain this to professor.

### 3. Controller — `controllers/appointmentController.js`

**`createAppointment`**
- Role: receptionist, admin
- Call `checkConflict` — return 409 if true
- Verify patient and doctor exist (return 404 if either missing)
- Set `createdBy: req.user.userId`
- Set initial `status: 'pending'`

**`getAppointments`**
- Role: admin, receptionist → all appointments (support `?doctorId=`, `?patientId=`, `?status=`, `?date=`)
- Role: doctor → only `doctorId === req.user's doctor profile`
- Populate: patientId (name, bloodGroup), doctorId (specialization + userId.name)

**`getAppointment`**
- Return single with full population

**`updateStatus`**
- Role: doctor (confirm/complete), receptionist/admin (cancel)
- `PATCH /appointments/:id/status` with body `{ status }`
- Validate status transition logic:
  ```
  pending → confirmed (doctor)
  confirmed → completed (doctor)
  pending|confirmed → cancelled (receptionist, admin)
  ```

### 4. Routes
```
POST  /api/appointments              → verifyToken, authorize(['receptionist','admin']), createAppointment
GET   /api/appointments              → verifyToken, getAppointments
GET   /api/appointments/:id          → verifyToken, getAppointment
PATCH /api/appointments/:id/status   → verifyToken, updateStatus
```

---

## Frontend Tasks

### 1. `services/appointmentService.js`
All CRUD methods + `updateStatus(id, status)`.

### 2. `pages/Appointments/AppointmentList.jsx`
- Filters: by date, status, doctor (admin/receptionist view)
- Doctor view: only their appointments
- Table: Patient, Date/Time, Type, Status, Actions
- Status badge with color coding

### 3. `pages/Appointments/BookAppointment.jsx`
- Step 1: Select patient (searchable dropdown calling patient API)
- Step 2: Select doctor (dropdown filtered by department)
- Step 3: Select date + time (check available slots by calling `getDoctorSchedule`)
- Step 4: Confirm — show conflict error if returned

### 4. `pages/Appointments/AppointmentDetail.jsx`
- Show full info
- Status update buttons based on role
- Link to prescription (sprint 6)

---

## Tests — `tests/appointments.test.js`

```js
describe('POST /api/appointments', () => {
  test('creates appointment → 201')
  test('returns 409 when doctor has conflict in 30min window')
  test('returns 404 when patient does not exist')
  test('doctor role gets 403')
})

describe('PATCH /api/appointments/:id/status', () => {
  test('doctor can confirm pending appointment')
  test('receptionist can cancel confirmed appointment')
  test('invalid status transition returns 400')
})
```

---

## Acceptance Criteria

- [ ] Compound index `{ doctorId, appointmentDate }` exists in Atlas (verify with `getIndexes()`)
- [ ] Booking same doctor within 30 mins returns 409
- [ ] Doctor only sees their own appointments
- [ ] Population returns patient name and doctor name (not just ObjectIds)
- [ ] Status transitions are enforced
- [ ] All tests pass
