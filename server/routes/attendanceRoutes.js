const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/auth");

router.post("/markAttendance", auth, attendanceController.markAttendance);
router.post("/mark-bulk-attendance", auth, attendanceController.markBulkAttendance);

// MUST come BEFORE /:studentId to avoid "my" being treated as ObjectId
router.get("/attendance/my", auth, attendanceController.getMyAttendance);

// Parameterised routes come AFTER static ones
router.get("/attendance/:studentId", auth, attendanceController.getAttendance);
router.get("/session-attendance/:sessionId", auth, attendanceController.getSessionAttendance);
router.get("/attendance-stats", auth, attendanceController.getAttendanceStats);
router.get("/attendance-stats/:studentId", auth, attendanceController.getAttendanceStats);

module.exports = router;