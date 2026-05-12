const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidate, hash) => {
    return await bcrypt.compare(candidate, hash);
};

const AdminSchema = new mongoose.Schema({
    name: String,
    adminId: String,
    institutionType: {
        type: String,
        enum: ["school", "college"]
    },
    email: String,
    password: String,
    role: {
        type: String,
        default: "admin"
    }
});

// Hash password before saving
AdminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hashPassword(this.password);
});

// Method to compare password for login
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    return await comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
