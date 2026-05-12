const Activity = require("../models/Activity");

exports.logActivity = async (req, res) => {
    try {
        const { courseId, title, deadline, maxScore, type, description } = req.body;
        if (!courseId || !title || !deadline) {
            return res.status(400).json({ error: "courseId, title, and deadline are required" });
        }
        const activity = new Activity({ courseId, title, deadline, maxScore, type, description });
        await activity.save();
        res.status(201).json(activity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const requestedId = req.params.studentId;
        if (req.user.role === "student" && req.user.id !== requestedId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const activities = await Activity.find({ studentId: requestedId });
        res.status(200).json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
