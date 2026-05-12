const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ["Assignment", "Lab", "Presentation", "Mini Project", "Group Discussion", "Case Study"],
        default: "Assignment"
    },
    deadline: {
        type: Date,
        required: true
    },
    maxScore: {
        type: Number,
        default: 100
    }
});

module.exports = mongoose.model("Activity", ActivitySchema);