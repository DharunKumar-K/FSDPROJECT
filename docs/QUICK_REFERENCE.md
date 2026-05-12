# Quick Reference Guide - Smart Attendance System

## 🚀 Quick Start

### For Admins
1. Login with admin credentials
2. Navigate to `/students` to access Admin Dashboard
3. View, search, filter, and manage students
4. Click on any student to view detailed profile
5. Monitor attendance and delete students if needed

### For Students
1. Login with student credentials
2. Dashboard shows:
   - Real attendance percentage
   - Pending activities
   - Recent sessions
   - Attendance alerts (if < 75%)
3. Click "Mark Attendance" to check-in
4. Click "My Activities" to submit work
5. View curriculum for course content

### For Teachers
1. Login with teacher credentials
2. Dashboard shows overview
3. Click "Launch Session" to create attendance session
4. Click "Manage Activities" to create assignments
5. Click "View Curriculum" to manage course content

---

## 📋 Feature Matrix

| Feature | Admin | Student | Teacher |
|---------|-------|---------|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Students | ✅ | ❌ | ❌ |
| View All Students | ✅ | ❌ | ✅ |
| Delete Students | ✅ | ❌ | ❌ |
| Mark Attendance | ❌ | ✅ | ❌ |
| Create Sessions | ❌ | ❌ | ✅ |
| View Attendance | ✅ | ✅ (own) | ✅ |
| Create Activities | ❌ | ❌ | ✅ |
| Submit Activities | ❌ | ✅ | ❌ |
| Manage Curriculum | ❌ | ❌ | ✅ |
| View Curriculum | ✅ | ✅ | ✅ |
| Get Alerts | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ (own) | ✅ |

---

## 🔑 API Endpoints Reference

### Authentication
```
POST /api/register              - Student registration
POST /api/login                 - Student login
POST /api/teacher/register      - Teacher registration
POST /api/teacher/login         - Teacher login
POST /api/admin/register        - Admin registration
POST /api/admin/login           - Admin login
```

### Students (Admin/Teacher)
```
GET    /api/students            - Get all students
GET    /api/student/:registerNo - Get student by register number
DELETE /api/student/:studentId  - Delete student (admin only)
```

### Teachers (Admin)
```
GET /api/teachers               - Get all teachers
GET /api/courses                - Get teacher courses
```

### Attendance
```
POST /api/markAttendance        - Mark attendance (student)
GET  /api/attendance/:studentId - Get student attendance
GET  /api/attendance-stats/:id  - Get attendance statistics
```

### Sessions
```
POST /api/sessions              - Create session (teacher)
GET  /api/sessions              - Get active sessions
```

### Activities
```
POST /api/addActivity           - Create activity (teacher)
POST /api/submitActivity        - Submit activity (student)
GET  /api/activities            - Get all activities
```

### Curriculum
```
POST /api/curriculum            - Create curriculum
GET  /api/curriculum            - Get curriculum
POST /api/curriculum/add-unit   - Add curriculum unit
PUT  /api/curriculum/unit       - Update unit progress
```

---

## 🎨 Color Codes

### Attendance Status
- 🟢 **Green** (≥75%) - Safe, good attendance
- 🟡 **Yellow** (60-74%) - Warning, needs improvement
- 🔴 **Red** (<60%) - Critical, immediate action needed

### Activity Status
- 🟣 **Purple** - Pending, on time
- 🔴 **Red** - Overdue, late submission
- 🟢 **Green** - Completed

### User Roles
- 🔵 **Blue** - Student
- 🟣 **Purple** - Teacher
- 🟢 **Green** - Admin

---

## 📊 Dashboard Metrics Explained

### Student Dashboard
- **Total Classes**: Number of sessions attended + missed
- **Attendance Rate**: (Present / Total) × 100
- **Pending Tasks**: Activities with future deadlines
- **Completed**: Activities past deadline

