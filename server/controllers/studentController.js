const Student = require("../models/Student");
const jwt = require('jsonwebtoken');
const SECRET = require('../config/jwt');
const csv = require('csv-parser');
const fs = require('fs');

exports.registerStudent = async (req, res) => {
    try {
        const { name, registerNo, email, password, department, year, semester } = req.body;
        if (!name || !registerNo || !email || !password || !department || !year || !semester) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const exists = await Student.findOne({ $or: [{ registerNo }, { email }] });
        if (exists) {
            return res.status(409).json({ error: 'Student already exists' });
        }
        const student = new Student({ name, registerNo, email, password, department, year, semester });
        await student.save();
        res.status(201).json({ message: "Student Registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginStudent = async (req, res) => {
    try {
        const { registerNo, password } = req.body;
        const student = await Student.findOne({ registerNo });
        if (student && await student.comparePassword(password)) {
            const token = jwt.sign({ id: student._id, role: 'student', registerNo: student.registerNo }, SECRET, { expiresIn: '7d' });
            res.status(200).json({ token, user: student });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ registerNo: req.params.registerNo });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'teacher') {
            const Teacher = require('../models/Teacher');
            const teacher = await Teacher.findById(req.user.id);
            if (!teacher) return res.status(404).json({ error: 'Teacher not found. Please log in again.' });
            filter.department = teacher.department;
        }
        const students = await Student.find(filter, '-password').sort({ registerNo: 1 });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete students' });
        }
        
        const student = await Student.findByIdAndDelete(req.params.studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkImportStudents = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can import students' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];
        const errors = [];
        let successCount = 0;
        let failedCount = 0;
        let rowNumber = 1;

        const filePath = req.file.path;

        try {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            for (const row of results) {
                rowNumber++;
                try {
                    const { name, registerNo, email, password, department, year, semester } = row;
                    if (!name || !registerNo || !email || !password || !department || !year || !semester) {
                        errors.push({ row: rowNumber, error: 'Missing required fields' });
                        failedCount++;
                        continue;
                    }
                    if (password.length < 8) {
                        errors.push({ row: rowNumber, error: 'Password must be at least 8 characters' });
                        failedCount++;
                        continue;
                    }
                    const exists = await Student.findOne({ $or: [{ registerNo }, { email }] });
                    if (exists) {
                        errors.push({ row: rowNumber, error: `Student with registerNo ${registerNo} or email ${email} already exists` });
                        failedCount++;
                        continue;
                    }
                    const student = new Student({
                        name: name.trim(),
                        registerNo: registerNo.trim(),
                        email: email.trim(),
                        password: password.trim(),
                        department: department.trim(),
                        year: year.trim(),
                        semester: semester.trim()
                    });
                    await student.save();
                    successCount++;
                } catch (err) {
                    errors.push({ row: rowNumber, error: err.message });
                    failedCount++;
                }
            }
        } finally {
            try { fs.unlinkSync(filePath); } catch (_) {}
        }

        res.status(200).json({
            message: 'Bulk import completed',
            total: results.length,
            success: successCount,
            failed: failedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
