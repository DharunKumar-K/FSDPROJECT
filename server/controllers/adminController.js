const Admin = require("../models/Admin");
const jwt = require('jsonwebtoken');
const SECRET = require('../config/jwt');

exports.registerAdmin = async (req, res) => {
    try {
        const { name, adminId, email, password, institutionType } = req.body;
        if (!name || !adminId || !email || !password || !institutionType) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const exists = await Admin.findOne({ $or: [{ adminId }, { email }] });
        if (exists) {
            return res.status(409).json({ error: 'Admin already exists' });
        }
        const admin = new Admin({ name, adminId, email, password, institutionType });
        await admin.save();
        res.status(201).json({ message: "Admin Registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { adminId, password } = req.body;
        const admin = await Admin.findOne({ adminId });
        if (admin && await admin.comparePassword(password)) {
            const token = jwt.sign({ id: admin._id, role: 'admin', adminId: admin.adminId }, SECRET, { expiresIn: '7d' });
            res.status(200).json({ token, user: admin });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
