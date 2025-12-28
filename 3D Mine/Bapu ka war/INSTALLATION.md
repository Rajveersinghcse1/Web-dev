# 🚀 Installation & Setup Guide

## System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux Ubuntu 18.04+
- **Python Version**: 3.8 or higher
- **RAM**: Minimum 8GB (16GB recommended for large datasets)
- **Storage**: 10GB free space minimum
- **Internet**: Required for dependency installation

## Step-by-Step Installation

### 1. Verify Python Installation

```bash
# Check Python version
python --version

# Should show Python 3.8.x or higher
```

If Python is not installed, download from [python.org](https://python.org/downloads/)

### 2. Navigate to Project Directory

```bash
cd "c:\Users\rkste\Desktop\raju\Bapu ka war"
```

### 3. Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt

# This will install:
# - numpy, pandas, matplotlib, seaborn, plotly
# - streamlit, scikit-learn, xgboost
# - rasterio, laspy, open3d
# - richdem, imblearn, pyyaml
# - And more...
```

### 4. Initialize Project Structure

```bash
# Create required directories and verify setup
python main.py setup
```

This creates:
- `data/raw_las/` - For input LAS files
- `data/processed/` - For processed point clouds
- `outputs/dem/` - For elevation models
- `outputs/3d_models/` - For 3D meshes
- `outputs/features/` - For extracted features
- `outputs/predictions/` - For risk maps
- `models/` - For trained ML models
- `logs/` - For system logs

### 5. Verify Installation

```bash
# Check if all dependencies are correctly installed
python main.py check-deps
```

Expected output:
```
🔍 Checking dependencies...
✅ numpy
✅ pandas
✅ matplotlib
... (all packages should show ✅)

✅ All dependencies installed!
```

### 6. Generate Test Data (Optional)

```bash
# Create synthetic mining data for testing
python main.py generate-data
```

This creates sample LAS files in `data/raw_las/` for testing the system.

### 7. Launch the System

```bash
# Start the interactive dashboard
python main.py dashboard
```

Your browser should automatically open to `http://localhost:8501`

## 🎯 Quick Test

### Option A: Use Synthetic Data

```bash
# Generate test data
python main.py generate-data

# Run complete workflow example
python main.py example

# Launch dashboard to view results
python main.py dashboard
```

### Option B: Use Your Own Data

1. Copy your `.las` files to `data/raw_las/`
2. Process a single file:
   ```bash
   python main.py pipeline single data/raw_las/your_file.las
   ```
3. Launch dashboard to view results:
   ```bash
   python main.py dashboard
   ```

## 🛠️ Troubleshooting

### Common Installation Issues

#### 1. Python Not Found
```bash
# Windows: Add Python to PATH or use full path
C:\Python39\python.exe main.py status

# Linux/Mac: Install Python
sudo apt-get install python3.8  # Ubuntu
brew install python@3.8         # macOS
```

#### 2. Permission Errors
```bash
# Windows: Run as Administrator
# Linux/Mac: Use sudo for system-wide installation
sudo pip install -r requirements.txt
```

#### 3. Package Installation Failures

**Option 1: Update pip**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Option 2: Install packages individually**
```bash
pip install numpy pandas scikit-learn
pip install streamlit plotly matplotlib
pip install xgboost rasterio laspy
```

**Option 3: Use conda (if available)**
```bash
conda install numpy pandas scikit-learn matplotlib
pip install streamlit xgboost rasterio laspy
```

#### 4. Open3D Installation Issues
```bash
# If Open3D fails, install alternative version
pip install open3d --no-deps
# or skip Open3D (system will work with reduced 3D functionality)
```

#### 5. GDAL/Rasterio Issues (Linux/Mac)
```bash
# Ubuntu
sudo apt-get install gdal-bin libgdal-dev
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
pip install rasterio

# macOS
brew install gdal
pip install rasterio
```

### Memory Issues

If you encounter memory errors with large datasets:

1. **Reduce dataset size in config**:
   ```yaml
   # config/config.yaml
   data_processing:
     max_points_per_file: 10000000  # Reduce from 50M to 10M
   ```

2. **Process in chunks**:
   ```bash
   # Process smaller files separately
   python main.py pipeline single small_file1.las
   python main.py pipeline single small_file2.las
   ```

3. **Close other applications** to free RAM

### Port Already in Use

If dashboard won't start:
```bash
# Use different port
streamlit run src/dashboard.py --server.port 8502
# or
python main.py dashboard --server.port 8502
```

## 🔄 Verify Everything Works

### System Status Check
```bash
python main.py status
```

Expected output after setup:
```
🏔️ Rockfall Risk Prediction System
========================================
📊 Rockfall Risk Prediction System Status
=============================================
📁 LAS files: X files found
🤖 Trained models: X models found
🗺️  DEM files: X files found
🎯 Prediction files: X files found

💡 Use 'python main.py --help' to see available commands
```

### Test Commands
```bash
# Show all available commands
python main.py --help

# Generate synthetic data
python main.py generate-data

# Run training examples
python main.py train

# Start monitoring pipeline
python main.py pipeline monitor
```

## 📚 Next Steps

Once installation is complete:

1. **Read the main README.md** for detailed usage instructions
2. **Explore examples/** folder for workflow demonstrations
3. **Check config/config.yaml** for customization options
4. **Visit the dashboard** at `http://localhost:8501`
5. **Process your first LAS file** with the pipeline

## 🆘 Getting Help

If you still encounter issues:

1. **Check system requirements** - Ensure Python 3.8+ and sufficient RAM
2. **Review error messages** - Often contain specific package names or solutions
3. **Try minimal installation** - Install only core packages first
4. **Use virtual environment** - Isolate dependencies:
   ```bash
   python -m venv rockfall_env
   # Windows
   rockfall_env\Scripts\activate
   # Linux/Mac
   source rockfall_env/bin/activate
   pip install -r requirements.txt
   ```

---

**🎉 Congratulations!** 

Your Rockfall Risk Prediction System is now ready to use!

Navigate to the main README.md for detailed usage instructions and examples.