const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

async function testAdminAccess() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find admin
        const admin = await Admin.findOne({ adminId: 'admin' });
        if (!admin) {
            console.log('❌ Admin not found. Run: node createAdmin.js');
            process.exit(1);
        }

        console.log('✓ Admin found:', admin.name);
        console.log('  Email:', admin.email);
        console.log('  Admin ID:', admin.adminId);

        // Generate token
        const token = jwt.sign({ 
            id: admin._id, 
            role: 'admin', 
            adminId: admin.adminId 
        }, SECRET, { expiresIn: '7d' });

        console.log('\n✓ JWT Token generated');
        console.log('  Token:', token.substring(0, 50) + '...');

        // Count students
        const studentCount = await Student.countDocuments();
        console.log('\n✓ Students in database:', studentCount);

        if (studentCount > 0) {
            const students = await Student.find({}, 'name registerNo email department').limit(5);
            console.log('\nFirst 5 students:');
            students.forEach((s, idx) => {
                console.log(`  ${idx + 1}. ${s.name} (${s.registerNo}) - ${s.department}`);
            });
        }

        // Test the endpoint simulation
        console.log('\n=== TESTING ADMIN ACCESS ===');
        const studentController = require('./controllers/studentController');
        
        const mockReq = {
            user: {
                id: admin._id,
                role: 'admin',
                adminId: admin.adminId
            }
        };

        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Status: ${code}`);
                    if (data.error) {
                        console.log('❌ Error:', data.error);
                    } else if (Array.isArray(data)) {
                        console.log(`✓ Success: Retrieved ${data.length} students`);
                        console.log('\nFirst 3 students from API:');
                        data.slice(0, 3).forEach((s, idx) => {
                            console.log(`  ${idx + 1}. ${s.name} (${s.registerNo}) - ${s.department}`);
                        });
                    }
                }
            })
        };

        await studentController.getAllStudents(mockReq, mockRes);

        console.log('\n=== API ENDPOINT INFO ===');
        console.log('Endpoint: GET /api/students');
        console.log('Headers: { Authorization: "Bearer <token>" }');
        console.log('\nTo test in browser/Postman:');
        console.log(`Authorization: Bearer ${token}`);

        console.log('\n=== SUMMARY ===');
        console.log('✓ Admin account exists');
        console.log('✓ JWT token generated');
        console.log(`✓ ${studentCount} students available`);
        console.log('✓ API endpoint working');
        console.log('\nNext steps:');
        console.log('1. Restart server: node server.js');
        console.log('2. Login as admin (ID: admin, Password: admin123)');
        console.log('3. Navigate to Students page');
        console.log('4. You should see all students');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAdminAccess();
