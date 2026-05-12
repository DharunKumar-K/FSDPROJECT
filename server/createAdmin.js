const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ adminId: 'admin' });
        if (existingAdmin) {
            console.log('✓ Admin account already exists');
            console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
            console.log('Admin ID: admin');
            console.log('Password: admin123');
            console.log('Email:', existingAdmin.email);
            console.log('\nLogin at: http://localhost:3000/login');
            console.log('Select "Admin Portal" and use the credentials above');
            process.exit(0);
        }

        // Create new admin
        const admin = new Admin({
            name: 'System Administrator',
            adminId: 'admin',
            email: 'admin@college.edu',
            password: 'admin123',
            institutionType: 'college',
            role: 'admin'
        });

        await admin.save();
        
        console.log('✓ Admin account created successfully!\n');
        console.log('=== ADMIN LOGIN CREDENTIALS ===');
        console.log('Admin ID: admin');
        console.log('Password: admin123');
        console.log('Email: admin@college.edu');
        console.log('\nLogin at: http://localhost:3000/login');
        console.log('Select "Admin Portal" and use the credentials above');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
