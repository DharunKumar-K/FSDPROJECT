const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');
const Activity = require('./models/Activity');
const Submission = require('./models/Submission');
require('dotenv').config();

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const START_DATE = new Date('2026-05-07');
const END_DATE = new Date('2026-08-30');

const departmentData = {
    CSE: {
        subjects: ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Compiler Design'],
        teachers: [
            { name: 'Dr. Arjun Menon',   teacherId: 'CSE-T01', email: 'arjun.menon@college.edu',   subjectIndexes: [0, 1] },
            { name: 'Prof. Sneha Pillai', teacherId: 'CSE-T02', email: 'sneha.pillai@college.edu', subjectIndexes: [2, 3] },
        ],
        students: [
            { name: 'Aditya Krishnan', registerNo: 'CSE001', year: '2', semester: '3' },
            { name: 'Bhavana Nair',    registerNo: 'CSE002', year: '2', semester: '3' },
            { name: 'Chirag Suresh',   registerNo: 'CSE003', year: '2', semester: '3' },
            { name: 'Divya Rajan',     registerNo: 'CSE004', year: '3', semester: '5' },
            { name: 'Elan Varma',      registerNo: 'CSE005', year: '3', semester: '5' },
            { name: 'Fathima Beevi',   registerNo: 'CSE006', year: '3', semester: '5' },
            { name: 'Gautam Iyer',     registerNo: 'CSE007', year: '2', semester: '3' },
            { name: 'Harini Mohan',    registerNo: 'CSE008', year: '2', semester: '3' },
        ]
    },
    ECE: {
        subjects: ['Digital Electronics', 'Signals & Systems', 'VLSI Design', 'Microprocessors', 'Embedded Systems'],
        teachers: [
            { name: 'Dr. Lakshmi Devi',  teacherId: 'ECE-T01', email: 'lakshmi.devi@college.edu', subjectIndexes: [0, 1] },
            { name: 'Prof. Ramesh Babu', teacherId: 'ECE-T02', email: 'ramesh.babu@college.edu',  subjectIndexes: [2, 3] },
        ],
        students: [
            { name: 'Ishaan Chandran', registerNo: 'ECE001', year: '2', semester: '3' },
            { name: 'Janani Selvam',   registerNo: 'ECE002', year: '2', semester: '3' },
            { name: 'Karthik Raj',     registerNo: 'ECE003', year: '2', semester: '3' },
            { name: 'Lavanya Suresh',  registerNo: 'ECE004', year: '3', semester: '5' },
            { name: 'Manoj Kumar',     registerNo: 'ECE005', year: '3', semester: '5' },
            { name: 'Nithya Priya',    registerNo: 'ECE006', year: '3', semester: '5' },
            { name: 'Om Prakash',      registerNo: 'ECE007', year: '2', semester: '3' },
            { name: 'Pavithra Anand',  registerNo: 'ECE008', year: '2', semester: '3' },
        ]
    },
    MECH: {
        subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes', 'CAD/CAM'],
        teachers: [
            { name: 'Dr. Suresh Babu',  teacherId: 'MECH-T01', email: 'suresh.babu@college.edu', subjectIndexes: [0, 1] },
            { name: 'Prof. Anitha Raj', teacherId: 'MECH-T02', email: 'anitha.raj@college.edu',  subjectIndexes: [2, 3] },
        ],
        students: [
            { name: 'Qasim Ali',      registerNo: 'MECH001', year: '2', semester: '3' },
            { name: 'Riya Thomas',    registerNo: 'MECH002', year: '2', semester: '3' },
            { name: 'Sanjay Verma',   registerNo: 'MECH003', year: '2', semester: '3' },
            { name: 'Tanya Mishra',   registerNo: 'MECH004', year: '3', semester: '5' },
            { name: 'Uday Shankar',   registerNo: 'MECH005', year: '3', semester: '5' },
            { name: 'Vaishnavi Nair', registerNo: 'MECH006', year: '3', semester: '5' },
            { name: 'Wasim Khan',     registerNo: 'MECH007', year: '2', semester: '3' },
            { name: 'Xena Patel',     registerNo: 'MECH008', year: '2', semester: '3' },
        ]
    },
    AIDS: {
        subjects: ['Artificial Intelligence', 'Data Science', 'Machine Learning', 'Deep Learning', 'Big Data Analytics'],
        teachers: [
            { name: 'Dr. Priya Venkat',  teacherId: 'AIDS-T01', email: 'priya.venkat@college.edu', subjectIndexes: [0, 1] },
            { name: 'Prof. Kiran Reddy', teacherId: 'AIDS-T02', email: 'kiran.reddy@college.edu',  subjectIndexes: [2, 3] },
        ],
        students: [
            { name: 'Aarav Sharma',   registerNo: 'AIDS001', year: '2', semester: '3' },
            { name: 'Bhavya Nair',    registerNo: 'AIDS002', year: '2', semester: '3' },
            { name: 'Chetan Pillai',  registerNo: 'AIDS003', year: '2', semester: '3' },
            { name: 'Deepika Menon',  registerNo: 'AIDS004', year: '3', semester: '5' },
            { name: 'Eshan Iyer',     registerNo: 'AIDS005', year: '3', semester: '5' },
            { name: 'Farida Banu',    registerNo: 'AIDS006', year: '3', semester: '5' },
            { name: 'Gopal Krishna',  registerNo: 'AIDS007', year: '2', semester: '3' },
            { name: 'Harsha Vardhan', registerNo: 'AIDS008', year: '2', semester: '3' },
        ]
    }
};

