const mongoose = require("mongoose");

const CurriculumSchema = new mongoose.Schema({
    institutionType: {
        type: String,
        enum: ["school", "college"],
        required: true
    },
    // School
    class: String,
    subject: String,
    // College
    department: String,
    year: String,
    semester: String,
    courseCode: String,
    courseName: String,
    
    // Common
    units: [{
        unit: Number,
        progress: {
            type: Number,
            default: 0
        },
        title: String,
        topics: [{
            name: String,
            completed: {
                type: Boolean,
                default: false
            },
            completedDate: Date
        }]
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    }
}, { timestamps: true });

module.exports = mongoose.model("Curriculum", CurriculumSchema);
