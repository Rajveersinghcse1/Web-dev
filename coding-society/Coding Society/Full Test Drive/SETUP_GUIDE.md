# 🚀 Full Test Drive - Quick Setup Guide

## ❌ Current Errors Explained

The errors you're seeing are expected because:

1. **Backend Server Not Running**: The console is trying to connect to `localhost:5000` but no server is running
2. **Missing Favicon**: Browser looking for favicon.ico (now fixed ✅)
3. **Connection Refused**: All API endpoints return `ERR_CONNECTION_REFUSED`

## ✅ Quick Fix - Start Backend Server

### Option 1: Use the Batch File (Recommended)
Double-click: `start-backend.bat` in the Full Test Drive folder

### Option 2: Manual Command
```bash
cd "c:\Users\rkste\Desktop\Coding Society\backend"
npm install
npm start
```

### Option 3: Use Existing Batch Files
- `c:\Users\rkste\Desktop\Coding Society\start-backend.bat`
- `c:\Users\rkste\Desktop\Coding Society\backend\start.bat`

## 🔧 What Happens When You Start Backend

1. **Server Starts**: Backend runs on `http://localhost:5000`
2. **Database Connects**: MongoDB connection at `localhost:27017`
3. **APIs Available**: All `/api/v1/*` endpoints become accessible
4. **Console Auto-Connects**: Full Test Drive will detect server and connect automatically
5. **Real Data**: Switch from mock data to actual database data

## 🎯 Expected Results

### ✅ Success Indicators:
- Connection Status: **🟢 Connected**
- Real collection counts appear
- All CRUD operations work with actual database
- No more connection errors

### 🔄 Auto-Reconnection:
The console checks for backend every 10 seconds and will automatically:
- Detect when server comes online
- Switch from mock data to real data  
- Update connection status
- Show success notification

## 📊 Environment Configuration

Your backend is configured with:
```env
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/coding-society
FRONTEND_URL=http://localhost:3000
MINIO_ENDPOINT=localhost:9000
```

## 🐳 Docker Alternative (if preferred)

If you have Docker installed:
```bash
cd "c:\Users\rkste\Desktop\Coding Society\backend"
docker-compose up -d
```

## 🔍 Troubleshooting

### If Backend Won't Start:
1. **Check Node.js**: Ensure Node.js is installed (`node --version`)
2. **Install Dependencies**: Run `npm install` in backend folder
3. **Check Port**: Ensure port 5000 isn't in use
4. **Check MongoDB**: Ensure MongoDB is running on port 27017

### If Still Connection Issues:
1. **Firewall**: Check if firewall blocks port 5000
2. **URL Check**: Verify backend starts on correct URL
3. **Logs**: Check backend console for error messages
4. **Browser**: Try refreshing Full Test Drive console

## 🎊 Once Connected

You'll have full access to:
- **👥 Users Management**: View, edit, delete user accounts
- **📝 Posts Management**: CRUD operations on all posts
- **🏆 Achievements**: Manage achievement system
- **🗺️ Quests**: Quest and challenge management
- **📚 Stories**: Content management
- **💬 Feedback**: User feedback system
- **💻 Hackathons**: Event management
- **💡 Innovations**: Innovation projects
- **💼 Internships**: Internship listings
- **📖 Library**: Educational content

## 💡 Pro Tips

1. **Keep Backend Running**: Leave terminal window open while using console
2. **Auto-Refresh**: Dashboard updates every 30 seconds
3. **Real-time Search**: Search filters data as you type
4. **JSON Editing**: Use Ctrl+S to save documents
5. **Export Data**: Download collections as JSON files

---

**🎯 Next Step**: Double-click `start-backend.bat` and watch the magic happen! ✨