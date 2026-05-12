const Session = require("../models/Session");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

exports.createSession = async (req, res) => {
    try {
        const { courseId, topic, sessionCode } = req.body;
        if (!courseId || !topic || !sessionCode) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Ensure the course belongs to this teacher
        const course = await Course.findOne({ _id: courseId, teacherId: req.user.id });
        if (!course) {
            return res.status(403).json({ error: 'Course does not belong to you' });
        }
        const session = new Session({
            courseId,
            topic,
            sessionCode,
            qrCodeString: `ATTENDANCE_SESSION_${sessionCode}`,
            isActive: true
        });
        await session.save();
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getActiveSessions = async (req, res) => {
    try {
        let allowedCourseIds;

        if (req.user.role === 'teacher') {
            const teacherCourses = await Course.find({ teacherId: req.user.id }, '_id');
            allowedCourseIds = teacherCourses.map(c => c._id.toString());
        } else if (req.user.role === 'student') {
            const enrolledCourses = await Course.find({ enrolledStudents: req.user.id }, '_id');
            allowedCourseIds = enrolledCourses.map(c => c._id.toString());
        }

        const query = { isActive: true };

        if (req.query.courseId) {
            // Verify the requested courseId is within allowed courses
            if (allowedCourseIds && !allowedCourseIds.includes(req.query.courseId)) {
                return res.status(403).json({ error: 'Access denied to this course sessions' });
            }
            query.courseId = req.query.courseId;
        } else if (allowedCourseIds) {
            query.courseId = { $in: allowedCourseIds };
        }

        const sessions = await Session.find(query).populate('courseId', 'title code department section');
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.closeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId).populate('courseId');
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.courseId.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'This session does not belong to your course' });
        }
        session.isActive = false;
        await session.save();
        res.status(200).json({ message: 'Session closed', session });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
