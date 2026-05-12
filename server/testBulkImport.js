const mongoose = require('mongoose');
const Student = require('./models/Student');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();

async function testBulkImport() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const filePath = './students_50.csv';
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            process.exit(1);
        }

        console.log('✓ File found:', filePath);
        console.log('📊 Processing CSV...\n');

        const results = [];
        const errors = [];
        let successCount = 0;
        let failedCount = 0;
        let rowNumber = 1;

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    console.log(`✓ Read ${results.length} rows from CSV\n`);
                    console.log('Sample row:', results[0]);
                    console.log('\n📝 Processing students...\n');

                    for (const row of results) {
                        rowNumber++;
                        try {
                            const { name, registerNo, email, password, department, year, semester } = row;
                            
                            // Validate required fields
                            if (!name || !registerNo || !email || !password || !department || !year || !semester) {
                                errors.push({ 
                                    row: rowNumber, 
                                    data: row,
                                    error: 'Missing required fields' 
                                });
                                failedCount++;
                                console.log(`❌ Row ${rowNumber}: Missing fields`);
                                continue;
                            }

                            // Check if student already exists
                            const exists = await Student.findOne({ $or: [{ registerNo }, { email }] });
                            if (exists) {
                                errors.push({ 
                                    row: rowNumber, 
                                    error: `Student with registerNo ${registerNo} or email ${email} already exists` 
                                });
                                failedCount++;
                                console.log(`⚠️  Row ${rowNumber}: Duplicate - ${registerNo}`);
                                continue;
                            }

                            // Create new student
                            const student = new Student({
                                name: name.trim(),
                                registerNo: registerNo.trim(),
                                email: email.trim(),
                                password: password.trim(),
                                department: department.trim(),
                                year: year.trim(),
                                semester: semester.trim()
                            });

                            await student.save();
                            successCount++;
                            console.log(`✓ Row ${rowNumber}: ${name} (${registerNo})`);
                        } catch (err) {
                            errors.push({ row: rowNumber, error: err.message });
                            failedCount++;
                            console.log(`❌ Row ${rowNumber}: ${err.message}`);
                        }
                    }

                    console.log('\n=== IMPORT COMPLETE ===');
                    console.log(`Total rows: ${results.length}`);
                    console.log(`✓ Success: ${successCount}`);
                    console.log(`❌ Failed: ${failedCount}`);
                    
                    if (errors.length > 0) {
                        console.log('\n=== ERRORS ===');
                        errors.slice(0, 5).forEach(err => {
                            console.log(`Row ${err.row}: ${err.error}`);
                        });
                        if (errors.length > 5) {
                            console.log(`... and ${errors.length - 5} more errors`);
                        }
                    }

                    process.exit(0);
                })
                .on('error', (err) => {
                    console.error('❌ CSV parsing error:', err.message);
                    process.exit(1);
                });
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testBulkImport();
