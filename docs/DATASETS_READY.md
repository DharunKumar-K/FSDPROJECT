# 📊 STUDENT DATASETS - READY TO DOWNLOAD

## ✅ Datasets Generated Successfully

I've created **4 CSV files** with realistic student data for you to download and use.

---

## 📁 Available Datasets

| File | Students | Size | Use Case |
|------|----------|------|----------|
| **students_50.csv** | 50 | ~3 KB | Small testing |
| **students_100.csv** | 100 | ~6 KB | Medium testing |
| **students_200.csv** | 200 | ~12 KB | Large testing |
| **students_500.csv** | 500 | ~30 KB | Production use |

**Location**: `server/` folder

---

## 📋 Dataset Details

### Format
```csv
name,registerNo,email,password,department,year,semester
```

### Sample Data (First 5 students from 50-student dataset)
```csv
name,registerNo,email,password,department,year,semester
Kavya Desai,2021001,kavya.desai001@college.edu,student123,ECE,1,2
Hitesh Rao,2021002,hitesh.rao002@college.edu,student123,CIVIL,4,7
Vivaan Joshi,2021003,vivaan.joshi003@college.edu,student123,AIDS,3,5
Sai Dubey,2021004,sai.dubey004@college.edu,student123,CSBS,4,7
Krishna Bhatia,2021005,krishna.bhatia005@college.edu,student123,AIDS,4,7
```

