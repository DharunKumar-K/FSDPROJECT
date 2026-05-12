# Smart Attendance System

A full-stack attendance management system with React frontend and Node.js/Express backend.

## Project Structure

```
smart-attendance-system/
├── frontend/   # React app
└── server/     # Node.js + Express + MongoDB API
```

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

---

## Local Setup

### Backend

```bash
cd server
cp .env.example .env
# Edit .env and fill in your values
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables (server/.env)

| Variable       | Description                          | Example                              |
|----------------|--------------------------------------|--------------------------------------|
| `PORT`         | Port the server runs on              | `5000`                               |
| `MONGODB_URI`  | MongoDB connection string            | `mongodb://127.0.0.1:27017/attendanceDB` |
| `JWT_SECRET`   | Strong secret for signing JWT tokens | `your_strong_secret_here`            |
| `CLIENT_URL`   | Frontend URL (for CORS)              | `http://localhost:3000`              |

> **Never commit your `.env` file. It is already in `.gitignore`.**

---

## Deployment

### Backend (e.g. Render / Railway)

1. Push code to GitHub
2. Create a new Web Service pointing to the `server/` folder
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env.example` in the dashboard
6. Set `CLIENT_URL` to your deployed frontend URL

### Frontend (e.g. Vercel / Netlify)

1. Create a new project pointing to the `frontend/` folder
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Update `frontend/package.json` proxy or set `REACT_APP_API_URL` to your deployed backend URL

---

## API Endpoints

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | /api/register               | Register student         | No       |
| POST   | /api/login                  | Student login            | No       |
| POST   | /api/teacher/register       | Register teacher         | No       |
| POST   | /api/teacher/login          | Teacher login            | No       |
| POST   | /api/admin/register         | Register admin           | No       |
| POST   | /api/admin/login            | Admin login              | No       |
| GET    | /api/students               | List students            | Yes      |
| POST   | /api/markAttendance         | Mark attendance          | Yes      |
| POST   | /api/mark-bulk-attendance   | Bulk mark attendance     | Yes      |
| POST   | /api/bulk-import-students   | Import students via CSV  | Yes      |
