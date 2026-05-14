# Sprint 03 — Patient Management

## Goal
Receptionists can create, edit, and search patients. Doctors can view (read-only).

---

## Database

### Model: `models/Patient.js`
Fields: per `docs/database/schemas.md` — patients collection.

Key notes:
- `contacts` is an embedded document (not a ref)
- `allergies` is `[String]` array
- Add text index on `name` for search:
  ```js
  PatientSchema.index({ name: 'text', 'contacts.phone': 1 })
  ```
- `registeredBy` refs `User`

---

## Backend Tasks

### 1. Validators — `validators/patientValidators.js`
```js
createPatientSchema // name, dob, gender, bloodGroup, allergies?, contacts
updatePatientSchema // all fields optional (partial update)
```

### 2. Controller — `controllers/patientController.js`

**`createPatient`**
- Role: receptionist, admin
- Set `registeredBy: req.user.userId`
- Return created patient

**`getPatients`**
- Role: all authenticated
- Support query params: `?search=name&page=1&limit=20`
- If `search` provided: use MongoDB text search `{ $text: { $search: req.query.search } }`
- Return paginated result: `{ patients, total, page, totalPages }`

**`getPatient`**
- Role: all authenticated
- Return single patient by `:id`
- Return 404 if not found

**`updatePatient`**
- Role: receptionist, admin
- Use `findByIdAndUpdate` with `{ new: true, runValidators: true }`

**`deletePatient`**
- Role: admin only
- Soft delete: set `isActive: false`, don't remove document

### 3. Routes — `routes/patientRoutes.js`
```
POST   /api/patients          → verifyToken, authorize(['receptionist','admin']), validate, createPatient
GET    /api/patients          → verifyToken, getPatients
GET    /api/patients/:id      → verifyToken, getPatient
PUT    /api/patients/:id      → verifyToken, authorize(['receptionist','admin']), validate, updatePatient
DELETE /api/patients/:id      → verifyToken, authorize(['admin']), deletePatient
```

---

## Frontend Tasks

### 1. `services/patientService.js`
```js
export const getPatients = (params) => api.get('/patients', { params })
export const getPatient = (id) => api.get(`/patients/${id}`)
export const createPatient = (data) => api.post('/patients', data)
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data)
```

### 2. `hooks/usePatients.js`
- Wraps `getPatients` with loading/error state
- Accepts `search` and `page` params
- Re-fetches when params change

### 3. `pages/Patients/PatientList.jsx`
- Search input (debounced 300ms)
- Table: Name, DOB, Blood Group, Phone, Actions
- Pagination controls
- "Add Patient" button (receptionist/admin only — check role)

### 4. `pages/Patients/PatientForm.jsx`
- React Hook Form + Zod
- Fields: name, dob, gender, bloodGroup, allergies (comma-separated → split to array), phone, emergency
- Used for both create and edit (pass `patient` prop for edit mode)

### 5. `pages/Patients/PatientDetail.jsx`
- Display all patient info
- Show allergies as badge list
- Link to appointment history (stub for now)

---

## Tests — `tests/patients.test.js`

```js
describe('POST /api/patients', () => {
  test('receptionist can create patient → 201')
  test('doctor cannot create patient → 403')
  test('returns 400 on missing required fields')
})

describe('GET /api/patients', () => {
  test('returns paginated list')
  test('search by name works')
})

describe('PUT /api/patients/:id', () => {
  test('updates and returns new doc')
  test('returns 404 on invalid id')
})
```

---

## Acceptance Criteria

- [ ] Create patient saves embedded contacts correctly (verify in Atlas)
- [ ] Text search works on name
- [ ] Pagination returns correct `total` and `totalPages`
- [ ] Doctor gets 403 on POST
- [ ] Admin soft-delete sets `isActive: false` (not removed from DB)
- [ ] Form validates all fields before submit
- [ ] All tests pass
