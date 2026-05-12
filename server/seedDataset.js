require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Student    = require('./models/Student');
const Teacher    = require('./models/Teacher');
const Admin      = require('./models/Admin');
const Course     = require('./models/Course');
const Session    = require('./models/Session');
const Activity   = require('./models/Activity');
const Attendance = require('./models/Attendance');
const Submission = require('./models/Submission');
const Curriculum = require('./models/Curriculum');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // ── CLEAR ALL ─────────────────────────────────────────────────────────────
    console.log('Deleting all old data...');
    await Promise.all([
        Admin.deleteMany({}),
        Teacher.deleteMany({}),
        Student.deleteMany({}),
        Course.deleteMany({}),
        Session.deleteMany({}),
        Activity.deleteMany({}),
        Attendance.deleteMany({}),
        Submission.deleteMany({}),
        Curriculum.deleteMany({})
    ]);
    console.log('✓ All old data deleted\n');

    const tHash = await bcrypt.hash('Pass@123', 10);
    const sHash = await bcrypt.hash('Pass@123', 10);
    const aHash = await bcrypt.hash('Pass@123', 10);

    // ── ADMIN (1) ─────────────────────────────────────────────────────────────
    console.log('Creating admin...');
    await Admin.create({
        name:            'System Administrator',
        adminId:         'ADMIN01',
        email:           'admin@college.edu',
        password:        aHash,
        institutionType: 'college',
        role:            'admin'
    });
    console.log('✓ Admin created\n');

    // ── TEACHERS (5) ─────────────────────────────────────────────────────────
    console.log('Creating teachers...');
    const teacherData = [
        { name: 'Dharun Kumar',   teacherId: 'AIDS-T01', department: 'AIDS',  subject: 'Artificial Intelligence',  email: 'dharun@college.edu' },
        { name: 'Priya Sharma',   teacherId: 'CSE-T01',  department: 'CSE',   subject: 'Data Structures',          email: 'priya@college.edu' },
        { name: 'Rahul Verma',    teacherId: 'ECE-T01',  department: 'ECE',   subject: 'Digital Electronics',      email: 'rahul@college.edu' },
        { name: 'Sneha Patel',    teacherId: 'IT-T01',   department: 'IT',    subject: 'Web Development',          email: 'sneha@college.edu' },
        { name: 'Arjun Reddy',    teacherId: 'MECH-T01', department: 'MECH',  subject: 'Thermodynamics',           email: 'arjun@college.edu' },
    ];
    const teachers = [];
    for (const d of teacherData) {
        const t = await Teacher.create({ ...d, password: tHash, role: 'teacher', institutionType: 'college', subjects: [d.subject] });
        teachers.push(t);
    }
    console.log(`✓ ${teachers.length} teachers created\n`);

    // ── STUDENTS (10) ─────────────────────────────────────────────────────────
    console.log('Creating students...');
    const studentData = [
        { name: 'Aarav Kumar',    registerNo: 'AIDS-S001', department: 'AIDS', year: '3', semester: '5', email: 'aarav@college.edu' },
        { name: 'Ananya Singh',   registerNo: 'AIDS-S002', department: 'AIDS', year: '3', semester: '5', email: 'ananya@college.edu' },
        { name: 'Vivaan Patel',   registerNo: 'AIDS-S003', department: 'AIDS', year: '3', semester: '5', email: 'vivaan@college.edu' },
        { name: 'Diya Sharma',    registerNo: 'AIDS-S004', department: 'AIDS', year: '3', semester: '5', email: 'diya@college.edu' },
        { name: 'Rohan Gupta',    registerNo: 'CSE-S001',  department: 'CSE',  year: '2', semester: '3', email: 'rohan@college.edu' },
        { name: 'Neha Reddy',     registerNo: 'CSE-S002',  department: 'CSE',  year: '2', semester: '3', email: 'neha@college.edu' },
        { name: 'Kabir Mehta',    registerNo: 'ECE-S001',  department: 'ECE',  year: '1', semester: '2', email: 'kabir@college.edu' },
        { name: 'Sara Nair',      registerNo: 'ECE-S002',  department: 'ECE',  year: '1', semester: '2', email: 'sara@college.edu' },
        { name: 'Ishaan Joshi',   registerNo: 'IT-S001',   department: 'IT',   year: '4', semester: '7', email: 'ishaan@college.edu' },
        { name: 'Pooja Agarwal',  registerNo: 'IT-S002',   department: 'IT',   year: '4', semester: '7', email: 'pooja@college.edu' },
    ];
    const students = [];
    for (const d of studentData) {
        const s = await Student.create({ ...d, password: sHash, role: 'student', institutionType: 'college' });
        students.push(s);
    }
    console.log(`✓ ${students.length} students created\n`);

    // helpers
    const byDept = dept => students.filter(s => s.department === dept).map(s => s._id);
    const teacher = dept => teachers.find(t => t.department === dept);

    // ── COURSES (6) ───────────────────────────────────────────────────────────
    console.log('Creating courses...');
    const courseData = [
        { dept: 'AIDS', title: 'Artificial Intelligence',  code: 'AIDS301', year: '3', semester: '5' },
        { dept: 'AIDS', title: 'Machine Learning',         code: 'AIDS302', year: '3', semester: '5' },
        { dept: 'CSE',  title: 'Data Structures',          code: 'CSE201',  year: '2', semester: '3' },
        { dept: 'CSE',  title: 'Operating Systems',        code: 'CSE202',  year: '2', semester: '3' },
        { dept: 'ECE',  title: 'Digital Electronics',      code: 'ECE101',  year: '1', semester: '2' },
        { dept: 'IT',   title: 'Web Development',          code: 'IT401',   year: '4', semester: '7' },
    ];
    const courses = [];
    for (const d of courseData) {
        const t = teacher(d.dept);
        const c = await Course.create({
            teacherId:        t._id,
            title:            d.title,
            code:             d.code,
            department:       d.dept,
            year:             d.year,
            semester:         d.semester,
            section:          'A',
            enrolledStudents: byDept(d.dept),
            institutionType:  'college'
        });
        courses.push(c);
    }
    console.log(`✓ ${courses.length} courses created\n`);

    // ── SESSIONS (8) ──────────────────────────────────────────────────────────
    console.log('Creating sessions...');
    const sessionTopics = [
        'Introduction to AI',        'Search Algorithms',
        'Arrays and Linked Lists',    'Stack and Queue',
        'Logic Gates',                'Combinational Circuits',
        'HTML & CSS Basics',          'JavaScript Fundamentals'
    ];
    const sessions = [];
    for (let i = 0; i < 8; i++) {
        const course = courses[i % courses.length];
        const date = new Date(Date.now() - (8 - i) * 3 * 24 * 60 * 60 * 1000);
        const s = await Session.create({
            courseId:     course._id,
            date,
            topic:        sessionTopics[i],
            sessionCode:  'SES' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            qrCodeString: 'QR-'  + Math.random().toString(36).substring(2, 7).toUpperCase(),
            isActive:     i >= 6
        });
        sessions.push(s);
    }
    console.log(`✓ ${sessions.length} sessions created\n`);

    // ── ATTENDANCE (per session × enrolled students) ──────────────────────────
    console.log('Creating attendance records...');
    const statuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];
    let attCount = 0;
    for (const session of sessions) {
        const course = courses.find(c => c._id.equals(session.courseId));
        for (const studentId of course.enrolledStudents) {
            await Attendance.create({
                studentId,
                sessionId:   session._id,
                checkInTime: new Date(session.date.getTime() + Math.floor(Math.random() * 1800000)),
                status:      statuses[Math.floor(Math.random() * statuses.length)]
            });
            attCount++;
        }
    }
    console.log(`✓ ${attCount} attendance records created\n`);

    // ── ACTIVITIES (6) ────────────────────────────────────────────────────────
    console.log('Creating activities...');
    const activityData = [
        { course: 'AIDS301', title: 'AI Search Assignment',       type: 'Assignment',    days: 10 },
        { course: 'AIDS302', title: 'ML Model Lab',               type: 'Lab',           days: 7  },
        { course: 'CSE201',  title: 'DSA Presentation',           type: 'Presentation',  days: 5  },
        { course: 'CSE202',  title: 'OS Mini Project',            type: 'Mini Project',  days: 14 },
        { course: 'ECE101',  title: 'Logic Gates Case Study',     type: 'Case Study',    days: 6  },
        { course: 'IT401',   title: 'Web Dev Group Discussion',   type: 'Group Discussion', days: 3 },
    ];
    const activities = [];
    for (const d of activityData) {
        const course = courses.find(c => c.code === d.course);
        const a = await Activity.create({
            courseId:    course._id,
            title:       d.title,
            description: `Complete the ${d.type.toLowerCase()} on ${d.title}`,
            type:        d.type,
            deadline:    new Date(Date.now() + d.days * 24 * 60 * 60 * 1000),
            maxScore:    100
        });
        activities.push(a);
    }
    console.log(`✓ ${activities.length} activities created\n`);

    // ── SUBMISSIONS (per activity × enrolled students) ────────────────────────
    console.log('Creating submissions...');
    let subCount = 0;
    for (const activity of activities) {
        const course = courses.find(c => c._id.equals(activity.courseId));
        for (const studentId of course.enrolledStudents) {
            const submittedAt = new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000));
            await Submission.create({
                activityId: activity._id,
                studentId,
                fileUrl:    `https://storage.example.com/${studentId}_${activity._id}.pdf`,
                notes:      `Submission for ${activity.title}`,
                score:      Math.floor(Math.random() * 40) + 60,
                status:     'On-Time'
            });
            subCount++;
        }
    }
    console.log(`✓ ${subCount} submissions created\n`);

    // ── CURRICULUM (6 — one per course, 3 units each) ─────────────────────────
    console.log('Creating curriculum...');
    const unitsByCode = {
        AIDS301: [
            { title: 'Intro to AI',          topics: ['History of AI', 'Problem Solving', 'Search Algorithms', 'Heuristics'],          progress: 100 },
            { title: 'Knowledge & Reasoning', topics: ['Logic', 'Knowledge Representation', 'Inference', 'Expert Systems'],            progress: 75  },
            { title: 'Machine Learning',      topics: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Evaluation'], progress: 50  },
        ],
        AIDS302: [
            { title: 'ML Foundations',        topics: ['Statistics', 'Linear Algebra', 'Probability', 'Data Preprocessing'],           progress: 100 },
            { title: 'Algorithms',            topics: ['Regression', 'Classification', 'Clustering', 'Dimensionality Reduction'],      progress: 50  },
            { title: 'Deep Learning',         topics: ['CNN', 'RNN', 'Transformers', 'Model Deployment'],                              progress: 25  },
        ],
        CSE201: [
            { title: 'Linear Structures',     topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'],                                  progress: 100 },
            { title: 'Non-Linear Structures', topics: ['Trees', 'Binary Search Tree', 'Heaps', 'Graphs'],                              progress: 75  },
            { title: 'Algorithms',            topics: ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy'],                       progress: 25  },
        ],
        CSE202: [
            { title: 'Process Management',    topics: ['Processes', 'Threads', 'Scheduling', 'Synchronization'],                       progress: 100 },
            { title: 'Memory Management',     topics: ['Paging', 'Segmentation', 'Virtual Memory', 'Page Replacement'],                progress: 50  },
            { title: 'File Systems',          topics: ['File Concepts', 'Directory Structure', 'Disk Scheduling', 'Security'],         progress: 0   },
        ],
        ECE101: [
            { title: 'Number Systems',        topics: ['Binary', 'Octal', 'Hexadecimal', 'Conversions'],                               progress: 100 },
            { title: 'Logic Gates',           topics: ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'],                                     progress: 100 },
            { title: 'Combinational Circuits',topics: ['Adders', 'Subtractors', 'Multiplexers', 'Decoders'],                           progress: 50  },
        ],
        IT401: [
            { title: 'Frontend Basics',       topics: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],                            progress: 100 },
            { title: 'Frontend Frameworks',   topics: ['React', 'State Management', 'Routing', 'API Integration'],                    progress: 75  },
            { title: 'Backend Development',   topics: ['Node.js', 'Express', 'REST APIs', 'MongoDB'],                                  progress: 50  },
        ],
    };

    for (const course of courses) {
        const units = (unitsByCode[course.code] || []).map((u, idx) => {
            const completedCount = Math.round((u.progress / 100) * u.topics.length);
            return {
                unit:     idx + 1,
                title:    u.title,
                progress: u.progress,
                topics:   u.topics.map((name, ti) => ({
                    name,
                    completed:     ti < completedCount,
                    completedDate: ti < completedCount
                        ? new Date(Date.now() - (u.topics.length - ti) * 7 * 24 * 60 * 60 * 1000)
                        : undefined
                }))
            };
        });
        const t = teacher(course.department);
        await Curriculum.create({
            institutionType: 'college',
            department:      course.department,
            year:            course.year,
            semester:        course.semester,
            courseCode:      course.code,
            courseName:      course.title,
            units,
            teacher:         t._id
        });
    }
    console.log(`✓ ${courses.length} curriculum entries created\n`);

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    console.log('============================================');
    console.log('           DATASET READY');
    console.log('============================================');
    console.log('\n🔐 LOGIN CREDENTIALS\n');
    console.log('  ADMIN tab');
    console.log('    ID       : ADMIN01');
    console.log('    Password : Pass@123\n');
    console.log('  STAFF tab');
    console.log('    ID       : AIDS-T01');
    console.log('    Password : Pass@123\n');
    console.log('  STUDENT tab');
    console.log('    ID       : AIDS-S001');
    console.log('    Password : Pass@123\n');
    console.log('============================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
