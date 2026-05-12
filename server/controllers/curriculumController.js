const Curriculum = require("../models/Curriculum");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

exports.createCurriculum = async (req, res) => {
    try {
        const curriculum = new Curriculum(req.body);
        await curriculum.save();
        res.status(201).json(curriculum);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/curriculum — filters by dept, year, semester, subject
exports.getCurriculum = async (req, res) => {
    try {
        const query = { institutionType: "college" };
        if (req.query.department) query.department = req.query.department;
        if (req.query.year) query.year = req.query.year;
        if (req.query.semester) query.semester = req.query.semester;
        if (req.query.subject) query.subject = req.query.subject;

        const curriculums = await Curriculum.find(query)
            .populate("teacher", "name email teacherId")
            .sort({ subject: 1 });
        res.status(200).json(curriculums);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/curriculum/my — auto-load for logged-in student/teacher
exports.getStudentCurriculum = async (req, res) => {
    try {
        let dept, year, semester;
        if (req.user.role === 'student') {
            const student = await Student.findById(req.user.id);
            if (!student) return res.status(404).json({ error: "Student not found" });
            dept = student.department;
            year = student.year;
            semester = student.semester;
        } else if (req.user.role === 'teacher') {
            const teacher = await Teacher.findById(req.user.id);
            if (!teacher) return res.status(404).json({ error: "Teacher not found" });
            dept = teacher.department;
            year = req.query.year;
            semester = req.query.semester;
        } else {
            dept = req.query.department;
            year = req.query.year;
            semester = req.query.semester;
        }

        const query = { institutionType: "college" };
        if (dept) query.department = dept;
        if (year) query.year = year;
        if (semester) query.semester = semester;

        const curriculums = await Curriculum.find(query)
            .populate("teacher", "name email teacherId")
            .sort({ subject: 1, courseCode: 1 });
        res.status(200).json(curriculums);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCurriculumUnit = async (req, res) => {
    try {
        const { curriculumId, unit, progress } = req.body;
        const updateQuery = { _id: curriculumId, "units.unit": unit };
        const updateData = { $set: { "units.$.progress": progress } };
        const curriculum = await Curriculum.findOneAndUpdate(updateQuery, updateData, { new: true });
        if (!curriculum) return res.status(404).json({ error: "Curriculum or Unit not found" });
        res.status(200).json(curriculum);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addCurriculumUnit = async (req, res) => {
    try {
        const { title, topics, subjectCode } = req.body;
        const teacher = await Teacher.findById(req.user.id);
        if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

        let curriculum = await Curriculum.findOne({
            department: teacher.department,
            courseCode: subjectCode || teacher.subject
        });

        if (!curriculum) {
            curriculum = new Curriculum({
                department: teacher.department,
                subject: subjectCode || teacher.subject,
                courseCode: subjectCode || teacher.subject,
                courseName: subjectCode || teacher.subject,
                institutionType: teacher.institutionType || "college",
                teacher: teacher._id,
                units: []
            });
        }

        let formattedTopics = [];
        if (Array.isArray(topics)) {
            formattedTopics = topics.map(t => ({ name: t, completed: false }));
        } else if (typeof topics === 'string') {
            formattedTopics = topics.split(',').map(t => ({ name: t.trim(), completed: false }));
        }

        const newUnitNumber = curriculum.units.length + 1;
        curriculum.units.push({
            unit: newUnitNumber,
            title: title || `Unit ${newUnitNumber}`,
            progress: 0,
            topics: formattedTopics
        });

        await curriculum.save();
        res.status(200).json(curriculum);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
