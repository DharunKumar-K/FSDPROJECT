const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Course = require('./models/Course');
const connectOptionalMongo = require('./config/connectOptionalMongo');
require('dotenv').config();

async function quickDiagnostic() {
    try {
        console.log('🔍 QUICK DIAGNOSTIC CHECK\n');
        console.log('Connecting to MongoDB...');
        await connectOptionalMongo(process.env.MONGODB_URI);
        if (process.env.USE_SUPABASE !== 'true') {
            console.log('✓ Connected\n');
        }

        // Check Teacher 81
        const teacher = await Teacher.findOne({ teacherId: '81' });
        console.log(`Teacher 81: ${teacher ? '✓ EXISTS' : '✗ NOT FOUND'}`);
        if (teacher) {
            console.log(`  Name: ${teacher.name}`);
            console.log(`  Email: ${teacher.email}`);
        }

        // Check Student 31
        const student = await Student.findOne({ registerNo: '31' });
        console.log(`\nStudent 31: ${student ? '✓ EXISTS' : '✗ NOT FOUND'}`);
        if (student) {
            console.log(`  Name: ${student.name}`);
            console.log(`  Email: ${student.email}`);
        }

        // Check Courses
        if (teacher) {
            const courses = await Course.find({ teacherId: teacher._id });
            console.log(`\nCourses for Teacher 81: ${courses.length}`);
            
            let totalStudents = 0;
            for (const course of courses) {
                totalStudents += course.enrolledStudents.length;
            }
            console.log(`Total Student Enrollments: ${totalStudents}`);
            
            // Check if student 31 is enrolled
            const student31Enrolled = courses.some(c => 
                c.enrolledStudents.some(s => s.toString() === student._id.toString())
            );
            console.log(`Student 31 Enrolled: ${student31Enrolled ? '✓ YES' : '✗ NO'}`);
        }

        // Overall status
        console.log('\n' + '='.repeat(50));
        if (teacher && student && teacher) {
            console.log('✓ ALL CHECKS PASSED');
            console.log('\nYou can now:');
            console.log('1. Start server: node server.js');
            console.log('2. Login as Teacher 81 (ID: 81, Password: password123)');
            console.log('3. Go to Manual Attendance');
            console.log('4. See all students');
        } else {
            console.log('✗ SOME CHECKS FAILED');
            console.log('\nRun: node seedRandomData.js');
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

quickDiagnostic();
