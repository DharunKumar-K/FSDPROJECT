const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");

// Only teachers can add activities
router.post("/addActivity", auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can add activities' });
    }
    const { courseId, title, deadline, maxScore, type } = req.body;
    if (!courseId || !title || !deadline) {
      return res.status(400).json({ error: 'courseId, title, and deadline are required' });
    }
    const activity = new Activity({ courseId, title, deadline, maxScore, type });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Only students can submit activities
router.post("/submitActivity", auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit tasks' });
    }
    const { activityId, notes, fileUrl } = req.body;
    if (!activityId) {
      return res.status(400).json({ error: 'activityId is required' });
    }
    
    // Check if activity exists and calculate status (On-Time / Late)
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    
    const status = new Date() > new Date(activity.deadline) ? "Late" : "On-Time";
    
    const submission = new Submission({
      activityId,
      studentId: req.user.id,
      notes,
      fileUrl,
      status
    });
    
    await submission.save();
    res.json({ message: "Task Submitted successfully", status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List activities. Optional query param `courseId` to filter by course.
router.get('/activities', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    const activities = await Activity.find(filter).sort({ deadline: 1 });
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
