const Course = require("../models/Course");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Submission = require("../models/Submission");

exports.getAtRiskStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const sessions = await Session.find({ courseId, isActive: false }).select("_id");
        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessionIds.length;
        if (totalSessions === 0) return res.status(200).json([]);

        const course = await Course.findById(courseId).select("enrolledStudents");
        if (!course) return res.status(404).json({ error: "Course not found" });

        const atRisk = [];
        for (const studentId of course.enrolledStudents) {
            const attended = await Attendance.countDocuments({ studentId, sessionId: { $in: sessionIds }, status: "Present" });
            const percent = (attended / totalSessions) * 100;
            if (percent < 75) atRisk.push({ studentId, attendancePercentage: percent.toFixed(2) });
        }
        res.status(200).json(atRisk);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEngagementScore = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        const sessions = await Session.find({ courseId, isActive: false }).select("_id");
        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessionIds.length;

        const attendedSessions = totalSessions > 0
            ? await Attendance.countDocuments({ studentId, sessionId: { $in: sessionIds }, status: "Present" })
            : 0;
        const attendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

        const allCourseActivities = await Activity.find({ courseId }).select("_id");
        const activityIds = allCourseActivities.map(a => a._id);
        const totalActivities = allCourseActivities.length;

        const studentSubmissions = await Submission.find({ studentId, activityId: { $in: activityIds } });

        const completionRate = totalActivities > 0 ? (studentSubmissions.length / totalActivities) * 100 : 0;
        const onTimeCount = studentSubmissions.filter(s => s.status === "On-Time").length;
        const participationScore = studentSubmissions.length > 0 ? (onTimeCount / studentSubmissions.length) * 100 : 0;

        const aes = (attendancePercentage * 0.4) + (participationScore * 0.3) + (completionRate * 0.3);

        res.status(200).json({
            aes: aes.toFixed(2),
            breakdown: { attendancePercentage, participationScore, completionRate }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentTimeline = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        const attendances = await Attendance.find({ studentId }).populate({
            path: "sessionId",
            match: { courseId }
        });

        const timelineAttendances = attendances
            .filter(a => a.sessionId)
            .map(a => ({
                type: "Attendance",
                title: `Attended ${a.sessionId.topic}`,
                date: a.checkInTime,
                status: a.status
            }));

        const allCourseActivities = await Activity.find({ courseId }).select("_id title");
        const activityMap = {};
        allCourseActivities.forEach(a => { activityMap[a._id.toString()] = a.title; });
        const activityIds = allCourseActivities.map(a => a._id);

        const submissions = await Submission.find({ studentId, activityId: { $in: activityIds } });

        const timelineSubmissions = submissions.map(s => ({
            type: "Submission",
            title: `Submitted ${activityMap[s.activityId.toString()]}`,
            date: s.createdAt,
            status: s.status,
            score: s.score
        }));

        const timeline = [...timelineAttendances, ...timelineSubmissions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(timeline);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
