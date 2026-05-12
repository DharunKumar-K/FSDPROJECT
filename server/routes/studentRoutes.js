const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const auth = require("../middleware/auth");
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.csv' && ext !== '.xlsx' && ext !== '.xls') {
            return cb(new Error('Only CSV and Excel files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);
router.get("/student/:registerNo", auth, studentController.getStudent);
router.get("/students", auth, studentController.getAllStudents);
router.delete("/student/:studentId", auth, studentController.deleteStudent);
router.post("/bulk-import-students", auth, upload.single('file'), studentController.bulkImportStudents);

module.exports = router;