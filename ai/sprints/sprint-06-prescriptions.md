# Sprint 06 — E-Prescriptions

## Goal
Doctor creates a prescription tied to an appointment. Medicines stored as embedded array.

---

## Database

### Model: `models/Prescription.js`
Fields: per `docs/database/schemas.md` — prescriptions collection.

```js
// Unique index — one prescription per appointment
PrescriptionSchema.index({ appointmentId: 1 }, { unique: true })
PrescriptionSchema.index({ patientId: 1 })
```

**Medicine sub-schema (embedded):**
```js
{
  name: { type: String, required: true },
  dosage: { type: String, required: true },     // "500mg"
  frequency: { type: String, required: true },  // "2x daily"
  duration: { type: String, required: true }    // "7 days"
}
```

---

## Backend Tasks

### 1. Validator — `validators/prescriptionValidators.js`
```js
createPrescriptionSchema: {
  appointmentId: ObjectId string,
  patientId: ObjectId string,
  medicines: z.array(z.object({
    name: string min(1),
    dosage: string,
    frequency: string,
    duration: string
  })).min(1),
  diagnosis: string,
  notes: optional string
}
```

### 2. Controller — `controllers/prescriptionController.js`

**`createPrescription`**
- Role: doctor only
- Verify appointment exists and `appointment.doctorId` matches the requesting doctor's profile
  - Prevent doctors from writing prescriptions for other doctors' appointments
- Check no prescription already exists for this `appointmentId` (409 if exists)
- Set `doctorId` from doctor profile (don't trust req.body for this)
- After create: update `appointment.status` to `'completed'`

**`getPrescription`**
- By appointmentId or prescriptionId
- Populate: patientId (name), doctorId → userId (name)

**`getPatientPrescriptions`**
- Role: doctor, admin, receptionist
- `GET /patients/:patientId/prescriptions`
- Return all prescriptions for a patient, sorted by `createdAt` desc
- Useful for patient history view

**`updatePrescription`**
- Role: doctor only
- Only allow update if prescription was created in last 24 hours
- Can update medicines array and notes

### 3. Routes
```
POST  /api/prescriptions                        → verifyToken, authorize(['doctor']), createPrescription
GET   /api/prescriptions/:id                    → verifyToken, getPrescription
PUT   /api/prescriptions/:id                    → verifyToken, authorize(['doctor']), updatePrescription
GET   /api/patients/:patientId/prescriptions    → verifyToken, getPatientPrescriptions
```

---

## Frontend Tasks

### 1. `services/prescriptionService.js`
```js
createPrescription, getPrescription, updatePrescription, getPatientPrescriptions
```

### 2. `pages/Prescriptions/PrescriptionForm.jsx`
- Only shown to doctors, from appointment detail page
- Dynamic medicines list: add/remove medicine rows
- Fields per medicine: name, dosage, frequency, duration
- Diagnosis textarea
- Notes textarea
- Submit calls `createPrescription`

### 3. `pages/Prescriptions/PrescriptionView.jsx`
- Clean prescription display (print-friendly layout)
- Show doctor name, patient name, date
- Medicine table
- Diagnosis and notes section
- "Print" button → `window.print()`

### 4. Update `AppointmentDetail.jsx`
- If appointment status is `confirmed` and user is doctor: show "Write Prescription" button
- If prescription exists: show "View Prescription" link

---

## Tests — `tests/prescriptions.test.js`

```js
describe('POST /api/prescriptions', () => {
  test('doctor creates prescription → 201')
  test('returns 409 if prescription already exists for appointment')
  test('returns 403 if doctor tries to prescribe for another doctor\'s appointment')
  test('receptionist gets 403')
})

describe('GET /api/patients/:id/prescriptions', () => {
  test('returns all prescriptions for patient sorted by date')
})
```

---

## Acceptance Criteria

- [ ] Medicines saved as embedded array in prescription document (verify in Atlas)
- [ ] Unique index on `appointmentId` prevents duplicate prescriptions
- [ ] Appointment status updates to `completed` on prescription creation
- [ ] Doctor cannot prescribe for another doctor's appointment
- [ ] Medicine rows can be dynamically added/removed in form
- [ ] All tests pass
