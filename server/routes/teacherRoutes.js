
const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const auth = require("../middleware/auth");

router.post("/teacher/register", teacherController.registerTeacher);
router.post("/teacher/login", teacherController.loginTeacher);
router.post("/courses", auth, teacherController.createCourse);
router.post("/courses/enroll", auth, teacherController.enrollStudent);
router.get("/courses", auth, teacherController.getTeacherCourses);
router.get("/teachers", auth, teacherController.getAllTeachers);
router.get("/teacher/students", auth, teacherController.getTeacherStudents);
router.get("/teacher/dashboard", auth, teacherController.getTeacherDashboard);

module.exports = router;
