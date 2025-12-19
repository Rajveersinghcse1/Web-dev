# 🚀 Admin Panel Setup & Testing Guide

## Quick Start

### 1. Verify Docker Containers
```bash
docker ps
```
Ensure these are running:
- `coding-society-mongodb` (Port 27017)
- `coding-society-minio` (Ports 9000, 9001)

### 2. Start Backend Server
```bash
cd backend
npm install  # If not already done
npm start
```

### 3. Start Frontend Development Server
```bash
npm install  # If not already done
npm run dev
```

### 4. Access Admin Panel
```
URL: http://localhost:3002/admin
Login: admin@codingsociety.com
```

---

## 🔍 Database Inspection Commands

### Connect to MongoDB
```bash
docker exec -it coding-society-mongodb mongosh "mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin"
```

### View Collections
```javascript
db.getCollectionNames()
```

### Check User Count
```javascript
db.users.countDocuments()
```

### View Admin User
```javascript
db.users.findOne({ role: 'admin' })
```

### Check Posts
```javascript
db.posts.find().pretty()
```

### Check System Settings
```javascript
db.systemsettings.findOne()
```

### View User Statistics
```javascript
db.users.aggregate([
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 }
    }
  }
])
```

---

## 🧪 Testing Admin Panel

### Run Integration Check
```bash
cd backend
node scripts/checkAdminPanel.js
```

### Test API Endpoints (using curl)

#### 1. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@codingsociety.com","password":"YOUR_PASSWORD"}'
```

#### 2. Get Users (replace TOKEN)
```bash
curl http://localhost:5000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Get Analytics
```bash
curl http://localhost:5000/api/v1/admin/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Get Settings
```bash
curl http://localhost:5000/api/v1/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. System Health
```bash
curl http://localhost:5000/api/v1/admin/system/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 What Was Created

### Backend Models
- ✅ `AdminAuditLog.js` - Tracks all admin actions
- ✅ `AdminAnalytics.js` - Stores analytics data

### Backend Routes (Enhanced)
- ✅ `/api/v1/admin/users` - User management
- ✅ `/api/v1/admin/users/:id` - User details
- ✅ `/api/v1/admin/users/:id/role` - Update role
- ✅ `/api/v1/admin/users/:id/status` - Update status
- ✅ `/api/v1/admin/analytics/dashboard` - Dashboard metrics
- ✅ `/api/v1/admin/analytics/content` - Content analytics
- ✅ `/api/v1/admin/analytics/engagement` - Engagement stats
- ✅ `/api/v1/admin/settings` - System settings
- ✅ `/api/v1/admin/audit-logs` - Audit logs
- ✅ `/api/v1/admin/system/health` - System health

### Frontend Pages
- ✅ `UserManagement.jsx` - Full user management interface
- ✅ `Analytics.jsx` - Comprehensive analytics dashboard
- ✅ `AdminSettings.jsx` - System settings management

### Scripts
- ✅ `checkAdminPanel.js` - Verify integration
- ✅ `initializeAnalytics.js` - Generate analytics
- ✅ `testAdminPanel.js` - API testing

### Documentation
- ✅ `DATABASE_ANALYSIS_REPORT.md` - Complete analysis

---

## 🎯 Features

### User Management
- [x] List all users with pagination
- [x] Search and filter users
- [x] View user details and statistics
- [x] Update user roles (user/admin/superadmin)
- [x] Update user status (active/inactive/suspended)
- [x] Delete users with audit trail
- [x] Responsive design

### Analytics
- [x] Overview dashboard with key metrics
- [x] User growth trends (charts)
- [x] Content distribution visualization
- [x] User role/status distribution
- [x] Top users leaderboard
- [x] Engagement statistics
- [x] Time range filters
- [x] Real-time data refresh

### Settings
- [x] Site configuration
- [x] Maintenance mode toggle
- [x] Registration control
- [x] Email settings
- [x] Feature flags
- [x] Social media links
- [x] Advanced settings

### Security
- [x] JWT authentication
- [x] Role-based access control
- [x] Audit logging
- [x] Rate limiting
- [x] Input validation
- [x] CORS protection

---

## 🔒 Security Notes

### Admin Access
- Only users with `admin` or `superadmin` role can access
- All actions are logged in `AdminAuditLog`
- IP address and user agent tracked

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Failed login attempts tracked

---

## 🐛 Troubleshooting

### Cannot Connect to Database
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Restart container if needed
docker restart coding-society-mongodb
```

### Admin Login Fails
```bash
# Check admin user exists
docker exec -it coding-society-mongodb mongosh "mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin" --eval "db.users.findOne({role:'admin'})"

# You may need to reset password or create new admin
cd backend
node scripts/createRealAdmin.js
```

### Frontend Cannot Connect to Backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` file
- Ensure CORS is properly configured

### Missing Data in Analytics
```bash
# Generate initial analytics data
cd backend
node scripts/initializeAnalytics.js
```

---

## 📊 Database Schema

### Collections
- `users` - User accounts (1 document)
- `posts` - Social posts (8 documents)
- `librarycontents` - Educational materials (1 document)
- `innovations` - Innovation projects
- `internships` - Internship opportunities  
- `hackathons` - Hackathon events
- `quests` - Learning quests
- `achievements` - User achievements
- `stories` - User stories
- `feedbacks` - User feedback
- `resumes` - User resumes
- `systemsettings` - System configuration
- `adminauditlogs` - Admin action logs (NEW)
- `adminanalytics` - Analytics data (NEW)

---

## 🎨 Frontend Routes

### Admin Pages
```
/admin                    → Main dashboard
/admin/users              → User management
/admin/analytics          → Analytics dashboard
/admin/settings           → System settings
/admin/library            → Library content
/admin/innovation         → Innovation projects
/admin/hackathon          → Hackathon events
```

---

## ✅ Verification Checklist

- [x] Docker containers running
- [x] MongoDB accessible
- [x] Backend server starts without errors
- [x] Frontend development server running
- [x] Admin user exists and active
- [x] New models loaded successfully
- [x] Admin routes accessible
- [x] Authentication working
- [x] Authorization enforced
- [x] Database queries functional

---

## 📞 Support

For issues:
1. Check error logs in terminal
2. Verify MongoDB connection
3. Ensure all environment variables set
4. Review `DATABASE_ANALYSIS_REPORT.md`

---

## 🎉 Success Indicators

You know it's working when:
- ✅ `checkAdminPanel.js` script completes successfully
- ✅ Can login to admin panel
- ✅ User Management page loads with data
- ✅ Analytics dashboard shows charts
- ✅ Settings page displays configuration
- ✅ System health endpoint returns data

**The admin panel is fully functional and ready for production use!**
