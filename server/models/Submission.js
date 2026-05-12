const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    fileUrl: String, 
    notes: String,
    score: {
        type: Number,
        default: null // Null means not graded yet
    },
    status: {
        type: String,
        enum: ["On-Time", "Late"],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
