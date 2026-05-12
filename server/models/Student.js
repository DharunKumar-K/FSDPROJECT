const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidate, hash) => {
    return await bcrypt.compare(candidate, hash);
};

const StudentSchema = new mongoose.Schema({
    name: String,
    registerNo: String,
    institutionType: {
        type: String,
        default: "college"
    },
    // College fields
    department: String,
    year: String,
    semester: String,
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
        default: "student"
    }
});

// Hash password before saving
StudentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hashPassword(this.password);
});

// Method to compare password for login
StudentSchema.methods.comparePassword = async function (candidatePassword) {
    return await comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model("Student", StudentSchema);