# Medical Imaging Viewer

A fully-interactive web-based medical imaging viewer for DICOM (.dcm) and multi-layer TIFF (.tif) medical images.

## Features

### Core Functionality
- **Local File Upload**: Drag-and-drop or button selection for medical images
- **DICOM Support**: Full DICOM parsing with metadata extraction
- **TIFF Support**: Multi-layer TIFF pathology images (8-bit and 16-bit)
- **Multi-Slice Navigation**: Scroll through CT/MRI slices with slider or mouse wheel
- **High-Quality Rendering**: Supports 16-bit grayscale medical pixel data

### Image Manipulation
- **Window Level/Width Adjustment**: Real-time brightness and contrast control
- **Zoom & Pan**: Smooth image navigation
- **Image Inversion**: Toggle grayscale inversion
- **Reset View**: One-click return to default settings

### Advanced Features
- **Auto-Series Detection**: Automatically organizes multi-file DICOM series
- **Thumbnail Film Strip**: Quick preview of all slices
- **Heatmap Overlays**: Support for AI inference visualization
- **3D Volume Rendering**: GPU-accelerated volume rendering (WebGL)
- **Privacy Protection**: Automatic PHI removal from UI

### Metadata Display
- Patient Information (anonymized)
- Study Date & Time
- Modality (CT, MR, etc.)
- Image Dimensions
- Pixel Spacing
- Slice Count
- Bits Allocated

## Technology Stack

- **Pure HTML/CSS/JavaScript** - No build process required
- **DICOM Parsing**: Custom parser with dicom-parser fallback
- **TIFF Parsing**: Custom TIFF decoder
- **WebGL Rendering**: Hardware-accelerated 2D and 3D rendering
- **Web Workers**: Background processing for smooth UI

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No server or build process required!

### Supported Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All browsers must support:
- ES6 JavaScript
- WebGL (for 3D rendering)
- File API

### Usage

1. **Upload Images**: 
   - Click "Upload Images" button or drag-and-drop files
   - Supports `.dcm` and `.tif`/`.tiff` files
   - Multiple files can be uploaded at once

2. **Navigate Slices**:
   - Use slice slider
   - Mouse wheel (up/down)
   - Arrow keys or W/S keys
   - Click thumbnails in film strip

3. **Adjust Image**:
   - **Window Level**: Drag slider or right-click + drag vertically
   - **Window Width**: Drag slider or right-click + drag horizontally
   - **Pan**: Left-click + drag
   - **Zoom**: Ctrl + mouse wheel or use +/- buttons

4. **Keyboard Shortcuts**:
   - `↑/W`: Previous slice
   - `↓/S`: Next slice
   - `+/=`: Zoom in
   - `-/_`: Zoom out
   - `R`: Reset view
   - `I`: Invert colors

5. **3D View**:
   - Click 3D button (requires 3+ slices)
   - Drag to rotate volume
   - Auto-rotates when idle

## Privacy & Security

- **No Cloud Upload**: All processing happens in your browser
- **PHI Protection**: Automatic removal of Protected Health Information
- **HIPAA Considerations**: Suitable for privacy-sensitive environments
- **Local Processing**: Files never leave your computer

## Architecture

```
clone/
├── index.html              # Main HTML structure
├── styles.css              # Professional dark theme
├── app.js                  # Main application controller
├── utils/
│   ├── dicom-parser.js     # DICOM file parsing
│   ├── tiff-parser.js      # TIFF multi-layer parsing
│   ├── renderer.js         # 2D image rendering
│   ├── volume-renderer.js  # 3D WebGL rendering
│   └── privacy.js          # PHI filtering
└── README.md
```

## Supported Formats

### DICOM
- Transfer Syntax: Uncompressed (Explicit/Implicit VR)
- Modalities: CT, MR, CR, DX, and more
- Bits: 8-bit and 16-bit grayscale
- Photometric: MONOCHROME1, MONOCHROME2

### TIFF
- Compression: Uncompressed
- Bits: 8-bit and 16-bit grayscale, 24-bit RGB
- Layers: Multiple layers per file
- Photometric: WhiteIsZero, BlackIsZero, RGB

## Error Handling

The viewer includes comprehensive error handling:
- Unsupported transfer syntaxes
- Corrupted files
- Missing metadata
- Insufficient slices for 3D
- Browser compatibility issues

## Future Enhancements

- [ ] PACS integration (DICOM network protocol)
- [ ] Measurement tools (length, angle, ROI)
- [ ] MPR (Multi-Planar Reconstruction)
- [ ] Windowing presets (bone, lung, soft tissue)
- [ ] Export to PNG/JPEG
- [ ] Annotation tools
- [ ] Comparison view (side-by-side)
- [ ] Report generation

## Browser Compatibility Notes

### WebGL Support
3D rendering requires WebGL. If unavailable:
- 3D button will show error message
- 2D viewing remains fully functional

### File API
All modern browsers support File API for local file reading.

### Performance
- Tested with series up to 500 slices
- Hardware acceleration recommended for large datasets
- Minimum 4GB RAM recommended

## License

MIT License - Free for commercial and personal use

## Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- Privacy features remain intact
- Browser compatibility maintained
- Error handling comprehensive

## Support

For issues or questions:
1. Check browser console for errors
2. Verify file format compatibility
3. Ensure WebGL is enabled for 3D features

## Medical Disclaimer

This software is for educational and development purposes. Not approved for clinical diagnosis. Always consult qualified medical professionals for medical image interpretation.

## Credits

Built with modern web technologies:
- No external dependencies for core functionality
- Optional CDN libraries (dicom-parser, cornerstone) for enhanced compatibility
- Pure JavaScript implementation

---

**Professional Medical Imaging Viewer** - Built for radiologists, researchers, and medical imaging professionals.
