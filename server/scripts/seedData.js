require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { getSupabaseClient } = require("../config/supabase");
const crypto = require("crypto");

const supabase = getSupabaseClient();
const uuid = () => crypto.randomUUID();
const hash = async (pw) => bcrypt.hash(pw, 10);
const now = () => new Date().toISOString();
const future = (days) => new Date(Date.now() + days * 86400000).toISOString();
const past = (days) => new Date(Date.now() - days * 86400000).toISOString();

async function insert(table, rows) {
    const { data, error } = await supabase.from(table).insert(rows).select("*");
    if (error) throw new Error(`[${table}] ${error.message}`);
    console.log(`Inserted ${data.length} rows into ${table}`);
    return data;
}

async function seed() {
    // ── ADMINS ────────────────────────────────────────────────────────────────
    const admins = await insert("admins", [
        {
            id: uuid(), name: "Super Admin", admin_id: "ADMIN001",
            institution_type: "college", email: "admin@college.edu",
            password: await hash("Admin@1234"), role: "admin"
        },
        {
            id: uuid(), name: "Deputy Admin", admin_id: "ADMIN002",
            institution_type: "college", email: "deputy@college.edu",
            password: await hash("Admin@5678"), role: "admin"
        }
    ]);

    // ── TEACHERS ──────────────────────────────────────────────────────────────
    const teachers = await insert("teachers", [
        {
            id: uuid(), name: "Dr. Anitha Rajan", teacher_id: "TCH001",
            institution_type: "college", department: "CSE",
            subject: "Data Structures", subjects: ["Data Structures", "Algorithms"],
            email: "anitha@college.edu", password: await hash("Teacher@1234"), role: "teacher"
        },
        {
            id: uuid(), name: "Prof. Karthik Selvam", teacher_id: "TCH002",
            institution_type: "college", department: "CSE",
            subject: "Database Management", subjects: ["DBMS", "SQL"],
            email: "karthik@college.edu", password: await hash("Teacher@1234"), role: "teacher"
        },
        {
            id: uuid(), name: "Dr. Priya Mohan", teacher_id: "TCH003",
            institution_type: "college", department: "ECE",
            subject: "Digital Electronics", subjects: ["Digital Electronics", "VLSI"],
            email: "priya@college.edu", password: await hash("Teacher@1234"), role: "teacher"
        },
        {
            id: uuid(), name: "Prof. Ramesh Kumar", teacher_id: "TCH004",
            institution_type: "college", department: "MECH",
            subject: "Thermodynamics", subjects: ["Thermodynamics", "Fluid Mechanics"],
            email: "ramesh@college.edu", password: await hash("Teacher@1234"), role: "teacher"
        }
    ]);

    // ── STUDENTS ──────────────────────────────────────────────────────────────
    const studentRows = [
        { name: "Aarav Sharma",    register_no: "CS2021001", department: "CSE",  year: "3", semester: "5", email: "aarav@student.edu" },
        { name: "Bhavya Nair",     register_no: "CS2021002", department: "CSE",  year: "3", semester: "5", email: "bhavya@student.edu" },
        { name: "Charan Reddy",    register_no: "CS2021003", department: "CSE",  year: "3", semester: "5", email: "charan@student.edu" },
        { name: "Divya Menon",     register_no: "CS2021004", department: "CSE",  year: "3", semester: "5", email: "divya@student.edu" },
        { name: "Elan Murugan",    register_no: "CS2021005", department: "CSE",  year: "3", semester: "5", email: "elan@student.edu" },
        { name: "Fathima Banu",    register_no: "CS2021006", department: "CSE",  year: "3", semester: "5", email: "fathima@student.edu" },
        { name: "Gowtham Raj",     register_no: "CS2021007", department: "CSE",  year: "3", semester: "5", email: "gowtham@student.edu" },
        { name: "Harini Suresh",   register_no: "CS2021008", department: "CSE",  year: "3", semester: "5", email: "harini@student.edu" },
        { name: "Ishaan Verma",    register_no: "EC2021001", department: "ECE",  year: "3", semester: "5", email: "ishaan@student.edu" },
        { name: "Janani Pillai",   register_no: "EC2021002", department: "ECE",  year: "3", semester: "5", email: "janani@student.edu" },
        { name: "Kiran Babu",      register_no: "EC2021003", department: "ECE",  year: "3", semester: "5", email: "kiran@student.edu" },
        { name: "Lavanya Iyer",    register_no: "EC2021004", department: "ECE",  year: "3", semester: "5", email: "lavanya@student.edu" },
        { name: "Manoj Tiwari",    register_no: "ME2021001", department: "MECH", year: "3", semester: "5", email: "manoj@student.edu" },
        { name: "Nithya Devi",     register_no: "ME2021002", department: "MECH", year: "3", semester: "5", email: "nithya@student.edu" },
        { name: "Om Prakash",      register_no: "ME2021003", department: "MECH", year: "3", semester: "5", email: "om@student.edu" }
    ];
    const pw = await hash("Student@1234");
    const students = await insert("students", studentRows.map(s => ({
        id: uuid(), ...s, institution_type: "college", password: pw, role: "student"
    })));

    const cseStudents = students.filter(s => s.department === "CSE").map(s => s.id);
    const eceStudents = students.filter(s => s.department === "ECE").map(s => s.id);
    const mechStudents = students.filter(s => s.department === "MECH").map(s => s.id);

    const tch = (dept) => teachers.find(t => t.department === dept);

    // ── COURSES ───────────────────────────────────────────────────────────────
    const courses = await insert("courses", [
        {
            id: uuid(), teacher_id: tch("CSE").id, title: "Data Structures & Algorithms",
            code: "CS301", institution_type: "college", department: "CSE",
            year: "3", semester: "5", section: "A", enrolled_students: cseStudents,
            created_at: now(), updated_at: now()
        },
        {
            id: uuid(), teacher_id: teachers[1].id, title: "Database Management Systems",
            code: "CS302", institution_type: "college", department: "CSE",
            year: "3", semester: "5", section: "A", enrolled_students: cseStudents,
            created_at: now(), updated_at: now()
        },
        {
            id: uuid(), teacher_id: tch("ECE").id, title: "Digital Electronics",
            code: "EC301", institution_type: "college", department: "ECE",
            year: "3", semester: "5", section: "A", enrolled_students: eceStudents,
            created_at: now(), updated_at: now()
        },
        {
            id: uuid(), teacher_id: tch("MECH").id, title: "Thermodynamics",
            code: "ME301", institution_type: "college", department: "MECH",
            year: "3", semester: "5", section: "A", enrolled_students: mechStudents,
            created_at: now(), updated_at: now()
        }
    ]);

    // ── SESSIONS ──────────────────────────────────────────────────────────────
    const sessionRows = [];
    for (const course of courses) {
        for (let i = 1; i <= 5; i++) {
            sessionRows.push({
                id: uuid(), course_id: course.id,
                date: past(10 - i),
                topic: `${course.title} - Topic ${i}`,
                session_code: `${course.code}-S${i}`,
                qr_code_string: `ATTENDANCE_SESSION_${course.code}-S${i}`,
                is_active: i === 5,
                created_at: past(10 - i), updated_at: past(10 - i)
            });
        }
    }
    const sessions = await insert("sessions", sessionRows);

    // ── ATTENDANCE ────────────────────────────────────────────────────────────
    const statuses = ["Present", "Present", "Present", "Absent", "Late"];
    const attendanceRows = [];
    for (const session of sessions) {
        const course = courses.find(c => c.id === session.course_id);
        for (const studentId of course.enrolled_students) {
            attendanceRows.push({
                id: uuid(), student_id: studentId, session_id: session.id,
                check_in_time: session.date,
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
    }
    await insert("attendance", attendanceRows);

    // ── CURRICULUM ────────────────────────────────────────────────────────────
    await insert("curriculum", [
        {
            id: uuid(), institution_type: "college", department: "CSE",
            year: "3", semester: "5", course_code: "CS301",
            course_name: "Data Structures & Algorithms",
            units: JSON.stringify([
                { unit: 1, title: "Arrays & Linked Lists", topics: ["Arrays", "Singly Linked List", "Doubly Linked List"] },
                { unit: 2, title: "Stacks & Queues",       topics: ["Stack Operations", "Queue Types", "Priority Queue"] },
                { unit: 3, title: "Trees",                 topics: ["Binary Tree", "BST", "AVL Tree"] },
                { unit: 4, title: "Graphs",                topics: ["BFS", "DFS", "Shortest Path"] },
                { unit: 5, title: "Sorting & Searching",   topics: ["Quick Sort", "Merge Sort", "Binary Search"] }
            ]),
            teacher_id: tch("CSE").id, created_at: now(), updated_at: now()
        },
        {
            id: uuid(), institution_type: "college", department: "CSE",
            year: "3", semester: "5", course_code: "CS302",
            course_name: "Database Management Systems",
            units: JSON.stringify([
                { unit: 1, title: "Introduction to DBMS",  topics: ["ER Model", "Relational Model"] },
                { unit: 2, title: "SQL",                   topics: ["DDL", "DML", "Joins"] },
                { unit: 3, title: "Normalization",         topics: ["1NF", "2NF", "3NF", "BCNF"] },
                { unit: 4, title: "Transactions",          topics: ["ACID", "Concurrency Control"] },
                { unit: 5, title: "Indexing & Hashing",    topics: ["B+ Tree", "Hash Index"] }
            ]),
            teacher_id: teachers[1].id, created_at: now(), updated_at: now()
        },
        {
            id: uuid(), institution_type: "college", department: "ECE",
            year: "3", semester: "5", course_code: "EC301",
            course_name: "Digital Electronics",
            units: JSON.stringify([
                { unit: 1, title: "Number Systems",        topics: ["Binary", "Octal", "Hexadecimal"] },
                { unit: 2, title: "Logic Gates",           topics: ["AND", "OR", "NOT", "NAND", "NOR"] },
                { unit: 3, title: "Combinational Circuits",topics: ["Adder", "Multiplexer", "Decoder"] },
                { unit: 4, title: "Sequential Circuits",   topics: ["Flip-Flops", "Counters", "Registers"] },
                { unit: 5, title: "Memory & PLDs",         topics: ["ROM", "RAM", "FPGA"] }
            ]),
            teacher_id: tch("ECE").id, created_at: now(), updated_at: now()
        },
        {
            id: uuid(), institution_type: "college", department: "MECH",
            year: "3", semester: "5", course_code: "ME301",
            course_name: "Thermodynamics",
            units: JSON.stringify([
                { unit: 1, title: "Basic Concepts",        topics: ["System", "Properties", "State"] },
                { unit: 2, title: "First Law",             topics: ["Heat", "Work", "Internal Energy"] },
                { unit: 3, title: "Second Law",            topics: ["Entropy", "Carnot Cycle"] },
                { unit: 4, title: "Gas Cycles",            topics: ["Otto", "Diesel", "Brayton"] },
                { unit: 5, title: "Steam Power Cycles",    topics: ["Rankine Cycle", "Reheat", "Regeneration"] }
            ]),
            teacher_id: tch("MECH").id, created_at: now(), updated_at: now()
        }
    ]);

    // ── ACTIVITIES ────────────────────────────────────────────────────────────
    const activityRows = [];
    const activityTypes = ["Assignment", "Quiz", "Lab", "Project"];
    for (const course of courses) {
        for (let i = 0; i < 3; i++) {
            activityRows.push({
                id: uuid(), course_id: course.id, student_id: null,
                title: `${activityTypes[i]} ${i + 1} - ${course.code}`,
                description: `${activityTypes[i]} for ${course.title}`,
                type: activityTypes[i],
                deadline: future(7 + i * 3),
                max_score: 100
            });
        }
    }
    const activities = await insert("activities", activityRows);

    // ── SUBMISSIONS ───────────────────────────────────────────────────────────
    const submissionStatuses = ["Submitted", "Graded", "Late"];
    const submissionRows = [];
    for (const activity of activities) {
        const course = courses.find(c => c.id === activity.course_id);
        const enrolled = course.enrolled_students.slice(0, 3); // first 3 students per activity
        for (const studentId of enrolled) {
            const status = submissionStatuses[Math.floor(Math.random() * submissionStatuses.length)];
            submissionRows.push({
                id: uuid(), activity_id: activity.id, student_id: studentId,
                file_url: null,
                notes: "Submitted via portal",
                score: status === "Graded" ? Math.floor(Math.random() * 40) + 60 : null,
                status,
                created_at: past(2), updated_at: past(1)
            });
        }
    }
    await insert("submissions", submissionRows);

    console.log("\n✅ Seed complete!");
    console.log("\nLogin credentials:");
    console.log("  Admin    → admin@college.edu     / Admin@1234");
    console.log("  Teacher  → anitha@college.edu    / Teacher@1234");
    console.log("  Teacher  → karthik@college.edu   / Teacher@1234");
    console.log("  Teacher  → priya@college.edu     / Teacher@1234");
    console.log("  Teacher  → ramesh@college.edu    / Teacher@1234");
    console.log("  Student  → aarav@student.edu     / Student@1234  (reg: CS2021001)");
    console.log("  Student  → ishaan@student.edu    / Student@1234  (reg: EC2021001)");
    console.log("  Student  → manoj@student.edu     / Student@1234  (reg: ME2021001)");
}

seed().catch(err => { console.error("Seed failed:", err.message); process.exit(1); });
