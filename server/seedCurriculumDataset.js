require('dotenv').config();
const mongoose = require('mongoose');
const connectOptionalMongo = require('./config/connectOptionalMongo');
const bcrypt = require('bcryptjs');

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');
const Curriculum = require('./models/Curriculum');

// ─── SUBJECT MAP PER DEPARTMENT ─────────────────────────────────────────────
const DEPT_SUBJECTS = {
    "CSE": [
        { code: "CS301", title: "Data Structures & Algorithms", sem: "5", year: "3" },
        { code: "CS302", title: "Database Management Systems", sem: "5", year: "3" },
        { code: "CS303", title: "Operating Systems", sem: "5", year: "3" },
        { code: "CS304", title: "Computer Networks", sem: "5", year: "3" },
        { code: "CS305", title: "Software Engineering", sem: "5", year: "3" },
        { code: "CS306", title: "Artificial Intelligence", sem: "5", year: "3" },
    ],
    "ECE": [
        { code: "EC301", title: "VLSI Design", sem: "5", year: "3" },
        { code: "EC302", title: "Embedded Systems", sem: "5", year: "3" },
        { code: "EC303", title: "Microprocessors", sem: "5", year: "3" },
        { code: "EC304", title: "Communication Systems", sem: "5", year: "3" },
        { code: "EC305", title: "Digital Signal Processing", sem: "5", year: "3" },
    ],
    "EEE": [
        { code: "EE301", title: "Power Systems", sem: "5", year: "3" },
        { code: "EE302", title: "Control Systems", sem: "5", year: "3" },
        { code: "EE303", title: "Electrical Machines", sem: "5", year: "3" },
        { code: "EE304", title: "Digital Electronics", sem: "5", year: "3" },
        { code: "EE305", title: "Signal Processing", sem: "5", year: "3" },
    ],
    "MECH": [
        { code: "ME301", title: "Thermodynamics", sem: "5", year: "3" },
        { code: "ME302", title: "Fluid Mechanics", sem: "5", year: "3" },
        { code: "ME303", title: "Machine Design", sem: "5", year: "3" },
        { code: "ME304", title: "Manufacturing Processes", sem: "5", year: "3" },
        { code: "ME305", title: "Theory of Machines", sem: "5", year: "3" },
    ],
    "CIVIL": [
        { code: "CE301", title: "Structural Analysis", sem: "5", year: "3" },
        { code: "CE302", title: "Soil Mechanics", sem: "5", year: "3" },
        { code: "CE303", title: "Fluid Mechanics CE", sem: "5", year: "3" },
        { code: "CE304", title: "Transportation Engineering", sem: "5", year: "3" },
        { code: "CE305", title: "Environmental Engineering", sem: "5", year: "3" },
    ],
    "IT": [
        { code: "IT301", title: "Web Technologies", sem: "5", year: "3" },
        { code: "IT302", title: "Cloud Computing", sem: "5", year: "3" },
        { code: "IT303", title: "Information Security", sem: "5", year: "3" },
        { code: "IT304", title: "Mobile Application Dev", sem: "5", year: "3" },
        { code: "IT305", title: "Data Analytics", sem: "5", year: "3" },
    ],
    "CS": [
        { code: "CSC301", title: "Theory of Computation", sem: "5", year: "3" },
        { code: "CSC302", title: "Compiler Design", sem: "5", year: "3" },
        { code: "CSC303", title: "Computer Architecture", sem: "5", year: "3" },
        { code: "CSC304", title: "Distributed Systems", sem: "5", year: "3" },
        { code: "CSC305", title: "Advanced Algorithms", sem: "5", year: "3" },
    ],
    "AIDS": [
        { code: "AI301", title: "Machine Learning", sem: "5", year: "3" },
        { code: "AI302", title: "Deep Learning", sem: "5", year: "3" },
        { code: "AI303", title: "Data Science", sem: "5", year: "3" },
        { code: "AI304", title: "Natural Language Processing", sem: "5", year: "3" },
        { code: "AI305", title: "Computer Vision", sem: "5", year: "3" },
    ],
    "CSBS": [
        { code: "CB301", title: "Business Analytics", sem: "5", year: "3" },
        { code: "CB302", title: "ERP Systems", sem: "5", year: "3" },
        { code: "CB303", title: "Digital Marketing", sem: "5", year: "3" },
        { code: "CB304", title: "Project Management", sem: "5", year: "3" },
        { code: "CB305", title: "Blockchain Technology", sem: "5", year: "3" },
    ],
};

