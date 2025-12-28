# 🔧 TROUBLESHOOTING GUIDE - Medical Imaging Viewer

## ✅ Your Setup Status

### Files Detected in DATA Folder:
```
✅ ID_0000_AGE_0060_CONTRAST_1_CT.dcm  (528,130 bytes)
✅ ID_0004_AGE_0056_CONTRAST_1_CT.dcm  (528,158 bytes)
✅ ID_0004_AGE_0056_CONTRAST_1_CT.tif  (2,097,420 bytes)
✅ 0171021638f9272a34a41feb84ed47a0.png (2,983,695 bytes)
```

---

## 🚀 Quick Fix Steps

### Step 1: Verify Server is Running

```powershell
# Check if server is running
Get-Process python | Where-Object {$_.MainWindowTitle -like "*http.server*"}

# If not running, start it:
cd "c:\Users\rkste\Desktop\clone"
python -m http.server 8000
```

### Step 2: Access the Viewer

Open your browser to one of these:
- **Start Page**: http://localhost:8000/start.html
- **Main Viewer**: http://localhost:8000/index.html
- **Test Page**: http://localhost:8000/test.html

### Step 3: Load Your Data

**Option A: One-Click Load**
1. Click green "Load Sample Data" button
2. All 4 files load automatically

**Option B: Manual Upload**
1. Click "Upload Images"
2. Select files from DATA folder
3. Open

**Option C: Drag & Drop**
1. Open DATA folder in File Explorer
2. Drag files onto viewer
3. Drop to load

---

## 🐛 Common Issues & Solutions

### Issue 1: "Load Sample Data" Button Does Nothing

**Cause**: CORS or server not running

**Solution**:
```powershell
# Stop server (Ctrl+C)
# Restart:
cd "c:\Users\rkste\Desktop\clone"
python -m http.server 8000

# Then open: http://localhost:8000/start.html
```

### Issue 2: Files Load But Show Black Screen

**Cause**: DICOM pixel data not extracting properly

**Solution**:
1. Open browser console (F12)
2. Look for errors
3. Try these steps:

```javascript
// In browser console, check what's loaded:
window.medicalViewer.allSeries
```

**Manual Fix**:
- Upload files individually using "Upload Images" button
- Try PNG file first to verify viewer works
- Check console for specific DICOM errors

### Issue 3: TIFF File Won't Load

**Cause**: Compressed TIFF (only uncompressed supported)

**Check**:
```powershell
# See if TIFF is compressed
python -c "from PIL import Image; img = Image.open('DATA/ID_0004_AGE_0056_CONTRAST_1_CT.tif'); print('Compression:', img.info.get('compression', 'none'))"
```

**Solution**:
- Viewer supports uncompressed TIFF only
- Use DICOM version instead
- Or convert TIFF to uncompressed format

### Issue 4: PNG Loads But No Metadata

**Expected Behavior**:
- PNG files don't have medical metadata
- They will show as "Image" modality
- Basic viewing works (zoom, pan)
- No window level adjustment (not medical data)

### Issue 5: Console Shows "Unsupported Transfer Syntax"

**Cause**: Complex DICOM compression

**Solution**:
The viewer now has improved handling for your specific files.
If still failing:

1. **Check file integrity**:
```powershell
# Verify file size
Get-ChildItem DATA\*.dcm | Select-Object Name, Length
```

2. **Try alternate parser**:
Files should work with built-in parser now (external libraries removed)

3. **Upload individually**:
Try each DICOM file separately to identify which one has issues

---

## 📊 Expected Behavior for Your Files

### ID_0000_AGE_0060_CONTRAST_1_CT.dcm

**Should Display**:
- Patient ID: `I****0` (anonymized)
- Age: 60 years (if in metadata)
- Modality: CT
- Contrast: Yes
- Image dimensions: 512×512 (typical)
- Window Level/Width controls active
- Grayscale CT image

**If Not Working**:
```javascript
// Debug in console:
fetch('./DATA/ID_0000_AGE_0060_CONTRAST_1_CT.dcm')
  .then(r => r.arrayBuffer())
  .then(buffer => {
    const view = new DataView(buffer);
    const header = String.fromCharCode(
      view.getUint8(128), view.getUint8(129),
      view.getUint8(130), view.getUint8(131)
    );
    console.log('DICOM Header:', header); // Should be "DICM"
  });
```

### ID_0004_AGE_0056_CONTRAST_1_CT.dcm

**Should Display**:
- Patient ID: `I****4` (anonymized)
- Age: 56 years
- Modality: CT
- Same as above
- Can compare with TIFF version

### ID_0004_AGE_0056_CONTRAST_1_CT.tif

**Should Display**:
- Filename as description
- Modality: TIFF
- Same anatomical view as .dcm version
- May have multiple layers
- No DICOM metadata (just image data)

**Comparison Test**:
1. Load DICOM version
2. Note window level settings
3. Load TIFF version
4. Compare image quality

### 0171021638f9272a34a41feb84ed47a0.png

