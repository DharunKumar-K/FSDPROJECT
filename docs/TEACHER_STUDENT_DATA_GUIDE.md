# Teacher 81 & Student 31 - Data Access Guide

## Overview
Random dataset has been generated and inserted into the database for **Staff ID 81** and **Student ID 31**, along with 20 additional students, courses, sessions, attendance records, activities, and submissions.

## Database Summary

### Teacher ID 81
- **Name**: K DHARUNKUMAR
- **Email**: dharunkumar.k2024aids@sece.ac.in
- **Department**: AIDS
- **Password**: password123
- **Total Courses**: 5
- **Total Students**: 21

### Student ID 31
- **Name**: Priya Sharma
- **Email**: student31@college.edu
- **Register No**: 31
- **Department**: MECH
- **Year**: 2
- **Semester**: 8
- **Password**: password123
- **Enrolled Courses**: 5

### Generated Data
- **Students**: 21 (including student 31)
- **Courses**: 5 (CS300, CS301, CS302, CS303, CS304)
- **Sessions**: 30 (across all courses)
- **Attendance Records**: 562
- **Activities**: 15 (assignments, labs, presentations, projects)
- **Submissions**: 211

## API Endpoints for Teacher 81

### 1. Login
```http
POST /api/teacher/login
Content-Type: application/json

{
  "teacherId": "81",
  "password": "password123"
}
```

### 2. Get Teacher Dashboard
```http
GET /api/teacher/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "teacher": { ... },
  "totalCourses": 5,
  "totalStudents": 21,
  "courses": [
    {
      "_id": "...",
      "title": "Machine Learning 1",
      "code": "CS300",
      "enrolledCount": 21
    },
    ...
  ]
}
```

### 3. Get All Students
```http
GET /api/teacher/students
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Priya Sharma",
    "registerNo": "31",
    "email": "student31@college.edu",
    "department": "MECH",
    "year": "2",
    "semester": "8"
  },
  ...
]
```

### 4. Get Teacher Courses
```http
GET /api/courses
Authorization: Bearer <token>
```

## API Endpoints for Student 31

### 1. Login
```http
POST /api/student/login
Content-Type: application/json

{
  "registerNo": "31",
  "password": "password123"
}
```

### 2. Get Student Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer <token>
```

### 3. Get Student Attendance
```http
GET /api/attendance/student/:studentId
Authorization: Bearer <token>
```

### 4. Get Student Activities
```http
GET /api/activities
Authorization: Bearer <token>
```

## Testing Scripts

### Check Teacher 81 Data
```bash
cd server
node checkTeacher81.js
```

### Test Teacher 81 API
```bash
cd server
node testTeacher81API.js
```

### Regenerate Random Data
```bash
cd server
node seedRandomData.js
```

## Sample JWT Token for Teacher 81
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDY5NDg3YzI3ZTlmZDcyYWM2NTg1MCIsInJvbGUiOiJ0ZWFjaGVyIiwidGVhY2hlcklkIjoiODEiLCJpYXQiOjE3NzgwODY3MzMsImV4cCI6MTc3ODY5MTUzM30.5CbkSPye1hXcnvgiQ2brqz0H9vHe7HvCdd1LJNcz-wg
```
*Note: This token expires after 7 days. Generate a new one by logging in.*

## Frontend Access

### Teacher Login
1. Navigate to `/teacher/login`
2. Enter Teacher ID: `81`
3. Enter Password: `password123`
4. Access dashboard to view all 21 students

### Student Login
1. Navigate to `/student/login`
2. Enter Register No: `31`
3. Enter Password: `password123`
4. Access dashboard to view attendance, activities, and submissions

## Data Relationships

```
Teacher 81
├── Course: CS300 (Machine Learning 1)
│   └── 21 Students enrolled
├── Course: CS301 (Operating Systems 2)
│   └── 21 Students enrolled
├── Course: CS302 (Machine Learning 3)
│   └── 21 Students enrolled
├── Course: CS303 (Operating Systems 4)
│   └── 21 Students enrolled
└── Course: CS304 (Computer Networks 5)
    └── 21 Students enrolled

Student 31 (Priya Sharma)
├── Enrolled in 5 courses
├── Attendance records across 30 sessions
├── Activity submissions
└── Performance metrics
```

## Troubleshooting

### Issue: No students showing for Teacher 81
**Solution**: The data is there! Use the new endpoints:
- `/api/teacher/dashboard` - Shows total students and courses
- `/api/teacher/students` - Lists all students

### Issue: Cannot login
**Solution**: 
- Teacher ID: `81` (not email)
- Student Register No: `31` (not email)
- Password: `password123`

### Issue: Token expired
**Solution**: Login again to get a new JWT token

## Files Created
- `server/seedRandomData.js` - Script to generate random data
- `server/checkTeacher81.js` - Script to verify teacher 81 data
- `server/testTeacher81API.js` - Script to test API endpoints
- `TEACHER_STUDENT_DATA_GUIDE.md` - This documentation

## Next Steps
1. Restart your server if it's running
2. Login as Teacher 81 to see all students
3. Login as Student 31 to see attendance and activities
4. Use the new API endpoints in your frontend
