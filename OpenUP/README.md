# OpenUP - Universal File Preview & Visualization

**OpenUP** is a cross-platform desktop application for previewing and visualizing files across multiple domains: Documents, Data, Images, Audio/Video, Geospatial, Medical, 3D models, Code, and Archives.

## Features

- **Multi-domain Support**: Preview 50+ file formats across 9 domains
- **Dual-tab Interface**: 
  - Metadata/Table tab for structured data
  - Visualization tab for visual/interactive content
- **Plugin Architecture**: Extensible system for adding new formats
- **Performance Optimized**: Streaming, downsampling, and caching for large files
- **Cross-platform**: Windows, macOS, Linux

## Supported Formats

### Documents
`.txt`, `.md`, `.pdf`, `.docx`, `.odt`, `.rtf`

### Data / Analytics
`.csv`, `.tsv`, `.xlsx`, `.xls`, `.json`, `.xml`, `.parquet`, `.feather`

### Images / Raster
`.png`, `.jpg`, `.jpeg`, `.bmp`, `.gif`, `.tiff`, `.webp`, `.svg`

### Audio / Video
`.mp3`, `.wav`, `.ogg`, `.flac`, `.mp4`, `.avi`, `.mov`, `.mkv`

### Mining / Geospatial
`.las`, `.laz`, `.tif` (GeoTIFF), `.shp`, `.geojson`

### Medical / Scientific
`.dcm`, `.nii`, `.edf`, `.mat`

### 3D / CAD
`.obj`, `.stl`, `.ply`, `.fbx`

### Code
`.py`, `.js`, `.ts`, `.html`, `.css`, `.c`, `.cpp`, `.java`, `.yaml`, `.toml`

### Archives
`.zip`, `.tar`, `.tar.gz`, `.rar`

## Installation

### From Source

```bash
# Clone repository
git clone https://github.com/Rajveersinghcse1/Web-dev.git
cd "Formate Viewer/OpenUP"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run application
python main.py
```

### Binary Release

Download pre-built executables from [Releases](https://github.com/Rajveersinghcse1/Web-dev/releases)

## Usage

1. **Launch OpenUP**
2. **Select Domain** from the left panel (optional filter)
3. **Browse Files** or drag-and-drop files into the app
4. **View** metadata in the first tab, visualization in the second tab

### Keyboard Shortcuts

- `Ctrl+O` - Open file
- `Ctrl+R` - Refresh
- `Space` - Play/Pause (audio/video)
- `F11` - Fullscreen
- `Ctrl+Q` - Quit

## Architecture

```
OpenUP/
├── src/
│   ├── core/           # Core logic (PluginManager, WorkerPool, Cache)
│   ├── ui/             # UI components (MainWindow, FileBrowser, PreviewArea)
│   ├── plugins/        # Domain-specific preview plugins
│   └── utils/          # Utilities (logging, file helpers)
├── tests/              # Unit & integration tests
├── resources/          # Icons, assets
├── cache/              # Temporary cache for previews
└── logs/               # Application logs
```

## Plugin Development

Create custom preview plugins by implementing the `PreviewPlugin` interface:

```python
from src.core.plugin_base import PreviewPlugin
from PyQt6.QtWidgets import QWidget

class MyFormatPlugin(PreviewPlugin):
    extensions = ['.myformat']
    domain = "Custom"
    
    def get_metadata(self, filepath: str) -> dict:
        # Parse and return metadata
        return {"size": "1MB", "rows": 100}
    
    def create_metadata_widget(self, metadata: dict, parent: QWidget) -> QWidget:
        # Return widget showing metadata table
        pass
    
    def create_visual_widget(self, filepath: str, parent: QWidget) -> QWidget:
        # Return widget showing visual preview
        pass
```

Place plugins in `src/plugins/` and they'll be auto-loaded.

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test
pytest tests/test_plugins.py
```

## Building Executables

```bash
# Install PyInstaller
pip install pyinstaller

# Build
pyinstaller openup.spec

# Output in dist/OpenUP/
```

## Configuration

Settings stored in `~/.openup/config.json`:

```json
{
  "cache_size_mb": 500,
  "max_file_size_mb": 1000,
  "theme": "dark",
  "recent_files": 10,
  "plugins_enabled": true
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Credits

Developed by Rajveer Singh

### Dependencies

- PyQt6 - GUI framework
- Open3D - 3D visualization
- Pandas - Data analysis
- Rasterio - Geospatial data
- PyMuPDF - PDF rendering
- And many more (see requirements.txt)

## Roadmap

- [x] Core architecture
- [x] Plugin system
- [x] Basic file preview (documents, images, data)
- [x] Advanced previews (3D, geospatial, medical)
- [ ] Plugin marketplace
- [ ] Cloud file support
- [ ] Collaborative annotations
- [ ] Mobile companion app

## Support

- **Issues**: [GitHub Issues](https://github.com/Rajveersinghcse1/Web-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Rajveersinghcse1/Web-dev/discussions)
- **Email**: support@openup.dev

---

**Made with ❤️ for the data visualization community**