**Should Display**:
- Filename as description
- Modality: PNG
- Full color or grayscale
- No medical metadata
- Basic viewer functions only

---

## 🔍 Diagnostic Commands

### Check Server Status
```powershell
# Is server running?
Test-NetConnection -ComputerName localhost -Port 8000

# If failed, server not running
# If success, server is up
```

### Check File Access
```powershell
# Can PowerShell read the files?
Get-Content DATA\ID_0000_AGE_0060_CONTRAST_1_CT.dcm -TotalCount 200 -Encoding Byte
```

### Browser Console Tests
```javascript
// Test 1: Can fetch files?
fetch('./DATA/ID_0000_AGE_0060_CONTRAST_1_CT.dcm')
  .then(r => console.log('✅ DICOM accessible:', r.ok))
  .catch(e => console.error('❌ Cannot access:', e));

// Test 2: Check DataLoader
const loader = new DataLoader();
loader.loadAllFiles()
  .then(files => console.log('✅ Loaded:', files.length, 'files'))
  .catch(e => console.error('❌ Load failed:', e));

// Test 3: Current series
console.log('Current series:', window.medicalViewer?.allSeries);
```

---

## 🎯 Working Test Sequence

### 1. Server Test
```
✅ Open: http://localhost:8000/start.html
✅ Should see "Server is Running!" message
```

### 2. File Access Test
```
✅ Open: http://localhost:8000/test.html
✅ Click "Test DATA Folder Access"
✅ All 4 files should show ✅ with file sizes
```

### 3. Viewer Test
```
✅ Open: http://localhost:8000/index.html
✅ Click "Load Sample Data" (green button)
✅ Should see 4 series in left sidebar
✅ First series loads automatically
✅ Use controls to navigate
```

### 4. Individual File Test
```
✅ Use "Upload Images" button
✅ Select PNG file first (simplest)
✅ Should load and display
✅ Try DICOM files next
✅ Finally try TIFF
```

---

## 📝 Browser Console Checklist

Open Console (F12) and check for:

### ✅ Good Signs:
```
Processing X DICOM file(s)...
Parsed X series
DICOM processing complete
Image loaded: 512x512
```

### ⚠️ Warnings (OK):
```
WebGL not available - falling back
External libraries not loaded (using built-in)
```

### ❌ Bad Signs:
```
Cannot access DATA folder
HTTP 404 Not Found
CORS error
Unsupported transfer syntax
```

**If you see bad signs**: Check server is running at `http://localhost:8000`

---

## 🔄 Reset Everything

If nothing works, complete reset:

```powershell
# 1. Stop server
# Press Ctrl+C in terminal

# 2. Close all browser tabs

# 3. Verify files exist
cd "c:\Users\rkste\Desktop\clone"
Get-ChildItem DATA

# 4. Restart server
python -m http.server 8000

# 5. Wait 3 seconds

# 6. Open fresh browser tab
# Navigate to: http://localhost:8000/start.html

# 7. Click "Launch Viewer"

# 8. Click "Load Sample Data"
```

---

## 💡 Pro Tips

### Fastest Way to Test
```
1. Double-click: start-server.bat
2. Browser opens automatically to start.html
3. Click "Launch Viewer"
4. Click "Load Sample Data"
5. Done!
```

### Keyboard Shortcuts
```
W or ↑     - Previous slice (for multi-slice)
S or ↓     - Next slice
+ or =     - Zoom in
- or _     - Zoom out
R          - Reset view
I          - Invert colors
F12        - Open console (for debugging)
```

### Mouse Controls
```
Scroll         - Navigate slices
Left-drag      - Pan image
Right-drag     - Adjust brightness/contrast
Ctrl+Scroll    - Zoom
```

---

## 📞 Still Having Issues?

### Check These:

1. **Server Running?**
   ```powershell
   Get-Process python
   # Should see python.exe process
   ```

2. **Correct Directory?**
   ```powershell
   pwd
   # Should be: C:\Users\rkste\Desktop\clone
   ```

3. **Files Accessible?**
   ```powershell
   Test-Path DATA\*.dcm
   # Should return: True
   ```

4. **Port 8000 Free?**
   ```powershell
   Get-NetTCPConnection -LocalPort 8000
   # Should show LISTENING state
   ```

5. **Browser Cache?**
   - Press Ctrl+Shift+R (hard refresh)
   - Or clear browser cache

---

## 🎊 Success Indicators

You'll know it's working when:

✅ Start page shows "Server is Running!"
✅ Viewer loads without console errors
✅ Clicking "Load Sample Data" shows loading indicator
✅ Left sidebar populates with 4 series
✅ Main viewer shows medical image
✅ Controls respond (zoom, pan, sliders)
✅ Can switch between series by clicking sidebar items

---

## 📚 Additional Resources

- **Full Guide**: `DATA-GUIDE.md`
- **Quick Start**: `QUICK-START.md`
- **Feature List**: `README.md`
- **Test Page**: http://localhost:8000/test.html
- **Start Page**: http://localhost:8000/start.html

---

**Your files are ready and the viewer is configured for them. Follow the steps above and it should work!** 🏥
