# 🚀 Quick Start Guide - Coding Challenge Platform

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ MongoDB running (check with `mongod --version`)
- ✅ npm packages installed

## Step-by-Step Setup

### 1. Install Frontend Dependencies

```bash
# Navigate to project root
cd "c:\Users\rkste\Desktop\GITHUB BRO\Web Dev\Coding Society"

# Install canvas-confetti (✅ Already done)
npm install canvas-confetti
```

### 2. Install Backend Dependencies

```bash
# Navigate to backend
cd backend

# Install uuid (✅ Already done)
npm install uuid
```

### 3. Start MongoDB

**Option A: If MongoDB is installed as a service**
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or using services.msc GUI:
# 1. Press Win + R
# 2. Type: services.msc
# 3. Find "MongoDB Server"
# 4. Right-click > Start
```

**Option B: If you have MongoDB in a Docker container**
```bash
docker start mongodb
```

**Option C: Manual MongoDB start**
```bash
# Start MongoDB manually (adjust path to your installation)
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### 4. Verify MongoDB Connection

```bash
# Test connection (should show version)
mongo --eval "db.version()"

# Or connect to MongoDB shell
mongo
```

### 5. Seed Sample Challenges

Once MongoDB is running:

```bash
cd backend
node scripts/seedChallenges.js
```

**Expected Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
✅ Using admin user: admin@codingsociety.com
🗑️  Clearing existing challenges...
📝 Inserting sample challenges...
✅ Successfully seeded 3 challenges!

📋 Challenges created:
   - CC001: Two Sum (Easy)
   - CC002: Reverse String (Easy)
   - CC003: Valid Parentheses (Medium)

🎉 Database seeding complete!
```

### 6. Start Backend Server

```bash
# From backend directory
npm start

# Or if you have a start script:
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ MongoDB Connected
✅ MinIO buckets initialized
```

### 7. Start Frontend Development Server

```bash
# From project root
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 8. Access the Platform

Open your browser and navigate to:

**Challenges List:**
```
http://localhost:5173/challenges
```

**Specific Challenge:**
```
http://localhost:5173/challenges/two-sum
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows Task Manager > Services tab > Look for "MongoDB"
   # Or run:
   tasklist | findstr mongo
   ```

2. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

3. Check MongoDB logs:
   ```
   C:\Program Files\MongoDB\Server\6.0\log\mongod.log
   ```

4. Try alternative connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27019/coding-society
   ```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Monaco Editor Not Loading

**Error:** Monaco editor shows blank screen

**Solution:**
```bash
# Reinstall Monaco editor
npm uninstall @monaco-editor/react
npm install @monaco-editor/react@latest
```

### Canvas Confetti Not Working

**Error:** Success animation doesn't show

**Solution:**
```bash
# Install canvas-confetti
npm install canvas-confetti
```

---

## Testing the Implementation

### 1. Browse Challenges

1. Navigate to `/challenges`
2. You should see 3 sample challenges
3. Filter by difficulty (Easy/Medium/Hard)
4. Search for "Two Sum"

### 2. Solve a Challenge

1. Click on "Two Sum" challenge
2. Select "Python" from language dropdown
3. Write solution:
   ```python
   def two_sum(nums, target):
       seen = {}
       for i, num in enumerate(nums):
           diff = target - num
           if diff in seen:
               return [seen[diff], i]
           seen[num] = i
       return []
   
   if __name__ == '__main__':
       nums = list(map(int, input().split()))
       target = int(input())
       result = two_sum(nums, target)
       print(result[0], result[1])
   ```

4. Click **"Run Code"** to test against visible test cases
5. Click **"Submit"** for full evaluation

### 3. Expected Results

**On "Run Code":**
- Should show 2/2 test cases passed (visible cases)
- Execution time and memory usage displayed
- Console shows success message

**On "Submit":**
- Should evaluate all 4 test cases (2 visible + 2 hidden)
- Success modal appears with confetti animation
- Points awarded (based on difficulty)
- Challenge marked as "Solved"

---

## Next Steps

### Add More Challenges

Create a new challenge using MongoDB shell:

```javascript
db.codingchallenges.insertOne({
  problemId: "CC004",
  title: "Your Challenge Title",
  slug: "your-challenge-title",
  difficulty: "Easy",
  category: "Array",
  problemStatement: {
    description: "Your problem description...",
    inputFormat: "Input format...",
    outputFormat: "Output format...",
    constraints: ["Constraint 1", "Constraint 2"],
    exampleTestCases: [
      {
        input: "sample input",
        output: "expected output",
        explanation: "why this output"
      }
    ]
  },
  testCases: [
    {
      input: "test input",
      expectedOutput: "expected output",
      isHidden: false,
      weight: 1,
      timeLimit: 5000,
      memoryLimit: 128
    }
  ],
  supportedLanguages: ["Python", "Java", "C++"],
  starterCode: { Python: "# Your starter code" },
  tags: ["array", "hash-table"],
  isActive: true,
  createdBy: ObjectId("YOUR_ADMIN_USER_ID"),
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Create Admin Panel for Challenges

Add routes in `backend/routes/challenges.js` for:
- POST `/api/v1/admin/challenges` - Create challenge
- PUT `/api/v1/admin/challenges/:id` - Update challenge
- DELETE `/api/v1/admin/challenges/:id` - Delete challenge

### Enable Leaderboard

Track user statistics:
- Total problems solved
- Acceptance rate
- Average execution time
- Rank calculation

---

## Useful Commands

```bash
# Backend
cd backend
npm start                    # Start backend server
npm run dev                  # Start with nodemon (hot reload)
node scripts/seedChallenges.js  # Seed sample challenges

# Frontend
npm run dev                  # Start Vite dev server
npm run build                # Build for production
npm run preview              # Preview production build

# MongoDB
mongo                        # Open MongoDB shell
show dbs                     # List databases
use coding-society           # Switch to database
db.codingchallenges.find()   # List all challenges
db.usersubmissions.find()    # List all submissions

# Debugging
npm run lint                 # Check for code errors
npm audit                    # Check for security issues
```

---

## System Status Checklist

Before testing, verify:

- [ ] MongoDB is running (port 27017 or 27019)
- [ ] Backend server is running (port 5000)
- [ ] Frontend dev server is running (port 5173)
- [ ] Challenges are seeded (3 sample problems)
- [ ] User is logged in (required for submissions)
- [ ] Piston API is accessible (https://emkc.org/api/v2/piston)

---

## Support Resources

- **Architecture Documentation:** `docs/CODING_CHALLENGE_ARCHITECTURE.md`
- **Setup Guide:** `docs/SETUP_GUIDE.md`
- **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY.md`
- **Piston API Docs:** https://github.com/engineer-man/piston

---

**Status**: Ready to Use 🎉  
**Last Updated**: 2026-01-01
