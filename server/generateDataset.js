const fs = require('fs');
const path = require('path');

// Sample data arrays
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Reyansh', 'Aadhya', 'Ananya', 'Pari', 'Anika', 'Ira',
    'Diya', 'Navya', 'Saanvi', 'Myra', 'Sara', 'Kiara', 'Riya', 'Prisha', 'Anvi', 'Avni',
    'Rohan', 'Aryan', 'Kabir', 'Dhruv', 'Karan', 'Advait', 'Vedant', 'Shivansh', 'Rudra', 'Aayush',
    'Priya', 'Sneha', 'Pooja', 'Neha', 'Anjali', 'Kavya', 'Ishita', 'Tanvi', 'Shruti', 'Meera',
    'Rahul', 'Amit', 'Raj', 'Vikram', 'Nikhil', 'Varun', 'Siddharth', 'Akash', 'Harsh', 'Yash',
    'Divya', 'Nisha', 'Swati', 'Preeti', 'Simran', 'Ritika', 'Sakshi', 'Pallavi', 'Mansi', 'Komal',
    'Arun', 'Suresh', 'Ramesh', 'Mahesh', 'Ganesh', 'Dinesh', 'Rajesh', 'Naresh', 'Hitesh', 'Jitesh',
    'Lakshmi', 'Radha', 'Sita', 'Gita', 'Mira', 'Tara', 'Kiran', 'Jyoti', 'Rekha', 'Usha',
    'Aryan', 'Dev', 'Om', 'Jai', 'Ravi', 'Surya', 'Chandra', 'Indra', 'Agni', 'Vayu'
];

const lastNames = [
    'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Rao', 'Nair', 'Iyer',
    'Joshi', 'Desai', 'Mehta', 'Shah', 'Agarwal', 'Bansal', 'Malhotra', 'Kapoor', 'Chopra', 'Bhatia',
    'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Shukla', 'Saxena', 'Srivastava', 'Tripathi', 'Chaturvedi', 'Dwivedi',
    'Krishnan', 'Menon', 'Pillai', 'Nambiar', 'Kurup', 'Warrier', 'Panicker', 'Kamath', 'Bhat', 'Hegde',
    'Naidu', 'Chowdary', 'Raju', 'Babu', 'Prasad', 'Murthy', 'Sastry', 'Iyengar', 'Srinivasan', 'Ramachandran'
];

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'CSBS'];
const years = ['1', '2', '3', '4'];
const semesters = {
    '1': ['1', '2'],
    '2': ['3', '4'],
    '3': ['5', '6'],
    '4': ['7', '8']
};

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(firstName, lastName, registerNo) {
    const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
    const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
    return `${cleanFirst}.${cleanLast}${registerNo.slice(-3)}@college.edu`;
}

function generateStudents(count) {
    const students = [];
    const usedRegisterNos = new Set();
    const usedEmails = new Set();

    for (let i = 0; i < count; i++) {
        let registerNo;
        let email;
        let firstName;
        let lastName;

        // Generate unique register number
        do {
            const year = 2021 + Math.floor(i / 250); // Distribute across years
            const num = String(i + 1).padStart(3, '0');
            registerNo = `${year}${num}`;
        } while (usedRegisterNos.has(registerNo));
        usedRegisterNos.add(registerNo);

        // Generate unique name and email
        do {
            firstName = getRandomElement(firstNames);
            lastName = getRandomElement(lastNames);
            email = generateEmail(firstName, lastName, registerNo);
        } while (usedEmails.has(email));
        usedEmails.add(email);

        const name = `${firstName} ${lastName}`;
        const department = getRandomElement(departments);
        const year = getRandomElement(years);
        const semester = getRandomElement(semesters[year]);
        const password = 'student123'; // Default password for all

        students.push({
            name,
            registerNo,
            email,
            password,
            department,
            year,
            semester
        });
    }

    return students;
}

function exportToCSV(students, filename) {
    // CSV header
    const header = 'name,registerNo,email,password,department,year,semester\n';
    
    // CSV rows
    const rows = students.map(student => {
        return `${student.name},${student.registerNo},${student.email},${student.password},${student.department},${student.year},${student.semester}`;
    }).join('\n');

    const csvContent = header + rows;
    
    // Write to file
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    
    return filePath;
}

// Generate datasets of different sizes
console.log('📊 GENERATING STUDENT DATASETS...\n');

// Small dataset - 50 students
const students50 = generateStudents(50);
const file50 = exportToCSV(students50, 'students_50.csv');
console.log(`✓ Created: students_50.csv (50 students)`);

// Medium dataset - 100 students
const students100 = generateStudents(100);
const file100 = exportToCSV(students100, 'students_100.csv');
console.log(`✓ Created: students_100.csv (100 students)`);

// Large dataset - 200 students
const students200 = generateStudents(200);
const file200 = exportToCSV(students200, 'students_200.csv');
console.log(`✓ Created: students_200.csv (200 students)`);

// Extra large dataset - 500 students
const students500 = generateStudents(500);
const file500 = exportToCSV(students500, 'students_500.csv');
console.log(`✓ Created: students_500.csv (500 students)`);

console.log('\n=== DATASET GENERATION COMPLETE ===\n');

// Show sample data
console.log('Sample data from students_100.csv (first 5 students):\n');
console.log('name,registerNo,email,password,department,year,semester');
students100.slice(0, 5).forEach(s => {
    console.log(`${s.name},${s.registerNo},${s.email},${s.password},${s.department},${s.year},${s.semester}`);
});

console.log('\n=== STATISTICS ===');
console.log(`Total datasets created: 4`);
console.log(`Total students generated: ${50 + 100 + 200 + 500}`);

// Department distribution for 100 students dataset
const deptCount = {};
students100.forEach(s => {
    deptCount[s.department] = (deptCount[s.department] || 0) + 1;
});

console.log('\nDepartment distribution (100 students dataset):');
Object.entries(deptCount).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
    console.log(`  ${dept}: ${count} students`);
});

console.log('\n=== FILES LOCATION ===');
console.log(`Directory: ${__dirname}`);
console.log('\nFiles created:');
console.log('  - students_50.csv');
console.log('  - students_100.csv');
console.log('  - students_200.csv');
console.log('  - students_500.csv');

console.log('\n=== NEXT STEPS ===');
console.log('1. Choose a dataset file (e.g., students_100.csv)');
console.log('2. Login as admin (ID: admin, Password: admin123)');
console.log('3. Go to Bulk Import page');
console.log('4. Upload the CSV file');
console.log('5. Verify import success');

console.log('\n✅ Ready to upload!');