const CURRICULUM_UNITS = {
    "CS301": [
        { title: "Arrays & Linked Lists", topics: ["Array operations", "Singly linked list", "Doubly linked list", "Circular linked list"], progress: 100 },
        { title: "Trees & Graphs", topics: ["Binary trees", "BST", "AVL trees", "Graph traversal BFS/DFS"], progress: 80 },
        { title: "Sorting Algorithms", topics: ["Bubble sort", "Merge sort", "Quick sort", "Heap sort"], progress: 60 },
        { title: "Dynamic Programming", topics: ["Memoization", "Tabulation", "LCS", "Knapsack problem"], progress: 30 },
        { title: "Graph Algorithms", topics: ["Dijkstra's", "Bellman-Ford", "Floyd-Warshall", "Minimum spanning tree"], progress: 0 },
    ],
    "CS302": [
        { title: "Relational Model", topics: ["ER diagrams", "Relational algebra", "Normalization 1NF-3NF", "BCNF"], progress: 100 },
        { title: "SQL Fundamentals", topics: ["DDL commands", "DML commands", "Joins", "Subqueries"], progress: 100 },
        { title: "Advanced SQL", topics: ["Stored procedures", "Triggers", "Views", "Transactions"], progress: 70 },
        { title: "NoSQL Databases", topics: ["MongoDB", "Document model", "Aggregation pipeline", "Indexing"], progress: 40 },
        { title: "Database Security", topics: ["Access control", "SQL injection", "Encryption", "Audit trails"], progress: 0 },
    ],
    "CS303": [
        { title: "Process Management", topics: ["Process scheduling", "Context switching", "IPC", "Deadlocks"], progress: 100 },
        { title: "Memory Management", topics: ["Paging", "Segmentation", "Virtual memory", "Page replacement"], progress: 80 },
        { title: "File Systems", topics: ["File allocation", "Directory structures", "FAT", "inode"], progress: 50 },
        { title: "Concurrency", topics: ["Mutex", "Semaphores", "Monitors", "Race conditions"], progress: 20 },
        { title: "I/O & Devices", topics: ["Device drivers", "DMA", "RAID", "Disk scheduling"], progress: 0 },
    ],
    "CS304": [
        { title: "Network Fundamentals", topics: ["OSI model", "TCP/IP stack", "IP addressing", "Subnetting"], progress: 100 },
        { title: "Data Link Layer", topics: ["Ethernet", "MAC addressing", "Switching", "VLANs"], progress: 90 },
        { title: "Network Layer", topics: ["Routing protocols", "OSPF", "BGP", "NAT"], progress: 60 },
        { title: "Transport Layer", topics: ["TCP handshake", "UDP", "Flow control", "Congestion control"], progress: 30 },
        { title: "Application Layer", topics: ["HTTP/HTTPS", "DNS", "SMTP", "FTP"], progress: 0 },
    ],
    "CS305": [
        { title: "Software Development Life Cycle", topics: ["Waterfall model", "Agile", "Scrum", "DevOps"], progress: 100 },
        { title: "Requirements Engineering", topics: ["Use cases", "User stories", "SRS document", "Prototyping"], progress: 80 },
        { title: "System Design", topics: ["UML diagrams", "Architecture patterns", "Design patterns", "REST API design"], progress: 60 },
        { title: "Testing", topics: ["Unit testing", "Integration testing", "TDD", "CI/CD"], progress: 30 },
        { title: "Project Management", topics: ["Gantt charts", "Risk management", "Cost estimation", "Quality assurance"], progress: 10 },
    ],
    "CS306": [
        { title: "Introduction to AI", topics: ["Search algorithms", "BFS/DFS in AI", "Heuristics", "A* algorithm"], progress: 100 },
        { title: "Knowledge Representation", topics: ["Predicate logic", "Semantic networks", "Frames", "Ontologies"], progress: 70 },
        { title: "Machine Learning Basics", topics: ["Supervised learning", "Unsupervised learning", "Linear regression", "Classification"], progress: 50 },
        { title: "Neural Networks", topics: ["Perceptron", "Backpropagation", "Activation functions", "Deep learning intro"], progress: 20 },
        { title: "NLP & Computer Vision", topics: ["Tokenization", "Sentiment analysis", "Image recognition", "CNN basics"], progress: 0 },
    ],
};

// Generate units for non-CS departments
const genericUnits = (sub) => [
    { title: `${sub.title} - Fundamentals`, topics: ["Introduction", "Core concepts", "Basic principles", "Applications"], progress: 100 },
    { title: `${sub.title} - Intermediate`, topics: ["Advanced theory", "Problem solving", "Case studies", "Numerical methods"], progress: 70 },
    { title: `${sub.title} - Advanced Topics`, topics: ["Current trends", "Research applications", "Industry practices", "Design projects"], progress: 40 },
    { title: `${sub.title} - Lab & Practicals`, topics: ["Lab experiments", "Simulation", "Analysis", "Report writing"], progress: 20 },
    { title: `${sub.title} - Revision & Assessment`, topics: ["Previous papers", "Mock tests", "Project evaluation", "Viva prep"], progress: 0 },
];

function randBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
}

