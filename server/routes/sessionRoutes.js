const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const auth = require("../middleware/auth");

// Only teachers can create or close sessions
router.post("/sessions", auth, (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can create sessions' });
    }
    sessionController.createSession(req, res, next);
});

router.put("/sessions/:sessionId/close", auth, (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can close sessions' });
    }
    sessionController.closeSession(req, res, next);
});

// Both students and teachers can view active sessions
router.get("/sessions", auth, sessionController.getActiveSessions);

module.exports = router;
