const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const studentController = require("../controllers/studentController");

router.post("/admin/register", auth, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only existing admins can register new admins' });
    }
    adminController.registerAdmin(req, res, next);
});
router.post("/admin/login", adminController.loginAdmin);

// Admin-only: delete student
router.delete("/students/:studentId", auth, studentController.deleteStudent);

module.exports = router;
