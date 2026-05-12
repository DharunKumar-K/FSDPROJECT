// (Removed AI/ML and advanced/experimental endpoints by user request)
const Course = require("../models/Course");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Submission = require("../models/Submission");
// AI Insight: List students at risk (attendance < 75%) for a course
exports.getAtRiskStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        // Get all sessions for the course
        const sessions = await Session.find({ courseId, isActive: false }).select('_id');
        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessionIds.length;
        if (totalSessions === 0) {
            return res.status(200).json([]); // No sessions, no risk
        }
        // Get all students enrolled in the course
        const course = await Course.findById(courseId).select('enrolledStudents');
        if (!course) return res.status(404).json({ error: 'Course not found' });
        const students = course.enrolledStudents;
        // For each student, count their "Present" attendances in this course
        const atRisk = [];
        for (const studentId of students) {
            const attended = await Attendance.countDocuments({ studentId, sessionId: { $in: sessionIds }, status: 'Present' });
            const percent = totalSessions > 0 ? (attended / totalSessions) * 100 : 0;
            if (percent < 75) {
                atRisk.push({ studentId, attendancePercentage: percent.toFixed(2) });
            }
        }
        res.status(200).json(atRisk);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// (AI-powered insights removed by user request)
// Calculate Academic Engagement Score
exports.getEngagementScore = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        // 1. Attendance Percentage
        const totalSessions = await Session.countDocuments({ courseId, isActive: false }); // Only count completed sessions
        const attendedSessions = await Attendance.countDocuments({ studentId, status: "Present" }); // Need to filter by sessions in this course in a real query, simplified here
        
        let attendancePercentage = 0;
        if (totalSessions > 0) {
            attendancePercentage = (attendedSessions / totalSessions) * 100;
        }

        // 2. Assignment Completion & Participation
        const totalActivities = await Activity.countDocuments({ courseId });
        const submittedActivities = await Submission.countDocuments({ studentId }); // Needs course filter mapping
        
        // Find submissions for activities in this course
        const allCourseActivities = await Activity.find({ courseId }).select('_id');
        const activityIds = allCourseActivities.map(a => a._id);

        const studentSubmissions = await Submission.find({ 
            studentId, 
            activityId: { $in: activityIds } 
        });

        let completionRate = 0;
        if (totalActivities > 0) {
            completionRate = (studentSubmissions.length / totalActivities) * 100;
        }

        let participationScore = 0;
        let onTimeCount = 0;
        studentSubmissions.forEach(sub => {
            if (sub.status === "On-Time") onTimeCount++;
        });

        if (studentSubmissions.length > 0) {
            participationScore = (onTimeCount / studentSubmissions.length) * 100;
        }

        // AES Formula: (Attendance * 0.4) + (Activity Participation * 0.3) + (Assignment Completion * 0.3)
        const aes = (attendancePercentage * 0.4) + (participationScore * 0.3) + (completionRate * 0.3);

        res.status(200).json({
            aes: aes.toFixed(2),
            breakdown: {
                attendancePercentage,
                participationScore,
                completionRate
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate Student Activity Timeline
exports.getStudentTimeline = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        // Fetch Attendances
        // Assuming we need to join Session to get the date
        const attendances = await Attendance.find({ studentId }).populate({
            path: 'sessionId',
            match: { courseId }
        });

        const timelineAttendances = attendances
            .filter(a => a.sessionId) // Only keep those matching the course
            .map(a => ({
                type: 'Attendance',
                title: `Attended ${a.sessionId.topic}`,
                date: a.checkInTime,
                status: a.status
            }));

        // Fetch Submissions
        const allCourseActivities = await Activity.find({ courseId }).select('_id title');
        const activityMap = {};
        allCourseActivities.forEach(a => activityMap[a._id.toString()] = a.title);
        
        const activityIds = allCourseActivities.map(a => a._id);
        const submissions = await Submission.find({ 
            studentId, 
            activityId: { $in: activityIds } 
        });

        const timelineSubmissions = submissions.map(s => ({
            type: 'Submission',
            title: `Submitted ${activityMap[s.activityId.toString()]}`,
            date: s.submittedAt || s.createdAt,
            status: s.status,
            score: s.score
        }));

        // Merge and sort timeline
        let timeline = [...timelineAttendances, ...timelineSubmissions];
        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(timeline);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
