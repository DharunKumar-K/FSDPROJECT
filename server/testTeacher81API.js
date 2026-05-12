const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Course = require('./models/Course');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

async function testTeacher81API() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find teacher 81
        const teacher = await Teacher.findOne({ teacherId: '81' });
        if (!teacher) {
            console.log('❌ Teacher ID 81 not found');
            process.exit(1);
        }

        // Generate JWT token for teacher 81
        const token = jwt.sign({ 
            id: teacher._id, 
            role: 'teacher', 
            teacherId: teacher.teacherId 
        }, SECRET, { expiresIn: '7d' });

        console.log('=== TEACHER 81 API ACCESS ===');
        console.log(`Teacher: ${teacher.name}`);
        console.log(`Email: ${teacher.email}`);
        console.log(`MongoDB ID: ${teacher._id}`);
        console.log(`\nGenerated JWT Token (use this in API calls):`);
        console.log(`Bearer ${token}`);
        console.log('\n=== AVAILABLE ENDPOINTS ===');
        console.log('GET /api/teacher/dashboard');
        console.log('GET /api/teacher/students');
        console.log('GET /api/courses');
        console.log('\nAdd this header to your requests:');
        console.log(`Authorization: Bearer ${token}`);

        // Simulate the API calls
        const teacherController = require('./controllers/teacherController');
        
        // Mock request and response objects
        const mockReq = {
            user: {
                id: teacher._id,
                role: 'teacher',
                teacherId: teacher.teacherId
            }
        };

        console.log('\n=== TESTING DASHBOARD ENDPOINT ===');
        const mockResDashboard = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Status: ${code}`);
                    if (data.error) {
                        console.log(`Error: ${data.error}`);
                    } else {
                        console.log(`Total Courses: ${data.totalCourses}`);
                        console.log(`Total Students: ${data.totalStudents}`);
                        console.log('\nCourses:');
                        if (data.courses) {
                            data.courses.forEach((c, idx) => {
                                console.log(`  ${idx + 1}. ${c.title} (${c.code}) - ${c.enrolledCount} students`);
                            });
                        }
                    }
                }
            })
        };
        await teacherController.getTeacherDashboard(mockReq, mockResDashboard);

        console.log('\n=== TESTING STUDENTS ENDPOINT ===');
        const mockResStudents = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Status: ${code}`);
                    if (data.error) {
                        console.log(`Error: ${data.error}`);
                    } else if (Array.isArray(data)) {
                        console.log(`Total Students: ${data.length}`);
                        console.log('\nFirst 5 Students:');
                        data.slice(0, 5).forEach((s, idx) => {
                            console.log(`  ${idx + 1}. ${s.name} (${s.registerNo}) - ${s.department} Year ${s.year}`);
                        });
                        
                        const student31 = data.find(s => s.registerNo === '31');
                        if (student31) {
                            console.log(`\n✓ Student 31 found: ${student31.name} (${student31.email})`);
                        }
                    }
                }
            })
        };
        await teacherController.getTeacherStudents(mockReq, mockResStudents);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testTeacher81API();
