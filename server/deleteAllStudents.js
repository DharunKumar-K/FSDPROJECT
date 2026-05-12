const mongoose = require('mongoose');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Submission = require('./models/Submission');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Activity = require('./models/Activity');
require('dotenv').config();

async function deleteAllData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        console.log('🗑️  DELETING ALL DATA...\n');

        // Delete all students
        const studentsDeleted = await Student.deleteMany({});
        console.log(`✓ Deleted ${studentsDeleted.deletedCount} students`);

        // Delete all attendance records
        const attendanceDeleted = await Attendance.deleteMany({});
        console.log(`✓ Deleted ${attendanceDeleted.deletedCount} attendance records`);

        // Delete all submissions
        const submissionsDeleted = await Submission.deleteMany({});
        console.log(`✓ Deleted ${submissionsDeleted.deletedCount} submissions`);

        // Delete all activities
        const activitiesDeleted = await Activity.deleteMany({});
        console.log(`✓ Deleted ${activitiesDeleted.deletedCount} activities`);

        // Delete all sessions
        const sessionsDeleted = await Session.deleteMany({});
        console.log(`✓ Deleted ${sessionsDeleted.deletedCount} sessions`);

        // Clear enrolled students from courses
        const coursesUpdated = await Course.updateMany({}, { $set: { enrolledStudents: [] } });
        console.log(`✓ Cleared enrolled students from ${coursesUpdated.modifiedCount} courses`);

        console.log('\n=== CLEANUP COMPLETE ===');
        console.log('All student data has been deleted.');
        console.log('\nNext steps:');
        console.log('1. Download the CSV template');
        console.log('2. Fill it with your student data');
        console.log('3. Upload via Bulk Import page');

        process.exit(0);
    } catch (error) {
        console.error('Error deleting data:', error);
        process.exit(1);
    }
}

deleteAllData();
