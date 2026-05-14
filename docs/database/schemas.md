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
