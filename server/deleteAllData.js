const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Activity = require('./models/Activity');
const Attendance = require('./models/Attendance');
const Submission = require('./models/Submission');
require('dotenv').config();

async function deleteAllData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        console.log('🗑️  DELETING ALL DATA...\n');

        // Delete all data
        const studentsDeleted = await Student.deleteMany({});
        console.log(`✓ Deleted ${studentsDeleted.deletedCount} students`);

        const teachersDeleted = await Teacher.deleteMany({});
        console.log(`✓ Deleted ${teachersDeleted.deletedCount} teachers`);

        const coursesDeleted = await Course.deleteMany({});
        console.log(`✓ Deleted ${coursesDeleted.deletedCount} courses`);

        const sessionsDeleted = await Session.deleteMany({});
        console.log(`✓ Deleted ${sessionsDeleted.deletedCount} sessions`);

        const activitiesDeleted = await Activity.deleteMany({});
        console.log(`✓ Deleted ${activitiesDeleted.deletedCount} activities`);

        const attendanceDeleted = await Attendance.deleteMany({});
        console.log(`✓ Deleted ${attendanceDeleted.deletedCount} attendance records`);

        const submissionsDeleted = await Submission.deleteMany({});
        console.log(`✓ Deleted ${submissionsDeleted.deletedCount} submissions`);

        // Keep admin account
        const adminCount = await Admin.countDocuments();
        console.log(`✓ Kept ${adminCount} admin account(s)`);

        console.log('\n=== CLEANUP COMPLETE ===');
        console.log('All data deleted except admin accounts.');
        console.log('\nDatabase is now clean and ready for new data.');

        process.exit(0);
    } catch (error) {
        console.error('Error deleting data:', error);
        process.exit(1);
    }
}

deleteAllData();
