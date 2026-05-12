const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

exports.markAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can mark attendance' });
        const { sessionId, status } = req.body;
        if (!sessionId || !status) return res.status(400).json({ error: 'sessionId and status are required' });
        const session = await Session.findById(sessionId).populate('courseId');
        if (!session) return res.status(404).json({ error: 'Session not found' });
        const enrolled = await Course.findOne({ _id: session.courseId._id, enrolledStudents: req.user.id });
        if (!enrolled) return res.status(403).json({ error: 'You are not enrolled in this course' });
        const existing = await Attendance.findOne({ studentId: req.user.id, sessionId });
        if (existing) return res.status(409).json({ error: 'Attendance already marked for this session' });
        const attendance = new Attendance({ studentId: req.user.id, sessionId, status });
        await attendance.save();
        res.status(200).json({ message: "Attendance Marked", attendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markBulkAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only teachers/admins can mark bulk attendance' });
        }
        const { attendanceRecords } = req.body;
        if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ error: 'attendanceRecords array is required' });
        }
        let markedCount = 0, updatedCount = 0;
        const errors = [];
        for (const record of attendanceRecords) {
            try {
                const { studentId, sessionId, status } = record;
                if (!studentId || !sessionId || !status) { errors.push({ studentId, error: 'Missing required fields' }); continue; }
                if (req.user.role === 'teacher') {
                    const sessionDoc = await Session.findById(sessionId).populate('courseId');
                    if (!sessionDoc || sessionDoc.courseId.teacherId.toString() !== req.user.id) {
                        errors.push({ studentId, error: 'Session does not belong to your course' }); continue;
                    }
                }
                const existing = await Attendance.findOne({ studentId, sessionId });
                if (existing) {
                    existing.status = status; existing.checkInTime = new Date();
                    await existing.save(); updatedCount++;
                } else {
                    await new Attendance({ studentId, sessionId, status }).save(); markedCount++;
                }
            } catch (err) { errors.push({ studentId: record.studentId, error: err.message }); }
        }
        res.status(200).json({ message: 'Bulk attendance processed', marked: markedCount, updated: updatedCount, errors: errors.length > 0 ? errors : undefined });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            const teacherCourses = await Course.find({ teacherId: req.user.id }, '_id enrolledStudents');
            const isEnrolled = teacherCourses.some(c => c.enrolledStudents.map(s => s.toString()).includes(req.params.studentId));
            if (!isEnrolled) return res.status(403).json({ error: 'This student is not in your courses' });
        }
        const attendance = await Attendance.find({ studentId: req.params.studentId })
            .populate({ path: 'sessionId', populate: { path: 'courseId', select: 'title code department year semester' } })
            .sort({ checkInTime: -1 });
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/attendance/my — student/teacher gets their own attendance history
exports.getMyAttendance = async (req, res) => {
    try {
        if (req.user.role === 'student') {
            const attendance = await Attendance.find({ studentId: req.user.id })
                .populate({ path: 'sessionId', populate: { path: 'courseId', select: 'title code department year semester' } })
                .sort({ checkInTime: -1 });

            // Group by subject (course)
            const grouped = {};
            for (const rec of attendance) {
                const course = rec.sessionId?.courseId;
                const key = course?.code || 'Unknown';
                if (!grouped[key]) {
                    grouped[key] = {
                        courseCode: key,
                        courseTitle: course?.title || 'Unknown Subject',
                        department: course?.department || '',
                        year: course?.year || '',
                        semester: course?.semester || '',
                        records: [],
                        total: 0, present: 0, absent: 0, late: 0
                    };
                }
                grouped[key].records.push({
                    _id: rec._id,
                    date: rec.checkInTime,
                    status: rec.status,
                    topic: rec.sessionId?.topic || '',
                    sessionCode: rec.sessionId?.sessionCode || ''
                });
                grouped[key].total++;
                if (rec.status === 'Present') grouped[key].present++;
                else if (rec.status === 'Absent') grouped[key].absent++;
                else if (rec.status === 'Late') grouped[key].late++;
            }

            const result = Object.values(grouped).map(g => ({
                ...g,
                percentage: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0
            }));
            return res.status(200).json(result);
        }

        if (req.user.role === 'teacher') {
            // Teacher: get sessions they created, with attendance summary per session
            const courses = await Course.find({ teacherId: req.user.id });
            const courseIds = courses.map(c => c._id);
            const sessions = await Session.find({ courseId: { $in: courseIds } })
                .populate('courseId', 'title code department year semester')
                .sort({ createdAt: -1 });

            const result = [];
            for (const session of sessions) {
                const records = await Attendance.find({ sessionId: session._id })
                    .populate('studentId', 'name registerNo department');
                const total = records.length;
                const present = records.filter(r => r.status === 'Present').length;
                const absent = records.filter(r => r.status === 'Absent').length;
                const late = records.filter(r => r.status === 'Late').length;
                result.push({
                    _id: session._id,
                    date: session.createdAt,
                    topic: session.topic,
                    sessionCode: session.sessionCode,
                    courseCode: session.courseId?.code,
                    courseTitle: session.courseId?.title,
                    department: session.courseId?.department,
                    year: session.courseId?.year,
                    semester: session.courseId?.semester,
                    total, present, absent, late,
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                    students: records.map(r => ({
                        name: r.studentId?.name,
                        registerNo: r.studentId?.registerNo,
                        status: r.status
                    }))
                });
            }
            return res.status(200).json(result);
        }

        if (req.user.role === 'admin') {
            const sessions = await Session.find({})
                .populate('courseId', 'title code department year semester')
                .sort({ createdAt: -1 });
            const result = [];
            for (const session of sessions) {
                const records = await Attendance.find({ sessionId: session._id })
                    .populate('studentId', 'name registerNo department');
                const total = records.length;
                const present = records.filter(r => r.status === 'Present').length;
                const absent = records.filter(r => r.status === 'Absent').length;
                const late = records.filter(r => r.status === 'Late').length;
                result.push({
                    _id: session._id,
                    date: session.createdAt,
                    topic: session.topic,
                    sessionCode: session.sessionCode,
                    courseCode: session.courseId?.code,
                    courseTitle: session.courseId?.title,
                    department: session.courseId?.department,
                    year: session.courseId?.year,
                    semester: session.courseId?.semester,
                    total, present, absent, late,
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                    students: records.map(r => ({
                        name: r.studentId?.name,
                        registerNo: r.studentId?.registerNo,
                        status: r.status
                    }))
                });
            }
            return res.status(200).json(result);
        }

        res.status(403).json({ error: 'Unauthorized' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSessionAttendance = async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            const session = await Session.findById(req.params.sessionId).populate('courseId');
            if (!session || session.courseId.teacherId.toString() !== req.user.id) {
                return res.status(403).json({ error: 'This session does not belong to your course' });
            }
        }
        const attendance = await Attendance.find({ sessionId: req.params.sessionId })
            .populate('studentId', 'name registerNo department')
            .sort({ checkInTime: -1 });
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAttendanceStats = async (req, res) => {
    try {
        const studentId = req.user.role === 'student' ? req.user.id : req.params.studentId;
        if (req.user.role === 'teacher') {
            const teacherCourses = await Course.find({ teacherId: req.user.id }, '_id enrolledStudents');
            const isEnrolled = teacherCourses.some(c => c.enrolledStudents.map(s => s.toString()).includes(studentId));
            if (!isEnrolled) return res.status(403).json({ error: 'This student is not in your courses' });
        }
        const totalAttendance = await Attendance.countDocuments({ studentId });
        const presentCount = await Attendance.countDocuments({ studentId, status: 'Present' });
        const absentCount = await Attendance.countDocuments({ studentId, status: 'Absent' });
        const lateCount = await Attendance.countDocuments({ studentId, status: 'Late' });
        const percentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
        res.status(200).json({ total: totalAttendance, present: presentCount, absent: absentCount, late: lateCount, percentage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
