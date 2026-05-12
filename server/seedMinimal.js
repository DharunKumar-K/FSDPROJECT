/**
 * MINIMAL SEED — Only what's needed to demo the system.
 * Creates: 3 students/dept, 1 teacher/dept, 3 subjects/dept,
 *          4 sessions/subject, attendance for all students.
 * Clears EVERYTHING first (students, teachers, curriculum, sessions, attendance).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectOptionalMongo = require('./config/connectOptionalMongo');

const Student   = require('./models/Student');
const Teacher   = require('./models/Teacher');
const Course    = require('./models/Course');
const Session   = require('./models/Session');
const Attendance= require('./models/Attendance');
const Curriculum= require('./models/Curriculum');
const Admin     = require('./models/Admin');

// ── DATA DEFINITION ──────────────────────────────────────────────────────────
const DEPTS = [
  {
    dept: 'CSE', year: '3', sem: '5',
    teacher: { name: 'Dr. Anitha Kumar', id: 'TCSE01', email: 'anitha.cse@college.edu' },
    students: [
      { name: 'Ravi Shankar',  reg: 'CS2021001', email: 'ravi.cs@student.edu' },
      { name: 'Priya Nair',    reg: 'CS2021002', email: 'priya.cs@student.edu' },
      { name: 'Karthik Raja',  reg: 'CS2021003', email: 'karthik.cs@student.edu' },
    ],
    subjects: [
      { code: 'CS301', title: 'Data Structures', units: [
          { t: 'Arrays & Linked Lists', topics: ['Array ops','Singly linked list','Doubly linked list'], prog: 100 },
          { t: 'Trees & Graphs',        topics: ['Binary trees','BST','Graph BFS/DFS'],               prog: 70  },
          { t: 'Sorting Algorithms',    topics: ['Bubble sort','Merge sort','Quick sort'],             prog: 40  },
        ]},
      { code: 'CS302', title: 'Database Systems', units: [
          { t: 'Relational Model', topics: ['ER diagrams','Normalization','Keys'],  prog: 100 },
          { t: 'SQL Basics',       topics: ['DDL','DML','Joins','Subqueries'],       prog: 80  },
          { t: 'NoSQL & Security', topics: ['MongoDB','Redis','SQL injection'],      prog: 30  },
        ]},
      { code: 'CS303', title: 'Operating Systems', units: [
          { t: 'Process Management', topics: ['Scheduling','IPC','Deadlocks'], prog: 100 },
          { t: 'Memory Management', topics: ['Paging','Segmentation','VMem'],  prog: 50  },
          { t: 'File Systems',      topics: ['FAT','inode','NTFS'],            prog: 0   },
        ]},
    ],
  },
  {
    dept: 'ECE', year: '3', sem: '5',
    teacher: { name: 'Dr. Senthil Raj', id: 'TECE01', email: 'senthil.ece@college.edu' },
    students: [
      { name: 'Divya Menon',    reg: 'EC2021001', email: 'divya.ec@student.edu' },
      { name: 'Arjun Pillai',   reg: 'EC2021002', email: 'arjun.ec@student.edu' },
      { name: 'Sneha Krishnan', reg: 'EC2021003', email: 'sneha.ec@student.edu' },
    ],
    subjects: [
      { code: 'EC301', title: 'VLSI Design', units: [
          { t: 'CMOS Fundamentals', topics: ['NMOS','PMOS','Inverter design'], prog: 100 },
          { t: 'Logic Synthesis',   topics: ['Boolean algebra','K-map','SOP'], prog: 60  },
          { t: 'Layout Design',     topics: ['Stick diagrams','DRC','LVS'],    prog: 20  },
        ]},
      { code: 'EC302', title: 'Embedded Systems', units: [
          { t: 'Microcontrollers', topics: ['8051','ARM Cortex','GPIO'],       prog: 100 },
          { t: 'RTOS',            topics: ['FreeRTOS','Task scheduling','ISR'],prog: 50  },
          { t: 'IoT Protocols',   topics: ['MQTT','BLE','Zigbee'],             prog: 10  },
        ]},
      { code: 'EC303', title: 'Communication Systems', units: [
          { t: 'Analog Modulation', topics: ['AM','FM','Phase modulation'],    prog: 100 },
          { t: 'Digital Comm',      topics: ['PCM','ASK','PSK','QAM'],         prog: 70  },
          { t: 'Wireless Systems',  topics: ['OFDM','MIMO','5G basics'],       prog: 0   },
        ]},
    ],
  },
  {
    dept: 'AIDS', year: '3', sem: '5',
    teacher: { name: 'Dr. Lakshmi Priya', id: 'TAIDS01', email: 'lakshmi.ai@college.edu' },
    students: [
      { name: 'Arun Balaji',    reg: 'AI2021001', email: 'arun.ai@student.edu' },
      { name: 'Meena Sundaram', reg: 'AI2021002', email: 'meena.ai@student.edu' },
      { name: 'Vijay Kumar',    reg: 'AI2021003', email: 'vijay.ai@student.edu' },
    ],
    subjects: [
      { code: 'AI301', title: 'Machine Learning', units: [
          { t: 'Supervised Learning',   topics: ['Linear regression','Logistic regression','SVM'], prog: 100 },
          { t: 'Unsupervised Learning', topics: ['K-Means','PCA','Autoencoders'],                  prog: 60  },
          { t: 'Model Evaluation',      topics: ['Cross-validation','ROC','Confusion matrix'],      prog: 20  },
        ]},
      { code: 'AI302', title: 'Deep Learning', units: [
          { t: 'Neural Networks', topics: ['Perceptron','Backpropagation','Activation fns'], prog: 100 },
          { t: 'CNNs',           topics: ['Convolution','Pooling','ResNet','VGG'],           prog: 50  },
          { t: 'Transformers',   topics: ['Attention','BERT','GPT basics'],                  prog: 0   },
        ]},
      { code: 'AI303', title: 'Data Science', units: [
          { t: 'Data Wrangling',  topics: ['Pandas','NumPy','Missing values','Outliers'],  prog: 100 },
          { t: 'Visualization',   topics: ['Matplotlib','Seaborn','Plotly','Dashboards'],  prog: 80  },
          { t: 'Statistical Tests', topics: ['Hypothesis testing','ANOVA','Chi-square'],   prog: 30  },
        ]},
    ],
  },
  {
    dept: 'MECH', year: '3', sem: '5',
    teacher: { name: 'Dr. Ramesh Babu', id: 'TMECH01', email: 'ramesh.mech@college.edu' },
    students: [
      { name: 'Suresh Naidu',   reg: 'ME2021001', email: 'suresh.me@student.edu' },
      { name: 'Kavitha Rao',    reg: 'ME2021002', email: 'kavitha.me@student.edu' },
      { name: 'Dinesh Kumar',   reg: 'ME2021003', email: 'dinesh.me@student.edu' },
    ],
    subjects: [
      { code: 'ME301', title: 'Thermodynamics', units: [
          { t: 'Laws of Thermodynamics', topics: ['Zeroth law','First law','Second law','Entropy'], prog: 100 },
          { t: 'Thermodynamic Cycles',   topics: ['Carnot','Rankine','Otto','Diesel'],              prog: 70  },
          { t: 'Heat Transfer',          topics: ['Conduction','Convection','Radiation'],           prog: 30  },
        ]},
      { code: 'ME302', title: 'Fluid Mechanics', units: [
          { t: 'Fluid Properties', topics: ['Viscosity','Density','Surface tension'],   prog: 100 },
          { t: 'Flow Analysis',    topics: ["Bernoulli's","Continuity eq","Reynolds no"],prog: 60  },
          { t: 'Turbomachinery',   topics: ['Pumps','Turbines','Compressors'],          prog: 10  },
        ]},
      { code: 'ME303', title: 'Machine Design', units: [
          { t: 'Stress Analysis',  topics: ['Principal stresses','Mohr circle','Factor of safety'], prog: 100 },
          { t: 'Shaft & Keys',     topics: ['Torsion','Bending','Keyways'],                        prog: 50  },
          { t: 'Gear Design',      topics: ['Spur gears','Helical gears','Gear trains'],            prog: 0   },
        ]},
    ],
  },
  {
    dept: 'IT', year: '3', sem: '5',
    teacher: { name: 'Dr. Saranya Devi', id: 'TIT01', email: 'saranya.it@college.edu' },
    students: [
      { name: 'Nithya Priya',  reg: 'IT2021001', email: 'nithya.it@student.edu' },
      { name: 'Bharath Raja',  reg: 'IT2021002', email: 'bharath.it@student.edu' },
      { name: 'Geetha Murali', reg: 'IT2021003', email: 'geetha.it@student.edu' },
    ],
    subjects: [
      { code: 'IT301', title: 'Web Technologies', units: [
          { t: 'HTML & CSS',    topics: ['Semantic HTML','Flexbox','Grid','Animations'],       prog: 100 },
          { t: 'JavaScript',    topics: ['ES6+','DOM','Async/Await','Fetch API'],               prog: 80  },
          { t: 'React & Node',  topics: ['Components','Hooks','Express','REST APIs'],           prog: 40  },
        ]},
      { code: 'IT302', title: 'Cloud Computing', units: [
          { t: 'Cloud Fundamentals', topics: ['IaaS/PaaS/SaaS','AWS','Azure','GCP'],           prog: 100 },
          { t: 'Containers',         topics: ['Docker','Kubernetes','Microservices'],           prog: 50  },
          { t: 'Serverless',         topics: ['AWS Lambda','API Gateway','Cloud functions'],    prog: 0   },
        ]},
      { code: 'IT303', title: 'Information Security', units: [
          { t: 'Cryptography',     topics: ['Symmetric','Asymmetric','Hash functions','PKI'],  prog: 100 },
          { t: 'Network Security', topics: ['Firewalls','VPN','IDS/IPS','SSL/TLS'],             prog: 60  },
          { t: 'Ethical Hacking',  topics: ['Pen testing','OWASP','CVE','Metasploit'],          prog: 20  },
        ]},
    ],
  },
];

const SESSIONS_PER_SUBJECT = 4;
const STATUSES = ['Present', 'Present', 'Present', 'Absent', 'Late'];

function randStatus() { return STATUSES[Math.floor(Math.random() * STATUSES.length)]; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function seed() {
  await connectOptionalMongo(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendanceDB');
  if (process.env.USE_SUPABASE !== 'true') {
    console.log('✅ Connected\n');
  }

  // ── WIPE EVERYTHING ──────────────────────────────────────────────────────
  console.log('🗑️  Clearing all data...');
  await Promise.all([
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Course.deleteMany({}),
    Session.deleteMany({}),
    Attendance.deleteMany({}),
    Curriculum.deleteMany({}),
  ]);

  // Re-seed admin
  const existAdmin = await Admin.findOne({ username: 'admin' });
  if (!existAdmin) {
    const Admin_ = require('./models/Admin');
    await new Admin_({ username: 'admin', password: await hash('admin123'), role: 'admin' }).save();
    console.log('  ✓ Admin created: admin / admin123');
  } else {
    console.log('  ✓ Admin already exists');
  }
  console.log('');

  // ── SEED PER DEPARTMENT ──────────────────────────────────────────────────
  for (const d of DEPTS) {
    console.log(`📂 ${d.dept}`);

    // Teacher
    const teacher = await new Teacher({
      name: d.teacher.name,
      teacherId: d.teacher.id,
      email: d.teacher.email,
      password: 'teacher123',
      department: d.dept,
      subject: d.subjects[0].title,
      subjects: d.subjects.map(s => s.title),
      institutionType: 'college',
      role: 'teacher',
    }).save();
    console.log(`  👩‍🏫 Teacher: ${d.teacher.id} / teacher123`);

    // Students
    const studentDocs = [];
    for (const st of d.students) {
      const s = await new Student({
        name: st.name, registerNo: st.reg, email: st.email,
        password: 'student123', department: d.dept,
        year: d.year, semester: d.sem,
      }).save();
      studentDocs.push(s);
    }
    console.log(`  🎓 Students: ${d.students.map(s => s.reg).join(', ')} / student123`);

    // For each subject
    for (const sub of d.subjects) {

      // Course
      const course = await new Course({
        teacherId: teacher._id,
        title: sub.title,
        code: sub.code,
        department: d.dept,
        year: d.year,
        semester: d.sem,
        section: 'A',
        enrolledStudents: studentDocs.map(s => s._id),
      }).save();

      // Curriculum
      await new Curriculum({
        institutionType: 'college',
        department: d.dept,
        year: d.year,
        semester: d.sem,
        subject: sub.title,
        courseCode: sub.code,
        courseName: sub.title,
        teacher: teacher._id,
        units: sub.units.map((u, i) => ({
          unit: i + 1,
          title: u.t,
          progress: u.prog,
          topics: u.topics.map(tp => ({ name: tp, completed: u.prog === 100 })),
        })),
      }).save();

      // Sessions + Attendance
      for (let si = 0; si < SESSIONS_PER_SUBJECT; si++) {
        const sessionDate = daysAgo((SESSIONS_PER_SUBJECT - si) * 7);
        const code = `${sub.code.slice(-3)}S${si + 1}${d.dept.slice(0,2)}`;
        const session = await new Session({
          courseId: course._id,
          date: sessionDate,
          topic: `${sub.title} - Session ${si + 1}`,
          sessionCode: code,
          isActive: si === SESSIONS_PER_SUBJECT - 1,
        }).save();

        for (const stu of studentDocs) {
          await new Attendance({
            studentId: stu._id,
            sessionId: session._id,
            status: randStatus(),
            checkInTime: sessionDate,
          }).save();
        }
      }

      console.log(`  📚 ${sub.code} ${sub.title} — ${SESSIONS_PER_SUBJECT} sessions, curriculum loaded`);
    }
    console.log('');
  }

  // ── FINAL SUMMARY ────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════');
  console.log('✅ MINIMAL SEED COMPLETE');
  console.log(`  Departments : ${DEPTS.length}`);
  console.log(`  Students    : ${await Student.countDocuments()} (3 per dept)`);
  console.log(`  Teachers    : ${await Teacher.countDocuments()} (1 per dept)`);
  console.log(`  Courses     : ${await Course.countDocuments()}`);
  console.log(`  Curriculum  : ${await Curriculum.countDocuments()} subjects`);
  console.log(`  Sessions    : ${await Session.countDocuments()}`);
  console.log(`  Attendance  : ${await Attendance.countDocuments()} records`);
  console.log('');
  console.log('  LOGINS:');
  console.log('  Admin  → admin / admin123');
  console.log('  Teacher (CSE) → TCSE01 / teacher123');
  console.log('  Teacher (ECE) → TECE01 / teacher123');
  console.log('  Teacher (AIDS)→ TAIDS01 / teacher123');
  console.log('  Teacher (MECH)→ TMECH01 / teacher123');
  console.log('  Teacher (IT)  → TIT01 / teacher123');
  console.log('  Student → CS2021001 / student123');
  console.log('══════════════════════════════════════════\n');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
