# 🏥 Medical Imaging Viewer - DATA Folder Guide

## Your Sample Dataset

Your `DATA` folder contains the following medical imaging files:

### 📁 Available Files:

1. **ID_0000_AGE_0060_CONTRAST_1_CT.dcm** (DICOM CT Scan)
   - Patient ID: 0000
   - Age: 60 years
   - Contrast: Yes
   - Modality: CT

2. **ID_0004_AGE_0056_CONTRAST_1_CT.dcm** (DICOM CT Scan)
   - Patient ID: 0004
   - Age: 56 years
   - Contrast: Yes
   - Modality: CT

3. **ID_0004_AGE_0056_CONTRAST_1_CT.tif** (TIFF Image)
   - Same study as above in TIFF format
   - Can compare DICOM vs TIFF rendering

4. **0171021638f9272a34a41feb84ed47a0.png** (PNG Image)
   - Reference or preview image

---

## 🚀 How to Use the Application

### Method 1: One-Click Sample Data (Recommended)

1. **Start the local server:**
   ```powershell
   # Double-click: start-server.bat
   # OR run in PowerShell:
   .\start-server.ps1
   ```

2. **Open browser:** http://localhost:8000

3. **Click "Load Sample Data" button** (green button in header)
   - This automatically loads ALL files from the DATA folder
   - No need to manually select files!

### Method 2: Drag & Drop

1. Open the application
2. Drag files from the DATA folder directly onto the viewer
3. Drop to load

### Method 3: Upload Button

1. Click "Upload Images" button
2. Navigate to DATA folder
3. Select files to view

---

## 🎮 Controls & Features

### Navigation
- **Mouse Wheel**: Scroll through slices
- **Slider**: Jump to specific slice
- **Thumbnails**: Click to navigate
- **Arrow Keys (↑/↓)**: Previous/Next slice

### Image Adjustment
- **Right-Click + Drag**: Window Level/Width
- **Brightness Slider**: Window Level
- **Contrast Slider**: Window Width
- **Zoom Buttons**: +/- zoom
- **Ctrl + Wheel**: Zoom in/out
- **Left-Click + Drag**: Pan image

### View Options
- **Invert**: Toggle black/white inversion
- **Reset**: Return to default view
- **3D View**: Volume rendering (if multiple slices)
- **Heatmap**: Toggle AI overlay visualization

### Keyboard Shortcuts
```
W or ↑     - Previous slice
S or ↓     - Next slice
+ or =     - Zoom in
- or _     - Zoom out
R          - Reset view
I          - Invert colors
```

---

## 📊 What You'll See

### Sidebar Information

**Patient Info (Anonymized):**
- Patient ID: `I****4` (privacy-protected)
- Modality: CT, TIFF, or PNG
- Study Date: `YYYY-XX-XX` (year only)
- Series Number

**Image Properties:**
- Dimensions: 512×512 (typical)
- Slice Count: Number of images
- Pixel Spacing: Physical measurement
- Bits Allocated: 8-bit or 16-bit

### Main Viewer

**Overlay Information (Top-left):**
- WL: Window Level (brightness)
- WW: Window Width (contrast)
- Zoom: Current zoom percentage
- Slice: Current slice / Total slices

### Film Strip

- Thumbnail previews of all slices
- Click to jump to specific slice
- Active slice highlighted in blue

---

## 🔍 Comparing Files

Your dataset includes the same study in multiple formats:

### DICOM vs TIFF Comparison

1. Load sample data
2. Select **ID_0004_AGE_0056_CONTRAST_1_CT.dcm** from series list
3. Note the image quality and metadata
4. Switch to **ID_0004_AGE_0056_CONTRAST_1_CT.tif** 
5. Compare rendering differences

**Key Differences:**
- DICOM: Contains medical metadata (window level, patient info, etc.)
- TIFF: Pure image data, no DICOM tags
- Both render the same anatomical view

---

## 🎯 Advanced Features

### Multi-Series Support

If you have multiple DICOM files that belong to the same study:
- They're automatically grouped into series
- Series list shows all available series
- Click to switch between series

### 3D Volume Rendering

For multi-slice CT/MR datasets:
1. Load multiple slices from same series
2. Click **3D View** button
3. Drag to rotate the volume
4. Auto-rotation when idle