### Features
- ✅ **Realistic Indian names** (100 unique first names, 50 last names)
- ✅ **Unique register numbers** (2021001, 2021002, etc.)
- ✅ **Unique email addresses** (firstname.lastname###@college.edu)
- ✅ **Default password** (student123 for all)
- ✅ **8 departments** (CSE, ECE, EEE, MECH, CIVIL, IT, AIDS, CSBS)
- ✅ **4 years** (1st, 2nd, 3rd, 4th)
- ✅ **8 semesters** (1-8, matched to year)
- ✅ **No duplicates** (all registerNo and emails are unique)

---

## 📊 Department Distribution (100-student dataset)

| Department | Students | Percentage |
|------------|----------|------------|
| CIVIL | 15 | 15% |
| EEE | 15 | 15% |
| MECH | 14 | 14% |
| IT | 14 | 14% |
| CSE | 12 | 12% |
| CSBS | 10 | 10% |
| AIDS | 10 | 10% |
| ECE | 10 | 10% |

---

## 📥 How to Download

### Option 1: Direct File Access
Files are located in:
```
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\
```

Files:
- `students_50.csv`
- `students_100.csv`
- `students_200.csv`
- `students_500.csv`

### Option 2: Copy to Desktop
```bash
# Windows Command Prompt
cd c:\Users\Dharun Kumar\fsd\smart-attendance-system\server
copy students_*.csv %USERPROFILE%\Desktop\
```

Now check your Desktop for the CSV files!

---

## 📤 How to Upload

### Step 1: Choose a Dataset
- **Testing**: Use `students_50.csv` or `students_100.csv`
- **Production**: Use `students_200.csv` or `students_500.csv`

### Step 2: Start Servers
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd client
npm start
```

### Step 3: Login as Admin
- Go to: http://localhost:3000/login
- Click "Admin" tab (orange)
- Admin ID: `admin`
- Password: `admin123`

### Step 4: Upload Dataset
1. Click "Bulk Import" button
2. Or navigate to: http://localhost:3000/bulk-import
3. Click "Choose File" or drag & drop
4. Select your CSV file (e.g., `students_100.csv`)
5. Click "Import Students"

### Step 5: Verify Import
- Check success message
- View imported students count
- Go to Students page to see all students

---

## 🎓 Student Login Credentials

All students have the same default password for easy testing:

**Password**: `student123`

### Example Logins:

**Student 1:**
- Register No: `2021001`
- Password: `student123`
- Email: kavya.desai001@college.edu

**Student 2:**
- Register No: `2021002`
- Password: `student123`
- Email: hitesh.rao002@college.edu

**Student 3:**
- Register No: `2021003`
- Password: `student123`
- Email: vivaan.joshi003@college.edu

---

## 🔍 Dataset Statistics

### Total Generated
- **4 datasets**
- **850 total students** (50 + 100 + 200 + 500)
- **850 unique register numbers**
- **850 unique email addresses**

### Name Diversity
- **100 unique first names** (Indian names)
- **50 unique last names** (Indian surnames)
- **5000+ possible combinations**

### Academic Distribution
- **8 departments** (CSE, ECE, EEE, MECH, CIVIL, IT, AIDS, CSBS)
- **4 years** (1st to 4th year)
- **8 semesters** (1 to 8)
- **Realistic year-semester mapping**

---

## 🛠️ Customization

### Change Password for All Students

Open CSV in Excel/Notepad and find-replace:
- Find: `student123`
- Replace: `yourpassword`

### Change Email Domain

Open CSV in Excel/Notepad and find-replace:
- Find: `@college.edu`
- Replace: `@yourdomain.edu`

### Add More Students

Run the generator again with custom count:
```javascript
// Edit generateDataset.js
const students1000 = generateStudents(1000);
const file1000 = exportToCSV(students1000, 'students_1000.csv');
```

---

## ✅ Validation Checklist

Before uploading, verify:
- [ ] File is in CSV format
- [ ] Header row is present
- [ ] All 7 columns are present
- [ ] No empty values
- [ ] Register numbers are unique
- [ ] Emails are unique
- [ ] File size is under 5MB

---

## 📝 Sample Upload Test

### Quick Test (10 students)

Create a small test file:
```csv
name,registerNo,email,password,department,year,semester
Test Student 1,TEST001,test1@college.edu,test123,CSE,1,1
Test Student 2,TEST002,test2@college.edu,test123,ECE,1,1
Test Student 3,TEST003,test3@college.edu,test123,MECH,1,1
```

Upload this first to verify everything works, then upload the full dataset.

---

## 🎯 Expected Results

### After Uploading students_100.csv

**Success Message:**
```
✓ Import completed
✓ 100 students imported
✓ 0 failed
```

**Admin Dashboard:**
- Total Students: 100
- Departments: 8
- Can search/filter students

**Manual Attendance:**
- Teacher 81 needs to be enrolled in courses first
- Or admin can mark attendance for all 100 students

**Student Login:**
- Any student can login with their registerNo and password
- Example: 2021001 / student123

---

## 🔧 Troubleshooting

### Import Failed

**Check 1: File Format**
- Open in Notepad to verify CSV format
- Should have commas, not semicolons
- No special characters

**Check 2: Duplicates**
- If you've uploaded before, delete old data first:
  ```bash
  cd server
  node deleteAllStudents.js
  ```

**Check 3: File Size**
- Must be under 5MB
- All provided datasets are well under this limit

### Partial Import

If some students imported but others failed:
- Check the error report in the UI
- Common issues: duplicate registerNo or email
- Fix the CSV and upload again

---

## 📞 Quick Commands

### View Current Students
```bash
cd server
node -e "
const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Student.countDocuments();
  console.log('Total students:', count);
  const students = await Student.find({}, 'name registerNo department').limit(10);
  console.log('First 10:', students);
  process.exit(0);
});
"
```

### Delete All Students
```bash
cd server
node deleteAllStudents.js
```

### Generate New Dataset
```bash
cd server
node generateDataset.js
```

---

## 📁 File Locations

**Generated CSV Files:**
```
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\students_50.csv
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\students_100.csv
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\students_200.csv
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\students_500.csv
```

**Generator Script:**
```
c:\Users\Dharun Kumar\fsd\smart-attendance-system\server\generateDataset.js
```

---

## 🎉 Summary

✅ **4 datasets created** (50, 100, 200, 500 students)
✅ **850 total students** with realistic data
✅ **All unique** register numbers and emails
✅ **Ready to upload** via Bulk Import page
✅ **Default password** (student123) for easy testing

---

## 🚀 Next Steps

1. **Choose a dataset** (recommend students_100.csv for testing)
2. **Copy to Desktop** (optional, for easy access)
3. **Start servers** (backend + frontend)
4. **Login as admin** (admin / admin123)
5. **Go to Bulk Import** page
6. **Upload CSV file**
7. **Verify import** success
8. **Test student login** (use any registerNo from CSV)

---

**Status**: ✅ Datasets ready to download and upload!

**Recommended**: Start with `students_100.csv` for testing, then use `students_500.csv` for production.
