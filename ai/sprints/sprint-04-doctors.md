# Sprint 04 — Doctor Management + Scheduling

## Goal
Admin creates doctor profiles linked to user accounts. Assign weekly schedules.

---

## Database

### Model: `models/Doctor.js`
Fields: per `docs/database/schemas.md` — doctors collection.
- `userId` refs `User` — required, unique
- Index: `userId`, `department`

### Model: `models/Schedule.js`
Fields: per `docs/database/schemas.md` — schedules collection.
- `doctorId` refs `Doctor`
- Index: `doctorId`

---

## Backend Tasks

### 1. Validators
**`validators/doctorValidators.js`**
```js
createDoctorSchema  // userId(ObjectId), specialization, department, qualifications?, bio?
updateDoctorSchema  // all optional
```

**`validators/scheduleValidators.js`**
```js
createScheduleSchema  // doctorId(ObjectId), day(enum), startTime, endTime
```

### 2. Doctor Controller — `controllers/doctorController.js`

**`createDoctor`**
- Role: admin
- Verify `userId` exists in users collection and has role `'doctor'`
- Return 409 if doctor profile already exists for that userId
- Create doctor profile

**`getDoctors`**
- Role: all authenticated
- Support `?department=` filter
- Populate `userId` → return name and email from users

**`getDoctor`**
- Populate userId, return full profile

**`updateDoctor`**
- Role: admin

**`getDoctorSchedule`**
- Return all schedules for a doctorId
- Used by receptionist when booking appointments

### 3. Schedule Controller — `controllers/scheduleController.js`

**`setSchedule`**
- Role: admin
- Check if schedule already exists for that `doctorId + day` combo
- Upsert: `findOneAndUpdate({ doctorId, day }, data, { upsert: true, new: true })`

**`getScheduleByDoctor`**
- Return all 7 days (or however many are set) for a doctor

### 4. Routes
```
# Doctors
POST   /api/doctors           → verifyToken, authorize(['admin']), createDoctor
GET    /api/doctors           → verifyToken, getDoctors
GET    /api/doctors/:id       → verifyToken, getDoctor
PUT    /api/doctors/:id       → verifyToken, authorize(['admin']), updateDoctor
GET    /api/doctors/:id/schedule → verifyToken, getDoctorSchedule

# Schedules
POST   /api/schedules         → verifyToken, authorize(['admin']), setSchedule
GET    /api/schedules/:doctorId → verifyToken, getScheduleByDoctor
```

---

## Frontend Tasks

### 1. `services/doctorService.js`
```js
getDoctors, getDoctor, createDoctor, updateDoctor, getDoctorSchedule, setSchedule
```

### 2. `pages/Doctors/DoctorList.jsx`
- Table: Name, Specialization, Department, Actions
- Filter by department dropdown
- "Add Doctor" button (admin only)

### 3. `pages/Doctors/DoctorForm.jsx`
- Select existing user (role=doctor) from dropdown
- Fields: specialization, department, qualifications (tag-style input), bio

### 4. `pages/Doctors/ScheduleManager.jsx`
- 7-row table (Mon–Sun)
- Each row: day, startTime input, endTime input, active toggle
- Save button calls `setSchedule` for each modified day

---

## Tests — `tests/doctors.test.js`

```js
describe('POST /api/doctors', () => {
  test('admin creates doctor profile → 201')
  test('returns 409 if doctor profile already exists for userId')
  test('returns 400 if userId is not a doctor role user')
  test('non-admin gets 403')
})

describe('POST /api/schedules', () => {
  test('creates schedule for valid doctorId and day')
  test('upserts if schedule already exists for that day')
})
```

---

## Acceptance Criteria

- [ ] Doctor profile links to user via `userId` (verify ref in Atlas)
- [ ] `getDoctors` returns populated name/email from users collection
- [ ] Schedule upsert works — re-saving Monday replaces existing, not duplicates
- [ ] Department filter returns correct subset
- [ ] All tests pass
