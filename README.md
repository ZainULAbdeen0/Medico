# Smart Hospital Management System

Database-centric hospital management system for an academic DBMS project. The focus is on MongoDB schema design, relationships, indexing, and aggregation pipelines.

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in `backend/` with:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```