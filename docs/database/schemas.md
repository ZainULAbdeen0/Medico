# Database Schemas (Project)

## Users

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**
- `email` — unique

## Doctors

```js
{
  _id: ObjectId,
  userId: ObjectId,
  specialization: String,
  department: String,
  qualifications: [String],
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**
- `userId` — unique
- `department`

## Schedules

```js
{
  _id: ObjectId,
  doctorId: ObjectId,
  day: String,
  startTime: String,
  endTime: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**
- `doctorId`
- `{ doctorId: 1, day: 1 }` — unique
