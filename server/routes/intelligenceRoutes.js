const express = require("express");
const router = express.Router();
const intelligenceController = require("../controllers/intelligenceController");
const auth = require("../middleware/auth");

router.get("/intelligence/aes/:courseId/:studentId", auth, intelligenceController.getEngagementScore);
router.get("/intelligence/timeline/:courseId/:studentId", auth, intelligenceController.getStudentTimeline);

module.exports = router;
