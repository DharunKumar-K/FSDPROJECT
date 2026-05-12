const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Student = require('./models/Student');
require('dotenv').config();

async function checkTeacher81() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find teacher 81
        const teacher = await Teacher.findOne({ teacherId: '81' });
        if (!teacher) {
            console.log('❌ Teacher ID 81 not found');
            process.exit(1);
        }

        console.log('=== TEACHER 81 INFO ===');
        console.log(`Name: ${teacher.name}`);
        console.log(`Email: ${teacher.email}`);
        console.log(`Department: ${teacher.department}`);
        console.log(`MongoDB _id: ${teacher._id}\n`);

        // Find courses taught by teacher 81
        const courses = await Course.find({ teacherId: teacher._id }).populate('enrolledStudents');
        console.log(`=== COURSES (${courses.length}) ===`);
        courses.forEach((course, idx) => {
            console.log(`${idx + 1}. ${course.title} (${course.code})`);
            console.log(`   Enrolled Students: ${course.enrolledStudents.length}`);
        });

        // Count total unique students
        const allStudentIds = new Set();
        courses.forEach(course => {
            course.enrolledStudents.forEach(student => {
                allStudentIds.add(student._id.toString());
            });
        });

        console.log(`\n=== TOTAL UNIQUE STUDENTS ===`);
        console.log(`Total: ${allStudentIds.size}`);

        // Show student 31
        const student31 = await Student.findOne({ registerNo: '31' });
        if (student31) {
            console.log(`\n=== STUDENT 31 INFO ===`);
            console.log(`Name: ${student31.name}`);
            console.log(`Email: ${student31.email}`);
            console.log(`Department: ${student31.department}`);
            console.log(`Year: ${student31.year}`);
            console.log(`Semester: ${student31.semester}`);
            
            const enrolledIn = courses.filter(c => 
                c.enrolledStudents.some(s => s._id.toString() === student31._id.toString())
            );
            console.log(`Enrolled in ${enrolledIn.length} courses`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTeacher81();