async function seed() {
    await connectOptionalMongo(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendanceDB');
    if (process.env.USE_SUPABASE !== 'true') {
        console.log('✅ Connected to MongoDB\n');
    }

    // Clear curriculum only (keep existing students/teachers)
    await Curriculum.deleteMany({});
    await Course.deleteMany({});
    await Session.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared curriculum, courses, sessions, attendance\n');

    const departments = Object.keys(DEPT_SUBJECTS);
    const teacherDocs = [];
    const courseDocs = [];

    // ── CREATE / FIND TEACHERS ──────────────────────────────────────────────
    console.log('👩‍🏫 Setting up teachers...');
    for (const dept of departments) {
        const subjects = DEPT_SUBJECTS[dept];
        for (const sub of subjects) {
            const tid = `TCH${sub.code}`;
            let teacher = await Teacher.findOne({ teacherId: tid });
            if (!teacher) {
                teacher = new Teacher({
                    name: `Prof. ${sub.title.split(' ')[0]}`,
                    teacherId: tid,
                    email: `${tid.toLowerCase()}@college.edu`,
                    password: 'teacher123',
                    department: dept,
                    subject: sub.title,
                    subjects: [sub.title],
                    institutionType: 'college',
                    role: 'teacher'
                });
                await teacher.save();
                console.log(`  ✓ Created teacher ${tid} for ${sub.code}`);
            }
            teacherDocs.push({ teacher, subject: sub });
        }
    }

    // ── CREATE COURSES ──────────────────────────────────────────────────────
    console.log('\n📚 Creating courses...');
    for (const { teacher, subject } of teacherDocs) {
        const course = new Course({
            teacherId: teacher._id,
            title: subject.title,
            code: subject.code,
            department: teacher.department,
            year: subject.year,
            semester: subject.sem,
            section: 'A',
            enrolledStudents: []
        });
        await course.save();
        courseDocs.push({ course, teacher, subject });
        console.log(`  ✓ Course ${subject.code} - ${subject.title}`);
    }

    // ── ENROLL STUDENTS ─────────────────────────────────────────────────────
    console.log('\n🎓 Enrolling students into courses...');
    for (const dept of departments) {
        const deptStudents = await Student.find({ department: dept }, '_id').limit(20);
        const deptCourses = courseDocs.filter(c => c.teacher.department === dept);
        for (const { course } of deptCourses) {
            course.enrolledStudents = deptStudents.map(s => s._id);
            await course.save();
        }
        console.log(`  ✓ Enrolled ${deptStudents.length} students in ${deptCourses.length} courses for ${dept}`);
    }

    // ── CREATE SESSIONS & ATTENDANCE ────────────────────────────────────────
    console.log('\n📅 Creating sessions and attendance records...');
    for (const { course, subject } of courseDocs) {
        const students = await Student.find({ _id: { $in: course.enrolledStudents } }, '_id');
        if (students.length === 0) continue;

        // Create 8 sessions per course
        for (let i = 0; i < 8; i++) {
            const daysAgo = (8 - i) * 5; // roughly every 5 days back
            const sessionDate = randDate(daysAgo);
            const code = `${subject.code.slice(-3)}${String(i+1).padStart(2,'0')}${String(randBetween(10,99))}`;
            
            let session;
            try {
                session = await new Session({
                    courseId: course._id,
                    date: sessionDate,
                    topic: `${subject.title} - Session ${i + 1}`,
                    sessionCode: code,
                    isActive: i === 7
                }).save();
            } catch (e) { continue; }

            // Mark attendance for each student
            const statuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Late'];
            for (const student of students) {
                const status = statuses[randBetween(0, 7)];
                try {
                    await new Attendance({ studentId: student._id, sessionId: session._id, status, checkInTime: sessionDate }).save();
                } catch (_) {}
            }
        }
        process.stdout.write('.');
    }
    console.log('\n  ✓ Sessions and attendance created');

    // ── CREATE CURRICULUM ───────────────────────────────────────────────────
    console.log('\n📖 Building subject-wise curriculum...');
    for (const { teacher, subject } of teacherDocs) {
        // Get curriculum units for this subject
        const unitDefs = CURRICULUM_UNITS[subject.code] || genericUnits(subject);
        const units = unitDefs.map((u, idx) => ({
            unit: idx + 1,
            title: u.title,
            progress: u.progress,
            topics: u.topics.map(t => ({ name: t, completed: u.progress === 100 }))
        }));

        await Curriculum.create({
            institutionType: 'college',
            department: teacher.department,
            year: subject.year,
            semester: subject.sem,
            subject: subject.title,
            courseCode: subject.code,
            courseName: subject.title,
            teacher: teacher._id,
            units
        });
        console.log(`  ✓ Curriculum for ${subject.code} - ${subject.title}`);
    }

    // ── SUMMARY ─────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════');
    console.log('✅ DATASET SEEDED SUCCESSFULLY!');
    console.log(`  Teachers created : ${teacherDocs.length}`);
    console.log(`  Courses created  : ${courseDocs.length}`);
    console.log(`  Curriculum docs  : ${await Curriculum.countDocuments()}`);
    console.log(`  Sessions created : ${await Session.countDocuments()}`);
    console.log(`  Attendance recs  : ${await Attendance.countDocuments()}`);
    console.log('\n  LOGIN CREDENTIALS:');
    console.log('  Admin  : admin / admin123');
    console.log('  Teacher: TCHCS301 / teacher123  (CS - Data Structures)');
    console.log('  Student: any existing registerNo / their password');
    console.log('══════════════════════════════════════\n');
    process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
