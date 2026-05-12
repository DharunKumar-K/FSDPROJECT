const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    code: {
        type: String, // e.g., CS101
        required: true
    },
    institutionType: {
        type: String,
        default: "college"
    },
    // College specific
    department: String,
    year: String,
    semester: String,
    section: String, // e.g., "A", "B" — allows same subject with different class groups
    
    // Students enrolled in this course
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }]
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