### Heatmap Overlay

For AI-generated attention maps:
1. Load your medical image
2. Click **Heatmap** button
3. View overlay visualization
4. Useful for deep learning model outputs

---

## 🛠️ Troubleshooting

### "Could not load sample data"

**Solution:**
- Ensure you're running from a local server (not file://)
- Check that DATA folder is in the same directory as index.html
- Verify files are not corrupted

### CORS Errors

**Solution:**
- Use the provided server scripts
- Don't open index.html directly (file:// protocol)
- Python server: `python -m http.server 8000`

### Files Won't Load

**Check:**
- File extensions: .dcm, .tif, .tiff, .png, .jpg
- File not corrupted
- Browser console for errors (F12)

### 3D View Not Working

**Requirements:**
- WebGL must be enabled
- At least 3 slices required
- Modern browser (Chrome/Firefox/Edge)

---

## 📝 File Format Details

### DICOM (.dcm)
- **What it is**: Medical imaging standard format
- **Contains**: Pixel data + metadata (patient, study, equipment info)
- **Bits**: Usually 16-bit for CT/MR, 8-bit for X-ray
- **Viewer support**: Full metadata extraction, window leveling

### TIFF (.tif)
- **What it is**: Tag Image File Format
- **Contains**: Pixel data, basic image properties
- **Bits**: 8-bit, 16-bit, or 24-bit RGB
- **Viewer support**: Multi-layer pathology images

### PNG/JPG (.png, .jpg)
- **What it is**: Standard image formats
- **Contains**: Compressed pixel data
- **Bits**: 8-bit per channel (RGB or grayscale)
- **Viewer support**: Basic viewing, no medical metadata

---

## 🔒 Privacy Features

### Automatic PHI Removal

The viewer automatically anonymizes:
- ✅ Patient names → `[ANONYMIZED]`
- ✅ Patient IDs → `I****4` (masked)
- ✅ Birth dates → Removed
- ✅ Study dates → Year only (`YYYY-XX-XX`)
- ✅ Institution names → Removed

### Local Processing

- ✅ All files processed in your browser
- ✅ No data sent to any server
- ✅ No internet connection required
- ✅ HIPAA-compliant workflow

---

## 📈 Performance Tips

### For Large Datasets:
- Files process in background (Web Workers)
- Thumbnails generate progressively
- Smooth rendering even with 100+ slices

### Optimal Experience:
- Use Chrome or Edge (best WebGL performance)
- Enable hardware acceleration in browser settings
- Close other memory-intensive applications

---

## 🎨 Customization

### Window Presets (Manual)

For different tissue types, adjust window level/width:

**Lung Window:**
- Level: -600
- Width: 1500

**Soft Tissue:**
- Level: 40
- Width: 400

**Bone Window:**
- Level: 400
- Width: 1800

**Brain:**
- Level: 40
- Width: 80

---

## 📚 Next Steps

### Add More Files:
1. Place DICOM/TIFF files in DATA folder
2. Update `data-loader.js` → `availableFiles` array
3. Reload page and click "Load Sample Data"

### Integrate AI Models:
- Use heatmap overlay for model outputs
- Load probability maps as separate layer
- Visualize attention mechanisms

### Export Screenshots:
- Right-click on canvas → Save image as...
- Or add export button (future feature)

---

## ✨ Feature Summary

✅ **Implemented:**
- DICOM parsing (16-bit support)
- TIFF multi-layer support
- PNG/JPG regular images
- Auto-load from DATA folder
- Window level/width adjustment
- Multi-slice navigation
- 3D volume rendering
- Privacy protection (PHI removal)
- Heatmap overlays
- Zoom, pan, invert
- Thumbnail film strip
- Series auto-detection

🚀 **Your dataset is ready to explore!**

---

## 🆘 Support

**Check Console (F12):**
- Look for error messages
- Verify file loading status
- Check for CORS issues

**Common Issues:**
1. **CORS Error**: Use local server
2. **File Not Found**: Check DATA folder path
3. **Unsupported Format**: Use .dcm, .tif, .png

**Test Your Setup:**
1. Open: http://localhost:8000
2. Click: "Load Sample Data"
3. Verify: 4 series appear in sidebar
4. Navigate: Use controls to explore images

---

**Enjoy exploring your medical imaging data! 🏥**