const activityTypes = ['Assignment', 'Lab', 'Presentation', 'Mini Project', 'Group Discussion', 'Case Study'];
const statuses = ['Present', 'Absent', 'Late'];
const topicPrefixes = ['Introduction to', 'Advanced', 'Practical', 'Theory of', 'Lab -'];

async function clearOldData() {
    await Promise.all([
        Student.deleteMany({}),
        Teacher.deleteMany({}),
        Course.deleteMany({}),
        Session.deleteMany({}),
        Attendance.deleteMany({}),
        Activity.deleteMany({}),
        Submission.deleteMany({})
    ]);
    console.log('✓ Cleared old data');
}

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await clearOldData();

        const allTeachers = [];
        const allCourses = [];
        const allSessions = [];

        for (const [dept, data] of Object.entries(departmentData)) {
            // Create students for this department
            const deptStudents = [];
            for (const s of data.students) {
                const student = new Student({
                    ...s,
                    department: dept,
                    email: `${s.registerNo.toLowerCase()}@college.edu`,
                    password: 'password123',
                    role: 'student'
                });
                await student.save();
                deptStudents.push(student);
            }
            console.log(`✓ Created ${deptStudents.length} students for ${dept}`);

            // Create teachers and their courses for this department
            for (const t of data.teachers) {
                const teacher = new Teacher({
                    ...t,
                    department: dept,
                    subject: data.subjects[0],
                    subjects: data.subjects,
                    password: 'password123',
                    role: 'teacher'
                });
                await teacher.save();
                allTeachers.push(teacher);

                // Each teacher gets their own 2 subjects (no overlap), each with 2 sections (A & B)
                const teacherSubjects = t.subjectIndexes.map(i => data.subjects[i]);
                for (const subject of teacherSubjects) {
                    for (const section of ['A', 'B']) {
                        const code = `${t.teacherId}-${subject.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase()}-${section}`;
                        const course = new Course({
                            teacherId: teacher._id,
                            title: subject,
                            code,
                            department: dept,
                            year: section === 'A' ? '2' : '3',
                            semester: section === 'A' ? '3' : '5',
                            section,
                            enrolledStudents: deptStudents
                                .filter(s => s.semester === (section === 'A' ? '3' : '5'))
                                .map(s => s._id)
                        });
                        await course.save();
                        allCourses.push(course);

                        // Create 8 sessions per course, weekly from May 7 2026
                        for (let i = 0; i < 8; i++) {
                            const sessionDate = new Date(START_DATE);
                            sessionDate.setDate(START_DATE.getDate() + i * 7);
                            const sessionCode = `${t.teacherId}-${subject.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase()}-${section}-W${i + 1}`;
                            const session = new Session({
                                courseId: course._id,
                                date: sessionDate,
                                topic: `${getRandomElement(topicPrefixes)} ${subject} - Week ${i + 1}`,
                                sessionCode,
                                qrCodeString: `QR-${sessionCode}`,
                                isActive: i >= 6 // last 2 sessions active
                            });
                            await session.save();
                            allSessions.push({ session, course, students: deptStudents.filter(s => s.semester === (section === 'A' ? '3' : '5')) });
                        }
                    }
                }
                console.log(`✓ Created courses & sessions for ${t.name} (${dept})`);
            }
        }

        // Create attendance records
        let attendanceCount = 0;
        for (const { session, students } of allSessions) {
            for (const student of students) {
                if (Math.random() > 0.15) {
                    const attendance = new Attendance({
                        studentId: student._id,
                        sessionId: session._id,
                        checkInTime: new Date(session.date.getTime() + getRandomInt(0, 1800000)),
                        status: Math.random() > 0.2 ? 'Present' : getRandomElement(['Absent', 'Late'])
                    });
                    await attendance.save();
                    attendanceCount++;
                }
            }
        }
        console.log(`✓ Created ${attendanceCount} attendance records`);

        // Create activities and submissions
        let activityCount = 0, submissionCount = 0;
        for (const course of allCourses) {
            for (let i = 0; i < 3; i++) {
                const deadline = new Date(START_DATE);
                deadline.setDate(START_DATE.getDate() + (i + 1) * 14);
                const activity = new Activity({
                    courseId: course._id,
                    title: `${getRandomElement(activityTypes)} ${i + 1} - ${course.title}`,
                    description: `Complete the task for ${course.title}`,
                    type: getRandomElement(activityTypes),
                    deadline,
                    maxScore: getRandomInt(50, 100)
                });
                await activity.save();
                activityCount++;

                const enrolledStudents = await Student.find({ _id: { $in: course.enrolledStudents } });
                for (const student of enrolledStudents) {
                    if (Math.random() > 0.25) {
                        const submittedAt = new Date(deadline.getTime() - getRandomInt(0, 5 * 24 * 60 * 60 * 1000));
                        const submission = new Submission({
                            activityId: activity._id,
                            studentId: student._id,
                            fileUrl: `https://storage.example.com/${student.registerNo}_${activity._id}.pdf`,
                            notes: `Submission by ${student.name}`,
                            score: Math.random() > 0.3 ? getRandomInt(60, 100) : null,
                            status: 'On-Time'
                        });
                        await submission.save();
                        submissionCount++;
                    }
                }
            }
        }
        console.log(`✓ Created ${activityCount} activities, ${submissionCount} submissions`);

        console.log('\n=== SEED COMPLETE ===');
        console.log('Departments: CSE, ECE, MECH, AIDS');
        console.log('Teachers per dept: 2  |  Students per dept: 8');
        console.log('Each teacher: 2 unique subjects × 2 sections (A & B) = 4 courses');
        console.log('Sessions per course: 8 (weekly from May 7, 2026)');
        console.log('\nLogin credentials (all): password123');
        console.log('Teacher IDs: CSE-T01, CSE-T02, ECE-T01, ECE-T02, MECH-T01, MECH-T02, AIDS-T01, AIDS-T02');
        console.log('Student reg nos: CSE001-008, ECE001-008, MECH001-008, AIDS001-008');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
