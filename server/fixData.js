require('dotenv').config();
const mongoose = require('mongoose');
const connectOptionalMongo = require('./config/connectOptionalMongo');
const Curriculum = require('./models/Curriculum');
const Attendance = require('./models/Attendance');
const Session    = require('./models/Session');
const Course     = require('./models/Course');
require('./models/Teacher');
require('./models/Student');

const rand    = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (s, e) => new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()));

async function fix() {
    await connectOptionalMongo(process.env.MONGODB_URI);
    if (process.env.USE_SUPABASE !== 'true') {
        console.log('Connected\n');
    }

    // ── 1. FIX CURRICULUM ────────────────────────────────────────────────────
    console.log('Fixing curriculum data...');
    const curriculums = await Curriculum.find({});
    const start = new Date('2024-01-01'), now = new Date();

    for (const cur of curriculums) {
        const fixedUnits = cur.units.map((unit, uidx) => {
            const totalTopics = unit.topics.length;
            // Determine how many topics are completed based on progress
            const completedCount = Math.round((unit.progress / 100) * totalTopics);

            const fixedTopics = unit.topics.map((topic, tidx) => {
                const isCompleted = tidx < completedCount;
                return {
                    _id:           topic._id,
                    name:          topic.name,
                    completed:     isCompleted,
                    // Only set completedDate if actually completed
                    completedDate: isCompleted
                        ? randDate(new Date(start.getTime() + uidx * 30 * 24 * 60 * 60 * 1000), now)
                        : undefined
                };
            });

            // Recalculate progress as exact % of completed topics
            const actualProgress = totalTopics > 0
                ? Math.round((completedCount / totalTopics) * 100)
                : 0;

            return {
                _id:      unit._id,
                unit:     unit.unit,
                title:    unit.title,
                progress: actualProgress,
                topics:   fixedTopics
            };
        });

        await Curriculum.findByIdAndUpdate(cur._id, { $set: { units: fixedUnits } });
    }
    console.log(`✓ Fixed ${curriculums.length} curriculum documents\n`);

    // ── 2. FIX ATTENDANCE — ensure every session has attendance records ───────
    console.log('Fixing attendance — linking sessions properly...');

    // Clear old attendance and rebuild from sessions
    await Attendance.deleteMany({});

    const sessions = await Session.find({}).populate('courseId');
    let attCount = 0;

    for (const session of sessions) {
        const course = session.courseId;
        if (!course || !course.enrolledStudents || course.enrolledStudents.length === 0) continue;

        for (const studentId of course.enrolledStudents) {
            // 85% attendance rate
            if (Math.random() > 0.15) {
                const status = rand(['Present','Present','Present','Present','Late','Absent']);
                await Attendance.create({
                    studentId,
                    sessionId:   session._id,
                    checkInTime: new Date(session.date.getTime() + randInt(0, 1800000)),
                    status
                });
                attCount++;
            }
        }
    }
    console.log(`✓ Created ${attCount} attendance records linked to ${sessions.length} sessions\n`);

    // ── VERIFY ────────────────────────────────────────────────────────────────
    const sampleCur = await Curriculum.findOne().populate('teacher', 'name teacherId');
    console.log('Sample curriculum unit check:');
    sampleCur.units.forEach(u => {
        const completed = u.topics.filter(t => t.completed).length;
        console.log(`  Unit ${u.unit}: progress=${u.progress}%, completed=${completed}/${u.topics.length} topics`);
    });

    const sampleAtt = await Attendance.findOne()
        .populate({ path: 'sessionId', populate: { path: 'courseId', select: 'title code' } });
    console.log('\nSample attendance record:');
    console.log(`  Student: ${sampleAtt.studentId}`);
    console.log(`  Session: ${sampleAtt.sessionId?.sessionCode} — ${sampleAtt.sessionId?.topic}`);
    console.log(`  Course:  ${sampleAtt.sessionId?.courseId?.code} — ${sampleAtt.sessionId?.courseId?.title}`);
    console.log(`  Status:  ${sampleAtt.status}`);
    console.log(`  CheckIn: ${sampleAtt.checkInTime}`);

    console.log('\n✅ All fixes applied.');
    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
