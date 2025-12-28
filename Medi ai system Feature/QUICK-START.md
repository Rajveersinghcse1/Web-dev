# 🚀 QUICK START GUIDE

## Get Started in 3 Steps

### Step 1: Start the Server
```powershell
# Windows: Double-click this file
start-server.bat

# OR in PowerShell
.\start-server.ps1
```

### Step 2: Open Browser
Navigate to: **http://localhost:8000**

### Step 3: Load Sample Data
Click the **"Load Sample Data"** button (green button in header)

---

## ✅ That's it! Your medical images are now loaded.

---

## 🎮 Quick Controls

| Action | How To |
|--------|--------|
| Navigate slices | Mouse wheel or ↑/↓ keys |
| Zoom | Ctrl + Wheel or +/- buttons |
| Pan | Left-click + drag |
| Adjust brightness | Right-click + drag |
| Reset view | Press R or click Reset button |

---

## 📁 Your Sample Files

The application will automatically load these files from the DATA folder:

1. ✅ **ID_0000_AGE_0060_CONTRAST_1_CT.dcm** - CT scan patient 0000
2. ✅ **ID_0004_AGE_0056_CONTRAST_1_CT.dcm** - CT scan patient 0004
3. ✅ **ID_0004_AGE_0056_CONTRAST_1_CT.tif** - TIFF version
4. ✅ **0171021638f9272a34a41feb84ed47a0.png** - Reference image

All files load automatically with one click!

---

## 🆘 Having Issues?

### CORS Error?
Make sure you're using the local server (not opening index.html directly)

### Python Not Found?
Install Python from: https://www.python.org/downloads/

### Files Not Loading?
- Check that DATA folder is in the same directory as index.html
- Verify the server is running on http://localhost:8000

---

## 📖 More Information

- **Full documentation**: See DATA-GUIDE.md
- **Features**: See README.md
- **Controls**: See keyboard shortcuts in the app

---

**Enjoy your medical imaging viewer! 🏥**
