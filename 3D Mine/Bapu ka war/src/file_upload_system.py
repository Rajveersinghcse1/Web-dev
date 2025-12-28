"""
Enhanced File Upload System for Mining Operations

Advanced file upload with validation, batch processing, progress tracking,
and real-time status monitoring for field operations.
"""

import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import shutil
import hashlib
import zipfile
from datetime import datetime, timedelta
import json
import threading
import queue
import time
from typing import List, Dict, Any, Optional, Tuple
import os

# Try to import laspy with fallback
try:
    import laspy
    LASPY_AVAILABLE = True
except ImportError:
    LASPY_AVAILABLE = False

# Try to import plotly with fallback
try:
    import plotly.express as px
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

class FileUploadManager:
    """Advanced file upload manager for mining operations"""
    
    def __init__(self, upload_dir: str = "data/uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.processing_queue = queue.Queue()
        self.status_db = {}
        self.supported_formats = ['.las', '.laz', '.xyz', '.ply', '.csv']
        
    def validate_file(self, file_path: Path) -> Dict[str, Any]:
        """Comprehensive file validation for mining data"""
        validation_result = {
            'valid': False,
            'errors': [],
            'warnings': [],
            'metadata': {},
            'file_info': {}
        }
        
        try:
            # Basic file checks
            if not file_path.exists():
                validation_result['errors'].append("File does not exist")
                return validation_result
                
            file_size = file_path.stat().st_size
            validation_result['file_info'] = {
                'size_mb': file_size / (1024 * 1024),
                'format': file_path.suffix.lower(),
                'name': file_path.name,
                'upload_time': datetime.now()
            }
            
            # Size validation
            if file_size > 500 * 1024 * 1024:  # 500MB limit
                validation_result['warnings'].append("Large file detected - processing may take time")
            elif file_size < 1024:  # 1KB minimum
                validation_result['errors'].append("File too small - likely corrupted")
                return validation_result
                
            # Format validation
            if file_path.suffix.lower() not in self.supported_formats:
                validation_result['errors'].append(f"Unsupported format: {file_path.suffix}")
                return validation_result
                
            # LAS file specific validation
            if file_path.suffix.lower() in ['.las', '.laz']:
                las_validation = self._validate_las_file(file_path)
                validation_result['metadata'].update(las_validation)
                if 'error' in las_validation:
                    validation_result['errors'].append(las_validation['error'])
                    return validation_result
                    
            validation_result['valid'] = True
            
        except Exception as e:
            validation_result['errors'].append(f"Validation error: {str(e)}")
            
        return validation_result
        
    def _validate_las_file(self, file_path: Path) -> Dict[str, Any]:
        """Validate LAS file specifically for mining data"""
        if not LASPY_AVAILABLE:
            return {
                'warning': 'LAS validation limited - laspy not available',
                'point_count': 'Unknown',
                'file_size': file_path.stat().st_size
            }
            
        try:
            las_file = laspy.read(str(file_path))
            
            metadata = {
                'point_count': len(las_file.points),
                'point_format': las_file.header.point_format.id,
                'version': f"{las_file.header.version.major}.{las_file.header.version.minor}",
                'bounds': {
                    'x_min': float(las_file.header.x_min),
                    'x_max': float(las_file.header.x_max),
                    'y_min': float(las_file.header.y_min),
                    'y_max': float(las_file.header.y_max),
                    'z_min': float(las_file.header.z_min),
                    'z_max': float(las_file.header.z_max)
                },
                'coordinate_system': getattr(las_file.header, 'crs', 'Unknown'),
                'creation_date': getattr(las_file.header, 'creation_date', None)
            }
            
            # Mining-specific validations
            if len(las_file.points) < 1000:
                metadata['warning'] = "Low point count - may not be suitable for mining analysis"
            elif len(las_file.points) > 100_000_000:
                metadata['warning'] = "Very large dataset - consider processing in chunks"
                
            # Check elevation range (mining specific)
            z_range = metadata['bounds']['z_max'] - metadata['bounds']['z_min']
            if z_range < 10:
                metadata['warning'] = "Small elevation range - check coordinate system"
            elif z_range > 2000:
                metadata['warning'] = "Large elevation range - verify data quality"
                
            return metadata
            
        except Exception as e:
            return {'error': f"LAS file validation failed: {str(e)}"}
            
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash for duplicate detection"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
        
    def check_duplicate(self, file_hash: str) -> Optional[str]:
        """Check if file already exists based on hash"""
        for existing_file in self.upload_dir.rglob("*"):
            if existing_file.is_file():
                try:
                    existing_hash = self.calculate_file_hash(existing_file)
                    if existing_hash == file_hash:
                        return str(existing_file)
                except:
                    continue
        return None

class BatchProcessor:
    """Batch processing system for multiple files"""
    
    def __init__(self, upload_manager: FileUploadManager):
        self.upload_manager = upload_manager
        self.processing_status = {}
        
    def process_batch(self, file_list: List[Path], callback=None) -> Dict[str, Any]:
        """Process multiple files with progress tracking"""
        batch_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        batch_status = {
            'batch_id': batch_id,
            'total_files': len(file_list),
            'processed': 0,
            'failed': 0,
            'start_time': datetime.now(),
            'files': {},
            'status': 'processing'
        }
        
        self.processing_status[batch_id] = batch_status
        
        for i, file_path in enumerate(file_list):
            try:
                # Validate file
                validation = self.upload_manager.validate_file(file_path)
                
                file_status = {
                    'validation': validation,
                    'processed_time': datetime.now(),
                    'status': 'completed' if validation['valid'] else 'failed'
                }
                
                if validation['valid']:
                    batch_status['processed'] += 1
                else:
                    batch_status['failed'] += 1
                    
                batch_status['files'][file_path.name] = file_status
                
                # Update progress
                progress = (i + 1) / len(file_list)
                if callback:
                    callback(progress, file_path.name, file_status)
                    
            except Exception as e:
                batch_status['failed'] += 1
                batch_status['files'][file_path.name] = {
                    'status': 'error',
                    'error': str(e),
                    'processed_time': datetime.now()
                }
                
        batch_status['status'] = 'completed'
        batch_status['end_time'] = datetime.now()
        batch_status['duration'] = (batch_status['end_time'] - batch_status['start_time']).total_seconds()
        
        return batch_status

def create_upload_interface():
    """Create the enhanced upload interface"""
    st.title("🏗️ Advanced File Upload System")
    st.markdown("*Professional-grade file upload for mining operations*")
    
    # Initialize upload manager
    if 'upload_manager' not in st.session_state:
        st.session_state.upload_manager = FileUploadManager()
        st.session_state.batch_processor = BatchProcessor(st.session_state.upload_manager)
    
    upload_manager = st.session_state.upload_manager
    batch_processor = st.session_state.batch_processor
    
    # Upload methods
    st.subheader("📁 Upload Methods")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("### Single File Upload")
        uploaded_file = st.file_uploader(
            "Choose LAS/LAZ file",
            type=['las', 'laz', 'xyz', 'ply', 'csv'],
            help="Upload individual survey files"
        )
        
        if uploaded_file:
            # Save uploaded file
            file_path = upload_manager.upload_dir / uploaded_file.name
            with open(file_path, 'wb') as f:
                f.write(uploaded_file.getbuffer())
                
            # Validate
            validation = upload_manager.validate_file(file_path)
            
            if validation['valid']:
                st.success(f"✅ File validated successfully!")
                st.json(validation['metadata'])
            else:
                st.error("❌ File validation failed:")
                for error in validation['errors']:
                    st.error(f"• {error}")
    
    with col2:
        st.markdown("### Batch Upload")
        uploaded_files = st.file_uploader(
            "Choose multiple files",
            type=['las', 'laz', 'xyz', 'ply', 'csv'],
            accept_multiple_files=True,
            help="Upload multiple survey files at once"
        )
        
        if uploaded_files and st.button("Process Batch"):
            # Save all files
            file_paths = []
            for uploaded_file in uploaded_files:
                file_path = upload_manager.upload_dir / uploaded_file.name
                with open(file_path, 'wb') as f:
                    f.write(uploaded_file.getbuffer())
                file_paths.append(file_path)
            
            # Process batch with progress bar
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            def progress_callback(progress, filename, status):
                progress_bar.progress(progress)
                status_text.text(f"Processing: {filename}")
            
            batch_result = batch_processor.process_batch(file_paths, progress_callback)
            
            st.success(f"Batch processing completed!")
            st.metric("Total Files", batch_result['total_files'])
            col_a, col_b = st.columns(2)
            with col_a:
                st.metric("Processed", batch_result['processed'])
            with col_b:
                st.metric("Failed", batch_result['failed'])
    
    with col3:
        st.markdown("### ZIP Archive Upload")
        zip_file = st.file_uploader(
            "Choose ZIP archive",
            type=['zip'],
            help="Upload compressed archive of survey files"
        )
        
        if zip_file:
            # Extract ZIP
            extract_dir = upload_manager.upload_dir / "extracted"
            extract_dir.mkdir(exist_ok=True)
            
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Find LAS files in extracted content
            las_files = list(extract_dir.rglob("*.las")) + list(extract_dir.rglob("*.laz"))
            
            st.info(f"Found {len(las_files)} LAS files in archive")
            
            if las_files and st.button("Process ZIP Archive"):
                batch_result = batch_processor.process_batch(las_files)
                st.json(batch_result)
    
    # File management section
    st.subheader("📋 File Management")
    
    # Display uploaded files
    uploaded_files_list = list(upload_manager.upload_dir.rglob("*.las")) + list(upload_manager.upload_dir.rglob("*.laz"))
    
    if uploaded_files_list:
        st.markdown(f"**{len(uploaded_files_list)} files available for processing**")
        
        # File details table
        file_data = []
        for file_path in uploaded_files_list:
            file_info = file_path.stat()
            file_data.append({
                'Filename': file_path.name,
                'Size (MB)': f"{file_info.st_size / (1024*1024):.2f}",
                'Upload Date': datetime.fromtimestamp(file_info.st_mtime).strftime("%Y-%m-%d %H:%M"),
                'Status': '✅ Ready',
                'Actions': '🔄 Process | 🗑️ Delete'
            })
        
        df = pd.DataFrame(file_data)
        st.dataframe(df, use_container_width=True)
        
        # Bulk actions
        st.subheader("⚡ Bulk Actions")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("🔄 Process All Files"):
                batch_result = batch_processor.process_batch(uploaded_files_list)
                st.json(batch_result)
        
        with col2:
            if st.button("📊 Generate Summary Report"):
                generate_upload_summary(uploaded_files_list)
        
        with col3:
            if st.button("🧹 Clean Up Old Files"):
                cleanup_old_files(upload_manager.upload_dir)
    else:
        st.info("No files uploaded yet. Use the upload methods above to get started.")

def generate_upload_summary(file_list: List[Path]):
    """Generate comprehensive upload summary"""
    st.subheader("📊 Upload Summary Report")
    
    total_size = sum(f.stat().st_size for f in file_list)
    total_size_mb = total_size / (1024 * 1024)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Files", len(file_list))
    with col2:
        st.metric("Total Size", f"{total_size_mb:.2f} MB")
    with col3:
        st.metric("Avg File Size", f"{total_size_mb/len(file_list):.2f} MB")
    
    # File size distribution
    file_sizes = [f.stat().st_size / (1024*1024) for f in file_list]
    
    if PLOTLY_AVAILABLE:
        fig = px.histogram(
            x=file_sizes,
            nbins=20,
            title="File Size Distribution",
            labels={'x': 'Size (MB)', 'y': 'Count'}
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        # Fallback to simple statistics
        st.write("**File Size Statistics:**")
        st.write(f"- Average: {np.mean(file_sizes):.2f} MB")
        st.write(f"- Total: {np.sum(file_sizes):.2f} MB")
        st.write(f"- Range: {np.min(file_sizes):.2f} - {np.max(file_sizes):.2f} MB")

def cleanup_old_files(upload_dir: Path, days_old: int = 7):
    """Clean up files older than specified days"""
    cutoff_date = datetime.now() - timedelta(days=days_old)
    
    cleaned_count = 0
    for file_path in upload_dir.rglob("*"):
        if file_path.is_file():
            file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_time < cutoff_date:
                try:
                    file_path.unlink()
                    cleaned_count += 1
                except:
                    pass
    
    st.success(f"Cleaned up {cleaned_count} old files")

if __name__ == "__main__":
    create_upload_interface()