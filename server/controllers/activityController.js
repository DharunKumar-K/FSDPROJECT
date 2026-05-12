const Activity = require("../models/Activity");

exports.logActivity = async (req, res) => {
    try {
        const activity = new Activity(req.body);
        await activity.save();
        res.status(201).send("Activity Logged");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ studentId: req.params.studentId });
        res.status(200).json(activities);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