### Admin Dashboard
- **Total Students**: Count of all registered students
- **Total Teachers**: Count of all registered teachers
- **Departments**: Unique departments count
- **Low Attendance**: Students with < 75% attendance

---

## ⚠️ Common Issues & Solutions

### Issue: Can't login
**Solution**: 
- Check credentials
- Ensure correct role selected
- Verify account exists

### Issue: Attendance not showing
**Solution**:
- Ensure you've marked attendance
- Check if sessions exist
- Refresh the page

### Issue: Can't submit activity
**Solution**:
- Check if activity exists
- Verify deadline hasn't passed
- Fill all required fields

### Issue: Admin can't see students
**Solution**:
- Verify admin role
- Check if students are registered
- Ensure proper authentication

---

## 🔒 Security Best Practices

### For All Users
1. Use strong passwords (8+ characters, mixed case, numbers, symbols)
2. Don't share credentials
3. Logout after use
4. Report suspicious activity

### For Admins
1. Regularly review user accounts
2. Monitor low attendance students
3. Backup data regularly
4. Keep system updated

---

## 📱 Mobile Usage Tips

1. Use landscape mode for tables
2. Tap and hold for more options
3. Swipe to navigate
4. Use search instead of scrolling
5. Bookmark frequently used pages

---

## 🎯 Best Practices

### For Students
- ✅ Mark attendance daily
- ✅ Submit activities before deadline
- ✅ Check dashboard regularly
- ✅ Monitor attendance percentage
- ✅ Act on warnings immediately

### For Teachers
- ✅ Create sessions on time
- ✅ Set realistic deadlines
- ✅ Update curriculum regularly
- ✅ Monitor student progress
- ✅ Provide clear instructions

### For Admins
- ✅ Review data weekly
- ✅ Address low attendance
- ✅ Keep records updated
- ✅ Monitor system health
- ✅ Backup data regularly

---

## 🆘 Support

### Getting Help
1. Check this guide first
2. Review error messages
3. Check browser console (F12)
4. Contact system administrator
5. Report bugs with screenshots

### Reporting Issues
Include:
- User role (Admin/Student/Teacher)
- What you were trying to do
- Error message (if any)
- Screenshot
- Browser and device info

---

## 📞 Contact Information

**System Administrator**: [Your Email]
**Technical Support**: [Support Email]
**Emergency Contact**: [Phone Number]

---

## 🔄 Update Log

### Version 2.0.0 (Current)
- ✅ Complete admin dashboard
- ✅ Real-time data integration
- ✅ Enhanced student dashboard
- ✅ Improved activity management
- ✅ Better attendance tracking
- ✅ Advanced search and filters
- ✅ Data visualizations
- ✅ Mobile responsive design

### Version 1.0.0
- Basic authentication
- Simple attendance marking
- Basic dashboard
- Curriculum viewing

---

## 🎓 Training Resources

### Video Tutorials
- Admin Dashboard Tour (5 min)
- Student Guide (3 min)
- Teacher Tools (4 min)
- Attendance Marking (2 min)
- Activity Submission (3 min)

### Documentation
- User Manual (PDF)
- API Documentation
- Developer Guide
- Troubleshooting Guide

---

## ✅ Checklist for First-Time Users

### Students
- [ ] Login successfully
- [ ] View dashboard
- [ ] Check attendance percentage
- [ ] View upcoming activities
- [ ] Mark attendance once
- [ ] Submit one activity
- [ ] View curriculum

### Teachers
- [ ] Login successfully
- [ ] Create one session
- [ ] Generate QR code
- [ ] Create one activity
- [ ] Add curriculum unit
- [ ] View student list

### Admins
- [ ] Login successfully
- [ ] View all students
- [ ] Search for a student
- [ ] View student details
- [ ] Check attendance data
- [ ] View department chart

---

**Last Updated**: 2024
**Version**: 2.0.0
**Status**: Production Ready ✅
