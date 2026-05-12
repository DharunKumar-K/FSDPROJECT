const express = require("express");
const router = express.Router();
const intelligenceController = require("../controllers/intelligenceController");


router.get("/intelligence/aes/:courseId/:studentId", intelligenceController.getEngagementScore);
router.get("/intelligence/timeline/:courseId/:studentId", intelligenceController.getStudentTimeline);
// (Removed AI/ML and advanced/experimental endpoints by user request)

module.exports = router;
