const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late"],
        default: "Present"
    }
});

module.exports = mongoose.model("Attendance", AttendanceSchema);