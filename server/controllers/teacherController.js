const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const jwt = require('jsonwebtoken');
const SECRET = require('../config/jwt');

exports.registerTeacher = async (req, res) => {
    try {
        const { name, teacherId, email, password, department, subject } = req.body;
        if (!name || !teacherId || !email || !password || !department || !subject) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const exists = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
        if (exists) {
            return res.status(409).json({ error: 'Teacher already exists' });
        }
        const teacher = new Teacher({ name, teacherId, email, password, department, subject });
        await teacher.save();
        res.status(201).json({ message: "Teacher Registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginTeacher = async (req, res) => {
    try {
        const { teacherId, password } = req.body;
        const teacher = await Teacher.findOne({ teacherId });
        if (teacher && await teacher.comparePassword(password)) {
            const token = jwt.sign({ id: teacher._id, role: 'teacher', teacherId: teacher.teacherId }, SECRET, { expiresIn: '7d' });
            res.status(200).json({ token, user: teacher });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.enrollStudent = async (req, res) => {
    try {
        const { courseId, studentId } = req.body;
        if (!courseId || !studentId) {
            return res.status(400).json({ error: 'courseId and studentId are required' });
        }
        const teacher = await Teacher.findById(req.user.id);
        // Course must belong to this teacher
        const course = await Course.findOne({ _id: courseId, teacherId: req.user.id });
        if (!course) {
            return res.status(403).json({ error: 'Course does not belong to you' });
        }
        // Student must be from same department
        const Student = require('../models/Student');
        const student = await Student.findById(studentId);
        if (!student || student.department !== teacher.department) {
            return res.status(403).json({ error: 'Student is not from your department' });
        }
        if (course.enrolledStudents.includes(studentId)) {
            return res.status(409).json({ error: 'Student already enrolled' });
        }
        course.enrolledStudents.push(studentId);
        await course.save();
        res.status(200).json({ message: 'Student enrolled', course });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id);
        const { title, code, year, semester, section } = req.body;
        if (!title || !code || !year || !semester) {
            return res.status(400).json({ error: 'title, code, year, and semester are required' });
        }
        // Teacher can only create courses in their own department
        // Same subject allowed if section differs
        const duplicate = await Course.findOne({
            teacherId: req.user.id,
            code,
            section: section || null
        });
        if (duplicate) {
            return res.status(409).json({ error: 'Course with this code and section already exists for you' });
        }
        const course = new Course({
            teacherId: req.user.id,
            title,
            code,
            department: teacher.department,
            year,
            semester,
            section: section || null
        });
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacherId: req.user.id });
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({}, '-password').sort({ teacherId: 1 });
        res.status(200).json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherStudents = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id);
        const courses = await Course.find({ teacherId: req.user.id }).populate({
            path: 'enrolledStudents',
            match: { department: teacher.department }
        });
        const studentMap = new Map();
        courses.forEach(course => {
            course.enrolledStudents.forEach(student => {
                if (!studentMap.has(student._id.toString())) {
                    studentMap.set(student._id.toString(), {
                        _id: student._id,
                        name: student.name,
                        registerNo: student.registerNo,
                        email: student.email,
                        department: student.department,
                        year: student.year,
                        semester: student.semester
                    });
                }
            });
        });
        res.status(200).json(Array.from(studentMap.values()));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherDashboard = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id, '-password');
        const courses = await Course.find({ teacherId: req.user.id }).populate({
            path: 'enrolledStudents',
            match: { department: teacher.department }
        });
        
        const studentMap = new Map();
        courses.forEach(course => {
            if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
                course.enrolledStudents.forEach(student => {
                    studentMap.set(student._id.toString(), student);
                });
            }
        });
        
        res.status(200).json({
            teacher,
            totalCourses: courses.length,
            totalStudents: studentMap.size,
            courses: courses.map(c => ({
                _id: c._id,
                title: c.title,
                code: c.code,
                department: c.department,
                year: c.year,
                semester: c.semester,
                enrolledCount: c.enrolledStudents ? c.enrolledStudents.length : 0
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
