const http = require('http');

// Test configuration
const PORT = 5000;
const HOST = 'localhost';

// Get token from command line or use default
const token = process.argv[2] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDY5NDg3YzI3ZTlmZDcyYWM2NTg1MCIsInJvbGUiOiJ0ZWFjaGVyIiwidGVhY2hlcklkIjoiODEiLCJpYXQiOjE3NzgwODY3MzMsImV4cCI6MTc3ODY5MTUzM30.5CbkSPye1hXcnvgiQ2brqz0H9vHe7HvCdd1LJNcz-wg';

console.log('Testing Teacher Students Endpoint...\n');

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/teacher/students',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log('\nResponse Body:');
    
    try {
      const jsonData = JSON.parse(data);
      if (Array.isArray(jsonData)) {
        console.log(`✓ Received ${jsonData.length} students`);
        console.log('\nFirst 3 students:');
        jsonData.slice(0, 3).forEach((student, idx) => {
          console.log(`  ${idx + 1}. ${student.name} (${student.registerNo}) - ${student.department}`);
        });
        
        const student31 = jsonData.find(s => s.registerNo === '31');
        if (student31) {
          console.log(`\n✓ Student 31 found: ${student31.name}`);
        } else {
          console.log(`\n✗ Student 31 NOT found`);
        }
      } else {
        console.log(JSON.stringify(jsonData, null, 2));
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure the server is running on port 5000');
});

req.end();
