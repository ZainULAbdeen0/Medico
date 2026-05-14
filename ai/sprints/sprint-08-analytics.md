# Sprint 08 — Analytics Dashboard

## Goal
Admin dashboard with real MongoDB aggregation pipelines for charts. No fake data.

---

## No new models required.

---

## Backend Tasks

### 1. Service — `services/analyticsService.js`

**`getAppointmentsByMonth`**
```js
// Returns appointment count per month for the current year
Appointment.aggregate([
  {
    $match: {
      appointmentDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    }
  },
  {
    $group: {
      _id: { $month: '$appointmentDate' },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id': 1 } }
])
```

**`getBusiestDoctors`**
```js
// Returns top 5 doctors by completed appointment count
Appointment.aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: '$doctorId',
      totalAppointments: { $sum: 1 }
    }
  },
  { $sort: { totalAppointments: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: 'doctors',
      localField: '_id',
      foreignField: '_id',
      as: 'doctor'
    }
  },
  { $unwind: '$doctor' },
  {
    $lookup: {
      from: 'users',
      localField: 'doctor.userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  { $unwind: '$user' },
  {
    $project: {
      doctorName: '$user.name',
      specialization: '$doctor.specialization',
      totalAppointments: 1
    }
  }
])
```

**`getStatusBreakdown`**
```js
// Count appointments by status
Appointment.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
])
```

**`getSummaryStats`**
```js
// Run all counts in parallel
const [totalPatients, totalDoctors, todayAppointments, pendingAppointments] = await Promise.all([
  Patient.countDocuments({ isActive: true }),
  Doctor.countDocuments(),
  Appointment.countDocuments({
    appointmentDate: {
      $gte: startOfToday,
      $lte: endOfToday
    }
  }),
  Appointment.countDocuments({ status: 'pending' })
])
```

### 2. Controller — `controllers/analyticsController.js`

**`getDashboardData`**
- Role: admin
- Call all four service functions in parallel with `Promise.all`
- Return combined response

**`getAppointmentTrend`**
- Role: admin
- Returns monthly trend data

### 3. Routes
```
GET /api/analytics/dashboard  → verifyToken, authorize(['admin']), getDashboardData
GET /api/analytics/trend      → verifyToken, authorize(['admin']), getAppointmentTrend
```

---

## Frontend Tasks

### Tech note
Use `recharts` for all charts — it's React-native, no Canvas issues.
```bash
npm install recharts
```

### 1. `services/analyticsService.js`
```js
export const getDashboardData = () => api.get('/analytics/dashboard')
```

### 2. `pages/Dashboard.jsx` — rebuild with real data

**Layout:**
```
[Stat Card] [Stat Card] [Stat Card] [Stat Card]
[Bar Chart: Appointments/Month          ] [Pie: Status]
[Table: Busiest Doctors                            ]
```

**Stat Cards:** Total Patients, Total Doctors, Today's Appointments, Pending

**Bar Chart** (`BarChart` from recharts):
- X axis: month names
- Y axis: count
- Data: `appointmentsByMonth`

**Pie Chart** (`PieChart` from recharts):
- Segments: pending, confirmed, completed, cancelled
- Use neutral colors — no rainbow

**Busiest Doctors Table:**
- Rank, Doctor Name, Specialization, Total Completed

### 3. `components/StatCard.jsx`
```jsx
// Props: title, value, icon (optional), subtitle
// Clean card — white bg, border, no shadows
```

---

## Tests — `tests/analytics.test.js`

```js
describe('GET /api/analytics/dashboard', () => {
  test('admin gets dashboard data with all four fields')
  test('non-admin gets 403')
  test('monthly trend returns 12 months of data (0 for empty months)')
})
```

---

## Acceptance Criteria

- [ ] All aggregations use real DB data, no hardcoded values
- [ ] Monthly chart shows 0 for months with no appointments (handle sparse results)
- [ ] Busiest doctors correctly linked through double lookup
- [ ] Non-admin route returns 403
- [ ] Charts render without errors on empty data
- [ ] All tests pass
