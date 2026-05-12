const express = require("express");
const router = express.Router();
const curriculumController = require("../controllers/curriculumController");
const auth = require("../middleware/auth");

// STATIC routes MUST be defined BEFORE any parameterised routes
// Auto-fetch for logged-in user (student → their dept, teacher → their subjects, admin → query params)
router.get("/curriculum/my", auth, curriculumController.getStudentCurriculum);

// General filtered curriculum fetch
router.get("/curriculum", auth, curriculumController.getCurriculum);

// Teacher-only write operations
router.post("/curriculum", auth, (req, res, next) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can create curriculum' });
    curriculumController.createCurriculum(req, res, next);
});

router.put("/curriculum/unit", auth, (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only teachers can update curriculum' });
    curriculumController.updateCurriculumUnit(req, res, next);
});

router.post("/curriculum/add-unit", auth, (req, res, next) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can add units' });
    curriculumController.addCurriculumUnit(req, res, next);
});

module.exports = router;
