const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const studentController = require("../controllers/studentController");

router.post("/admin/register", adminController.registerAdmin);
router.post("/admin/login", adminController.loginAdmin);

// Admin-only: delete student
router.delete("/students/:studentId", auth, studentController.deleteStudent);

module.exports = router;
