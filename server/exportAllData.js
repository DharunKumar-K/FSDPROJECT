const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Activity = require('./models/Activity');
const Attendance = require('./models/Attendance');
const Submission = require('./models/Submission');
const fs = require('fs');
const path = require('path');
const connectOptionalMongo = require('./config/connectOptionalMongo');
require('dotenv').config();

function arrayToCSV(data, headers) {
    const headerRow = headers.join(',');
    const rows = data.map(row => {
        return headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) value = '';
            if (typeof value === 'object') value = JSON.stringify(value);
            value = String(value).replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',');
    });
    return headerRow + '\n' + rows.join('\n');
}

async function exportAllData() {
    try {
        await connectOptionalMongo(process.env.MONGODB_URI);
        if (process.env.USE_SUPABASE !== 'true') {
            console.log('Connected to MongoDB\n');
        }
        console.log('📊 EXPORTING DATA TO CSV...\n');

        // 1. Export Students
        console.log('[1/7] Exporting students...');
        const students = await Student.find({}, '-password -__v').lean();
        const studentsCSV = arrayToCSV(students, ['name', 'registerNo', 'email', 'department', 'year', 'semester']);
        fs.writeFileSync(path.join(__dirname, 'export_students.csv'), studentsCSV);
        console.log(`✓ Exported ${students.length} students to export_students.csv\n`);

        // 2. Export Teachers
        console.log('[2/7] Exporting teachers...');
        const teachers = await Teacher.find({}, '-password -__v').lean();
        const teachersCSV = arrayToCSV(teachers, ['name', 'teacherId', 'email', 'department', 'subject']);
        fs.writeFileSync(path.join(__dirname, 'export_teachers.csv'), teachersCSV);
        console.log(`✓ Exported ${teachers.length} teachers to export_teachers.csv\n`);

        // 3. Export Courses
        console.log('[3/7] Exporting courses...');
        const courses = await Course.find({}).populate('teacherId', 'name teacherId').lean();
        const coursesData = courses.map(c => ({
            title: c.title,
            code: c.code,
            department: c.department,
            year: c.year,
            semester: c.semester,
            teacherName: c.teacherId?.name || '',
            teacherId: c.teacherId?.teacherId || '',
            enrolledCount: c.enrolledStudents?.length || 0
        }));
        const coursesCSV = arrayToCSV(coursesData, ['title', 'code', 'department', 'year', 'semester', 'teacherName', 'teacherId', 'enrolledCount']);
        fs.writeFileSync(path.join(__dirname, 'export_courses.csv'), coursesCSV);
        console.log(`✓ Exported ${courses.length} courses to export_courses.csv\n`);

        // 4. Export Sessions
        console.log('[4/7] Exporting sessions...');
        const sessions = await Session.find({}).populate('courseId', 'title code').lean();
        const sessionsData = sessions.map(s => ({
            sessionCode: s.sessionCode,
            topic: s.topic,
            date: s.date?.toISOString().split('T')[0] || '',
            courseTitle: s.courseId?.title || '',
            courseCode: s.courseId?.code || '',
            isActive: s.isActive
        }));
        const sessionsCSV = arrayToCSV(sessionsData, ['sessionCode', 'topic', 'date', 'courseTitle', 'courseCode', 'isActive']);
        fs.writeFileSync(path.join(__dirname, 'export_sessions.csv'), sessionsCSV);
        console.log(`✓ Exported ${sessions.length} sessions to export_sessions.csv\n`);

        // 5. Export Attendance
        console.log('[5/7] Exporting attendance...');
        const attendance = await Attendance.find({})
            .populate('studentId', 'name registerNo')
            .populate('sessionId', 'sessionCode topic')
            .lean();
        const attendanceData = attendance.map(a => ({
            studentName: a.studentId?.name || '',
            registerNo: a.studentId?.registerNo || '',
            sessionCode: a.sessionId?.sessionCode || '',
            topic: a.sessionId?.topic || '',
            checkInTime: a.checkInTime?.toISOString() || '',
            status: a.status
        }));
        const attendanceCSV = arrayToCSV(attendanceData, ['studentName', 'registerNo', 'sessionCode', 'topic', 'checkInTime', 'status']);
        fs.writeFileSync(path.join(__dirname, 'export_attendance.csv'), attendanceCSV);
        console.log(`✓ Exported ${attendance.length} attendance records to export_attendance.csv\n`);

        // 6. Export Activities
        console.log('[6/7] Exporting activities...');
        const activities = await Activity.find({}).populate('courseId', 'title code').lean();
        const activitiesData = activities.map(a => ({
            title: a.title,
            type: a.type,
            description: a.description,
            deadline: a.deadline?.toISOString().split('T')[0] || '',
            maxScore: a.maxScore,
            courseTitle: a.courseId?.title || '',
            courseCode: a.courseId?.code || ''
        }));
        const activitiesCSV = arrayToCSV(activitiesData, ['title', 'type', 'description', 'deadline', 'maxScore', 'courseTitle', 'courseCode']);
        fs.writeFileSync(path.join(__dirname, 'export_activities.csv'), activitiesCSV);
        console.log(`✓ Exported ${activities.length} activities to export_activities.csv\n`);

        // 7. Export Submissions
        console.log('[7/7] Exporting submissions...');
        const submissions = await Submission.find({})
            .populate('studentId', 'name registerNo')
            .populate('activityId', 'title type')
            .lean();
        const submissionsData = submissions.map(s => ({
            studentName: s.studentId?.name || '',
            registerNo: s.studentId?.registerNo || '',
            activityTitle: s.activityId?.title || '',
            activityType: s.activityId?.type || '',
            status: s.status,
            score: s.score || '',
            notes: s.notes || ''
        }));
        const submissionsCSV = arrayToCSV(submissionsData, ['studentName', 'registerNo', 'activityTitle', 'activityType', 'status', 'score', 'notes']);
        fs.writeFileSync(path.join(__dirname, 'export_submissions.csv'), submissionsCSV);
        console.log(`✓ Exported ${submissions.length} submissions to export_submissions.csv\n`);

        console.log('=== EXPORT COMPLETE ===\n');
        console.log('Files created:');
        console.log('  - export_students.csv (100 students)');
        console.log('  - export_teachers.csv (10 teachers)');
        console.log('  - export_courses.csv (20 courses)');
        console.log('  - export_sessions.csv (50 sessions)');
        console.log('  - export_attendance.csv (1054 records)');
        console.log('  - export_activities.csv (30 activities)');
        console.log('  - export_submissions.csv (510 submissions)');
        console.log('\nLocation: ' + __dirname);

        process.exit(0);
    } catch (error) {
        console.error('Error exporting data:', error);
        process.exit(1);
    }
}

exportAllData();
