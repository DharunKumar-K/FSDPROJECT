const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    topic: {
        type: String,
        required: true
    },
    sessionCode: {
        type: String, // Generated code for students to enter
        required: true,
        unique: true
    },
    qrCodeString: {
        type: String, // Data for generating QR code on frontend
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
