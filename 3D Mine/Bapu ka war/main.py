"""
Main Application Launcher

This script provides a command-line interface to run different components
of the Rockfall Risk Prediction System.
"""

import sys
import argparse
import subprocess
from pathlib import Path
import yaml

def load_config():
    """Load system configuration"""
    config_path = Path('config/config.yaml')
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}

def run_dashboard():
    """Launch the Streamlit dashboard"""
    print("🚀 Starting Rockfall Risk Prediction Dashboard...")
    print("📊 Dashboard will open in your web browser")
    print("🔗 URL: http://localhost:8501")
    print("⏹️  Press Ctrl+C to stop")
    
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", 
            "src/dashboard.py", "--server.port", "8501"
        ])
    except KeyboardInterrupt:
        print("\n✅ Dashboard stopped")

def run_pipeline(mode='monitor', file_path=None):
    """Run the processing pipeline"""
    print(f"🔄 Starting pipeline in {mode} mode...")
    
    cmd = [sys.executable, "-m", "src.pipeline", "--mode", mode]
    
    if file_path:
        cmd.extend(["--file", file_path])
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n✅ Pipeline stopped")

def run_example_workflow():
    """Run the example workflow"""
    print("🏔️ Running complete example workflow...")
    print("📊 This will demonstrate the full system capabilities")
    
    try:
        subprocess.run([sys.executable, "examples/example_workflow.py"])
    except FileNotFoundError:
        print("❌ Example workflow not found. Please ensure examples/example_workflow.py exists.")

def generate_synthetic_data():
    """Generate synthetic test data"""
    print("🏗️ Generating synthetic mine data...")
    print("📊 This will create test LAS files for demonstration")
    
    try:
        subprocess.run([sys.executable, "examples/synthetic_data.py"])
    except FileNotFoundError:
        print("❌ Synthetic data generator not found. Please ensure examples/synthetic_data.py exists.")

def train_models():
    """Run model training examples"""
    print("🤖 Running model training examples...")
    print("📊 This will train and compare different ML models")
    
    try:
        subprocess.run([sys.executable, "examples/model_training.py"])
    except FileNotFoundError:
        print("❌ Model training example not found. Please ensure examples/model_training.py exists.")

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = {
        'numpy': 'numpy',
        'pandas': 'pandas', 
        'matplotlib': 'matplotlib',
        'seaborn': 'seaborn',
        'plotly': 'plotly',
        'streamlit': 'streamlit',
        'scikit-learn': 'sklearn',  # Import name is different
        'xgboost': 'xgboost',
        'rasterio': 'rasterio',
        'laspy': 'laspy',
        'pyyaml': 'yaml',  # Import name is different
        'pathlib': 'pathlib'
    }
    
    missing_packages = []
    
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✅ {package_name}")
        except ImportError:
            print(f"❌ {package_name} - MISSING")
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("📦 Install with: pip install -r requirements.txt")
        return False
    else:
        print("\n✅ All dependencies installed!")
        return True

def setup_project():
    """Initial project setup"""
    print("⚙️ Setting up Rockfall Risk Prediction System...")
    
    # Create required directories
    directories = [
        'data/raw_las',
        'data/processed', 
        'outputs/dem',
        'outputs/3d_models',
        'outputs/features',
        'outputs/predictions',
        'models',
        'logs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")
    
    # Check if config exists
    config_path = Path('config/config.yaml')
    if not config_path.exists():
        print("⚠️  Configuration file not found")
        print("📝 Please ensure config/config.yaml exists")
    else:
        print("✅ Configuration file found")
    
    print("\n✅ Project setup complete!")

def show_status():
    """Show system status and available files"""
    print("📊 Rockfall Risk Prediction System Status")
    print("=" * 45)
    
    # Check directories and files
    data_dir = Path('data/raw_las')
    if data_dir.exists():
        las_files = list(data_dir.glob('*.las'))
        print(f"📁 LAS files: {len(las_files)}")
        for las_file in las_files[:5]:  # Show first 5
            print(f"   - {las_file.name}")
        if len(las_files) > 5:
            print(f"   ... and {len(las_files) - 5} more")
    else:
        print("📁 LAS files: None found")
    
    # Check models
    models_dir = Path('models')
    if models_dir.exists():
        model_files = list(models_dir.glob('*_model.pkl'))
        print(f"🤖 Trained models: {len(model_files)}")
        for model_file in model_files:
            print(f"   - {model_file.stem}")
    else:
        print("🤖 Trained models: None found")
    
    # Check outputs
    outputs_dir = Path('outputs')
    if outputs_dir.exists():
        dem_files = list((outputs_dir / 'dem').glob('*.tif')) if (outputs_dir / 'dem').exists() else []
        pred_files = list((outputs_dir / 'predictions').glob('*.tif')) if (outputs_dir / 'predictions').exists() else []
        print(f"🗺️  DEM files: {len(dem_files)}")
        print(f"🎯 Prediction files: {len(pred_files)}")
    else:
        print("📊 Output files: None found")
    
    print("\n💡 Use 'python main.py --help' to see available commands")

def main():
    """Main application entry point"""
    
    parser = argparse.ArgumentParser(
        description='Rockfall Risk Prediction System',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py dashboard              # Start interactive dashboard
  python main.py pipeline monitor      # Start continuous monitoring
  python main.py pipeline single file.las  # Process single file
  python main.py example               # Run complete workflow demo
  python main.py generate-data         # Create synthetic test data
  python main.py train                 # Train ML models
  python main.py setup                 # Initial project setup
  python main.py status                # Show system status
  python main.py check-deps           # Check dependencies
        """
    )
    
    parser.add_argument('command', choices=[
        'dashboard', 'pipeline', 'example', 'generate-data', 
        'train', 'setup', 'status', 'check-deps'
    ], help='Command to execute')
    
    parser.add_argument('mode', nargs='?', default='monitor', 
                       choices=['monitor', 'process', 'single'],
                       help='Pipeline mode (for pipeline command)')
    
    parser.add_argument('file', nargs='?', 
                       help='File path (for pipeline single mode)')
    
    parser.add_argument('--config', default='config/config.yaml',
                       help='Configuration file path')
    
    args = parser.parse_args()
    
    print("🏔️ Rockfall Risk Prediction System")
    print("=" * 40)
    
    if args.command == 'dashboard':
        run_dashboard()
        
    elif args.command == 'pipeline':
        if args.mode == 'single' and not args.file:
            print("❌ Error: File path required for single mode")
            print("💡 Usage: python main.py pipeline single path/to/file.las")
            sys.exit(1)
        run_pipeline(args.mode, args.file)
        
    elif args.command == 'example':
        run_example_workflow()
        
    elif args.command == 'generate-data':
        generate_synthetic_data()
        
    elif args.command == 'train':
        train_models()
        
    elif args.command == 'setup':
        setup_project()
        
    elif args.command == 'status':
        show_status()
        
    elif args.command == 'check-deps':
        if not check_dependencies():
            sys.exit(1)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()