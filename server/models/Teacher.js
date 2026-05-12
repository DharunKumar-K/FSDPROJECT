const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidate, hash) => {
    return await bcrypt.compare(candidate, hash);
};

const TeacherSchema = new mongoose.Schema({
    name: String,
    teacherId: String,
    institutionType: {
        type: String,
        default: "college"
    },
    // College
    department: String,
    subject: String,
    subjects: [String],
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "teacher"
    }
});

// Hash password before saving
TeacherSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hashPassword(this.password);
});

// Method to compare password for login
TeacherSchema.methods.comparePassword = async function (candidatePassword) {
    return await comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model("Teacher", TeacherSchema);
