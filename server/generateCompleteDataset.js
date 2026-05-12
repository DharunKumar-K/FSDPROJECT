const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Activity = require('./models/Activity');
const Attendance = require('./models/Attendance');
const Submission = require('./models/Submission');
require('dotenv').config();

// Sample data
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
    'Rohan', 'Aryan', 'Kabir', 'Dhruv', 'Karan', 'Priya', 'Ananya', 'Diya', 'Navya', 'Sara',
    'Riya', 'Sneha', 'Pooja', 'Neha', 'Anjali', 'Rahul', 'Amit', 'Raj', 'Vikram', 'Nikhil'
];

const lastNames = [
    'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Rao', 'Nair', 'Iyer',
    'Joshi', 'Desai', 'Mehta', 'Shah', 'Agarwal', 'Bansal', 'Malhotra', 'Kapoor', 'Chopra', 'Bhatia'
];

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'CSBS'];
const years = ['1', '2', '3', '4'];
const subjects = [
    'Data Structures', 'Database Management', 'Operating Systems', 'Computer Networks',
    'Web Development', 'Machine Learning', 'Software Engineering', 'Cloud Computing',
    'Artificial Intelligence', 'Cyber Security', 'Mobile App Development', 'IoT'
];

const activityTypes = ['Assignment', 'Lab', 'Presentation', 'Mini Project', 'Group Discussion', 'Case Study'];
const topics = [
    'Introduction to Programming', 'Advanced Algorithms', 'System Design', 'Network Security',
    'Database Optimization', 'Web APIs', 'Machine Learning Basics', 'Cloud Architecture',
    'Mobile Development', 'Data Analytics', 'Software Testing', 'Agile Methodology'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateSessionCode() {
    return 'SES' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function generateCompleteDataset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');
        console.log('🎯 GENERATING COMPLETE DATASET...\n');

        // 1. Generate Teachers (10 teachers)
        console.log('[1/7] Creating teachers...');
        const teachers = [];
        for (let i = 1; i <= 10; i++) {
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            const teacher = new Teacher({
                name: `${firstName} ${lastName}`,
                teacherId: `TCH${String(i).padStart(3, '0')}`,
                department: getRandomElement(departments),
                subject: getRandomElement(subjects),
                subjects: [getRandomElement(subjects), getRandomElement(subjects), getRandomElement(subjects)],
                email: `teacher${i}@college.edu`,
                password: 'teacher123',
                role: 'teacher'
            });
            await teacher.save();
            teachers.push(teacher);
        }
        console.log(`✓ Created ${teachers.length} teachers\n`);

        // 2. Generate Students (100 students)
        console.log('[2/7] Creating students...');
        const students = [];
        for (let i = 1; i <= 100; i++) {
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            const department = getRandomElement(departments);
            const year = getRandomElement(years);
            const semester = year === '1' ? getRandomElement(['1', '2']) :
                           year === '2' ? getRandomElement(['3', '4']) :
                           year === '3' ? getRandomElement(['5', '6']) :
                           getRandomElement(['7', '8']);
            
            const student = new Student({
                name: `${firstName} ${lastName}`,
                registerNo: `2021${String(i).padStart(3, '0')}`,
                email: `student${i}@college.edu`,
                password: 'student123',
                department: department,
                year: year,
                semester: semester,
                role: 'student'
            });
            await student.save();
            students.push(student);
        }
        console.log(`✓ Created ${students.length} students\n`);

        // 3. Generate Courses (20 courses)
        console.log('[3/7] Creating courses...');
        const courses = [];
        for (let i = 1; i <= 20; i++) {
            const teacher = getRandomElement(teachers);
            const subject = getRandomElement(subjects);
            const department = getRandomElement(departments);
            const year = getRandomElement(years);
            
            // Enroll 20-30 random students
            const enrolledCount = getRandomInt(20, 30);
            const enrolledStudents = [];
            const shuffled = [...students].sort(() => 0.5 - Math.random());
            for (let j = 0; j < enrolledCount; j++) {
                enrolledStudents.push(shuffled[j]._id);
            }
            
            const course = new Course({
                teacherId: teacher._id,
                title: subject,
                code: `${department}${year}0${i}`,
                department: department,
                year: year,
                semester: year === '1' ? '1' : year === '2' ? '3' : year === '3' ? '5' : '7',
                enrolledStudents: enrolledStudents
            });
            await course.save();
            courses.push(course);
        }
        console.log(`✓ Created ${courses.length} courses\n`);

        // 4. Generate Sessions (50 sessions)
        console.log('[4/7] Creating sessions...');
        const sessions = [];
        const startDate = new Date('2024-01-01');
        const endDate = new Date();
        
        for (let i = 0; i < 50; i++) {
            const course = getRandomElement(courses);
            const session = new Session({
                courseId: course._id,
                date: getRandomDate(startDate, endDate),
                topic: getRandomElement(topics),
                sessionCode: generateSessionCode(),
                qrCodeString: `QR-${generateSessionCode()}`,
                isActive: Math.random() > 0.8
            });
            await session.save();
            sessions.push(session);
        }
        console.log(`✓ Created ${sessions.length} sessions\n`);

        // 5. Generate Attendance (attendance for sessions)
        console.log('[5/7] Creating attendance records...');
        let attendanceCount = 0;
        for (const session of sessions) {
            const course = await Course.findById(session.courseId);
            if (!course || !course.enrolledStudents) continue;
            
            // 80-95% attendance rate
            for (const studentId of course.enrolledStudents) {
                if (Math.random() > 0.15) { // 85% chance of attendance
                    const statuses = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent'];
                    const attendance = new Attendance({
                        studentId: studentId,
                        sessionId: session._id,
                        checkInTime: new Date(session.date.getTime() + getRandomInt(0, 3600000)),
                        status: getRandomElement(statuses)
                    });
                    await attendance.save();
                    attendanceCount++;
                }
            }
        }
        console.log(`✓ Created ${attendanceCount} attendance records\n`);

        // 6. Generate Activities (30 activities)
        console.log('[6/7] Creating activities...');
        const activities = [];
        const now = new Date();
        const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead
        
        for (let i = 0; i < 30; i++) {
            const course = getRandomElement(courses);
            const activity = new Activity({
                courseId: course._id,
                title: `${getRandomElement(activityTypes)} ${i + 1}`,
                description: `Complete the ${getRandomElement(activityTypes).toLowerCase()} on ${getRandomElement(topics)}`,
                type: getRandomElement(activityTypes),
                deadline: getRandomDate(now, futureDate),
                maxScore: getRandomInt(50, 100)
            });
            await activity.save();
            activities.push(activity);
        }
        console.log(`✓ Created ${activities.length} activities\n`);

        // 7. Generate Submissions (submissions for activities)
        console.log('[7/7] Creating submissions...');
        let submissionCount = 0;
        for (const activity of activities) {
            const course = await Course.findById(activity.courseId);
            if (!course || !course.enrolledStudents) continue;
            
            // 60-80% submission rate
            for (const studentId of course.enrolledStudents) {
                if (Math.random() > 0.3) { // 70% chance of submission
                    const submittedAt = getRandomDate(
                        new Date(activity.deadline.getTime() - 7 * 24 * 60 * 60 * 1000),
                        new Date()
                    );
                    const isLate = submittedAt > activity.deadline;
                    const hasScore = Math.random() > 0.3; // 70% graded
                    
                    const submission = new Submission({
                        activityId: activity._id,
                        studentId: studentId,
                        fileUrl: `https://storage.example.com/submissions/${studentId}_${activity._id}.pdf`,
                        notes: `Submission for ${activity.title}`,
                        score: hasScore ? getRandomInt(60, activity.maxScore) : null,
                        status: isLate ? 'Late' : 'On-Time'
                    });
                    await submission.save();
                    submissionCount++;
                }
            }
        }
        console.log(`✓ Created ${submissionCount} submissions\n`);

        // Summary
        console.log('=== DATASET GENERATION COMPLETE ===\n');
        console.log('Summary:');
        console.log(`✓ Teachers: ${teachers.length}`);
        console.log(`✓ Students: ${students.length}`);
        console.log(`✓ Courses: ${courses.length}`);
        console.log(`✓ Sessions: ${sessions.length}`);
        console.log(`✓ Attendance Records: ${attendanceCount}`);
        console.log(`✓ Activities: ${activities.length}`);
        console.log(`✓ Submissions: ${submissionCount}`);
        
        console.log('\n=== LOGIN CREDENTIALS ===\n');
        console.log('Admin:');
        console.log('  ID: admin');
        console.log('  Password: admin123\n');
        console.log('Teachers (any of these):');
        console.log('  ID: TCH001 to TCH010');
        console.log('  Password: teacher123\n');
        console.log('Students (any of these):');
        console.log('  ID: 2021001 to 2021100');
        console.log('  Password: student123\n');

        process.exit(0);
    } catch (error) {
        console.error('Error generating dataset:', error);
        process.exit(1);
    }
}

generateCompleteDataset();
