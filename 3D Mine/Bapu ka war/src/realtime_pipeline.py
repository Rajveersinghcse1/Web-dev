"""
Real-time Processing Pipeline for Mining Operations

Production-grade processing pipeline with queue management, error handling,
status monitoring, and continuous field operations support.
"""

import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import asyncio
import threading
import queue
import time
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass, asdict
import sqlite3
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import psutil
import gc

# Import our modules with error handling
try:
    from data_ingestion import LiDARProcessor
    from model_3d_generation import Model3DGenerator as DEMGenerator
    from feature_engineering import FeatureExtractor
    from ml_training import RockfallPredictor
    CORE_MODULES_AVAILABLE = True
except ImportError as e:
    st.error(f"Core modules not available: {e}")
    CORE_MODULES_AVAILABLE = False
    
    # Create dummy classes
    class LiDARProcessor:
        def load_las_file(self, path): return {'points': np.random.rand(1000, 3) * 100}
    
    class DEMGenerator:
        def generate_dem(self, points): return {'dem': np.random.rand(50, 50) * 100, 'resolution': 1.0}
    
    class FeatureExtractor:
        def extract_features(self, dem_data): return {'feature1': 0.5, 'feature2': 0.3}
    
    class RockfallPredictor:
        def predict_risk(self, features): return np.random.uniform(0.2, 0.8)

class TaskStatus(Enum):
    """Task processing status"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    """Task priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class ProcessingTask:
    """Processing task data structure"""
    task_id: str
    file_path: str
    task_type: str
    priority: TaskPriority
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: TaskStatus = TaskStatus.QUEUED
    progress: float = 0.0
    error_message: str = ""
    result_data: Dict[str, Any] = None
    retry_count: int = 0
    estimated_duration: float = 0.0
    actual_duration: float = 0.0

class ProcessingPipeline:
    """Real-time processing pipeline for mining operations"""
    
    def __init__(self, max_workers: int = 4, db_path: str = "data/pipeline.db"):
        self.max_workers = max_workers
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Processing components
        self.task_queue = queue.PriorityQueue()
        self.active_tasks = {}
        self.completed_tasks = {}
        
        # Thread pool for parallel processing
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.process_executor = ProcessPoolExecutor(max_workers=max_workers)
        
        # Processing modules
        self.lidar_processor = LiDARProcessor()
        self.dem_generator = DEMGenerator()
        self.feature_extractor = FeatureExtractor()
        self.ml_predictor = None  # Initialize when needed
        
        # Monitoring
        self.performance_metrics = {
            'tasks_processed': 0,
            'tasks_failed': 0,
            'avg_processing_time': 0.0,
            'system_load': 0.0,
            'memory_usage': 0.0
        }
        
        # Initialize database and start monitoring
        self.init_database()
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._monitor_system)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('data/pipeline.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def init_database(self):
        """Initialize pipeline database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processing_tasks (
                task_id TEXT PRIMARY KEY,
                file_path TEXT NOT NULL,
                task_type TEXT NOT NULL,
                priority INTEGER NOT NULL,
                status TEXT NOT NULL,
                progress REAL DEFAULT 0.0,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                error_message TEXT,
                result_data TEXT,
                retry_count INTEGER DEFAULT 0,
                estimated_duration REAL DEFAULT 0.0,
                actual_duration REAL DEFAULT 0.0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_metrics (
                timestamp TEXT PRIMARY KEY,
                tasks_processed INTEGER,
                tasks_failed INTEGER,
                avg_processing_time REAL,
                system_load REAL,
                memory_usage REAL,
                active_tasks INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def add_task(self, file_path: str, task_type: str, priority: TaskPriority = TaskPriority.NORMAL) -> str:
        """Add a new processing task to the queue"""
        task_id = f"{task_type}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        task = ProcessingTask(
            task_id=task_id,
            file_path=file_path,
            task_type=task_type,
            priority=priority,
            created_at=datetime.now()
        )
        
        # Estimate duration based on task type and file size
        task.estimated_duration = self._estimate_duration(file_path, task_type)
        
        # Add to priority queue (lower number = higher priority)
        self.task_queue.put((-priority.value, datetime.now(), task))
        
        # Save to database
        self._save_task_to_db(task)
        
        self.logger.info(f"Added task {task_id} to queue with priority {priority.name}")
        return task_id
        
    def _estimate_duration(self, file_path: str, task_type: str) -> float:
        """Estimate processing duration based on file size and task type"""
        try:
            file_size_mb = Path(file_path).stat().st_size / (1024 * 1024)
            
            # Base estimates (in seconds)
            base_times = {
                'full_analysis': 2.0,  # 2 seconds per MB
                'quick_analysis': 0.5,  # 0.5 seconds per MB
                'feature_extraction': 1.0,  # 1 second per MB
                'risk_assessment': 0.8  # 0.8 seconds per MB
            }
            
            base_time = base_times.get(task_type, 1.0)
            return file_size_mb * base_time
            
        except Exception:
            return 60.0  # Default 1 minute estimate
            
    def _save_task_to_db(self, task: ProcessingTask):
        """Save task to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO processing_tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            task.task_id,
            task.file_path,
            task.task_type,
            task.priority.value,
            task.status.value,
            task.progress,
            task.created_at.isoformat(),
            task.started_at.isoformat() if task.started_at else None,
            task.completed_at.isoformat() if task.completed_at else None,
            task.error_message,
            json.dumps(task.result_data) if task.result_data else None,
            task.retry_count,
            task.estimated_duration,
            task.actual_duration
        ))
        
        conn.commit()
        conn.close()
        
    def start_processing(self):
        """Start the processing pipeline"""
        self.logger.info("Starting processing pipeline")
        
        # Start worker threads
        for i in range(self.max_workers):
            worker = threading.Thread(target=self._worker_loop, args=(i,))
            worker.daemon = True
            worker.start()
            
    def _worker_loop(self, worker_id: int):
        """Main worker loop for processing tasks"""
        self.logger.info(f"Worker {worker_id} started")
        
        while True:
            try:
                # Get task from queue with timeout
                try:
                    _, timestamp, task = self.task_queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                    
                # Process the task
                self._process_task(task, worker_id)
                
            except Exception as e:
                self.logger.error(f"Worker {worker_id} error: {str(e)}")
                time.sleep(1)
                
    def _process_task(self, task: ProcessingTask, worker_id: int):
        """Process a single task"""
        task.status = TaskStatus.PROCESSING
        task.started_at = datetime.now()
        self.active_tasks[task.task_id] = task
        
        self.logger.info(f"Worker {worker_id} processing task {task.task_id}")
        
        try:
            # Update progress callback
            def progress_callback(progress: float, message: str = ""):
                task.progress = progress
                self._save_task_to_db(task)
                
            # Process based on task type
            if task.task_type == 'full_analysis':
                result = self._run_full_analysis(task.file_path, progress_callback)
            elif task.task_type == 'quick_analysis':
                result = self._run_quick_analysis(task.file_path, progress_callback)
            elif task.task_type == 'feature_extraction':
                result = self._run_feature_extraction(task.file_path, progress_callback)
            elif task.task_type == 'risk_assessment':
                result = self._run_risk_assessment(task.file_path, progress_callback)
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")
                
            # Task completed successfully
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            task.actual_duration = (task.completed_at - task.started_at).total_seconds()
            task.result_data = result
            task.progress = 100.0
            
            self.completed_tasks[task.task_id] = task
            self.performance_metrics['tasks_processed'] += 1
            
            self.logger.info(f"Task {task.task_id} completed successfully")
            
        except Exception as e:
            # Task failed
            task.status = TaskStatus.FAILED
            task.completed_at = datetime.now()
            task.actual_duration = (task.completed_at - task.started_at).total_seconds()
            task.error_message = str(e)
            
            self.performance_metrics['tasks_failed'] += 1
            
            self.logger.error(f"Task {task.task_id} failed: {str(e)}")
            
            # Retry logic
            if task.retry_count < 3:
                task.retry_count += 1
                task.status = TaskStatus.QUEUED
                task.started_at = None
                self.task_queue.put((-task.priority.value, datetime.now(), task))
                self.logger.info(f"Retrying task {task.task_id} (attempt {task.retry_count})")
            
        finally:
            # Clean up
            if task.task_id in self.active_tasks:
                del self.active_tasks[task.task_id]
            self._save_task_to_db(task)
            
            # Force garbage collection
            gc.collect()
            
    def _run_full_analysis(self, file_path: str, progress_callback: Callable) -> Dict[str, Any]:
        """Run complete analysis pipeline"""
        result = {'analysis_type': 'full', 'stages': {}}
        
        try:
            # Stage 1: Data ingestion
            progress_callback(10, "Loading LiDAR data...")
            points, attributes = self.lidar_processor.load_las_file(file_path)
            
            # Calculate bounds
            bounds = {
                'min_x': float(np.min(points[:, 0])),
                'max_x': float(np.max(points[:, 0])),
                'min_y': float(np.min(points[:, 1])),
                'max_y': float(np.max(points[:, 1])),
                'min_z': float(np.min(points[:, 2])),
                'max_z': float(np.max(points[:, 2]))
            }
            
            result['stages']['data_ingestion'] = {
                'status': 'completed',
                'point_count': len(points),
                'bounds': bounds
            }
            
            # Stage 2: 3D model generation
            progress_callback(30, "Generating 3D model...")
            dem_data = self.dem_generator.generate_dem(points)
            result['stages']['3d_model'] = {
                'status': 'completed',
                'dem_shape': dem_data['dem'].shape if dem_data.get('dem') is not None else None,
                'resolution': dem_data.get('resolution', 1.0)
            }
            
            # Stage 3: Feature extraction
            progress_callback(60, "Extracting features...")
            features = self.feature_extractor.extract_features(dem_data)
            result['stages']['feature_extraction'] = {
                'status': 'completed',
                'feature_count': len(features),
                'features': features
            }
            
            # Stage 4: Risk prediction
            progress_callback(90, "Predicting rockfall risk...")
            if self.ml_predictor is None:
                self.ml_predictor = RockfallPredictor()
                
            risk_prediction = self.ml_predictor.predict_risk(features)
            result['stages']['risk_prediction'] = {
                'status': 'completed',
                'risk_score': risk_prediction,
                'risk_level': 'High' if risk_prediction > 0.7 else 'Medium' if risk_prediction > 0.3 else 'Low'
            }
            
            progress_callback(100, "Analysis completed")
            
            result['summary'] = {
                'risk_score': risk_prediction,
                'point_count': len(points),
                'coverage_area': dem_data.get('coverage_area', 0),
                'processing_time': time.time()
            }
            
            return result
            
        except Exception as e:
            result['error'] = str(e)
            result['status'] = 'failed'
            raise
            
    def _run_quick_analysis(self, file_path: str, progress_callback: Callable) -> Dict[str, Any]:
        """Run quick analysis for rapid assessment"""
        result = {'analysis_type': 'quick'}
        
        try:
            progress_callback(20, "Loading data...")
            points, attributes = self.lidar_processor.load_las_file(file_path)
            
            progress_callback(60, "Quick feature extraction...")
            # Simplified feature extraction
            quick_features = {
                'elevation_range': float(np.max(points[:, 2]) - np.min(points[:, 2])),
                'point_density': len(points) / 1000,  # points per 1000 units
                'elevation_std': float(np.std(points[:, 2])),
                'slope_estimate': float(np.percentile(np.gradient(points[:, 2]), 95))
            }
            
            progress_callback(90, "Quick risk assessment...")
            # Simple risk calculation
            risk_factors = [
                quick_features['elevation_range'] / 100.0,  # Normalize elevation range
                quick_features['slope_estimate'] / 10.0,    # Normalize slope
                min(1.0, quick_features['elevation_std'] / 50.0)  # Normalize std
            ]
            
            quick_risk = np.clip(np.mean(risk_factors), 0.0, 1.0)
            
            result.update({
                'features': quick_features,
                'risk_score': quick_risk,
                'risk_level': 'High' if quick_risk > 0.7 else 'Medium' if quick_risk > 0.3 else 'Low',
                'point_count': len(points),
                'processing_time': time.time()
            })
            
            progress_callback(100, "Quick analysis completed")
            return result
            
        except Exception as e:
            result['error'] = str(e)
            raise
            
    def _run_feature_extraction(self, file_path: str, progress_callback: Callable) -> Dict[str, Any]:
        """Run feature extraction only"""
        result = {'analysis_type': 'features'}
        
        try:
            progress_callback(20, "Loading data...")
            lidar_data = self.lidar_processor.load_las_file(file_path)
            
            progress_callback(40, "Generating DEM...")
            dem_data = self.dem_generator.generate_dem(lidar_data['points'])
            
            progress_callback(80, "Extracting features...")
            features = self.feature_extractor.extract_features(dem_data)
            
            result.update({
                'features': features,
                'point_count': len(lidar_data['points']),
                'dem_shape': dem_data['dem'].shape if dem_data.get('dem') is not None else None
            })
            
            progress_callback(100, "Feature extraction completed")
            return result
            
        except Exception as e:
            result['error'] = str(e)
            raise
            
    def _run_risk_assessment(self, file_path: str, progress_callback: Callable) -> Dict[str, Any]:
        """Run risk assessment with existing features"""
        result = {'analysis_type': 'risk_assessment'}
        
        try:
            # This would typically use pre-computed features
            # For now, we'll do a quick feature extraction
            progress_callback(30, "Extracting features...")
            lidar_data = self.lidar_processor.load_las_file(file_path)
            dem_data = self.dem_generator.generate_dem(lidar_data['points'])
            features = self.feature_extractor.extract_features(dem_data)
            
            progress_callback(80, "Assessing risk...")
            if self.ml_predictor is None:
                self.ml_predictor = RockfallPredictor()
                
            risk_score = self.ml_predictor.predict_risk(features)
            
            result.update({
                'risk_score': risk_score,
                'risk_level': 'High' if risk_score > 0.7 else 'Medium' if risk_score > 0.3 else 'Low',
                'confidence': 0.85,  # Mock confidence
                'recommendations': self._generate_recommendations(risk_score, features)
            })
            
            progress_callback(100, "Risk assessment completed")
            return result
            
        except Exception as e:
            result['error'] = str(e)
            raise
            
    def _generate_recommendations(self, risk_score: float, features: Dict) -> List[str]:
        """Generate recommendations based on risk score and features"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.append("IMMEDIATE: Restrict access to high-risk areas")
            recommendations.append("Install additional monitoring equipment")
            recommendations.append("Conduct detailed geological survey")
        elif risk_score > 0.4:
            recommendations.append("Increase monitoring frequency")
            recommendations.append("Review slope stability measures")
        else:
            recommendations.append("Continue routine monitoring")
            
        # Feature-specific recommendations
        if features.get('slope_stability', 1.0) < 0.5:
            recommendations.append("Consider slope reinforcement")
            
        return recommendations
        
    def _monitor_system(self):
        """Monitor system performance"""
        while self.monitoring_active:
            try:
                # Update performance metrics
                self.performance_metrics['system_load'] = psutil.cpu_percent()
                self.performance_metrics['memory_usage'] = psutil.virtual_memory().percent
                
                # Calculate average processing time
                completed_durations = [task.actual_duration for task in self.completed_tasks.values() 
                                     if task.actual_duration > 0]
                if completed_durations:
                    self.performance_metrics['avg_processing_time'] = np.mean(completed_durations)
                
                # Save metrics to database
                self._save_metrics_to_db()
                
                time.sleep(10)  # Update every 10 seconds
                
            except Exception as e:
                self.logger.error(f"Monitoring error: {str(e)}")
                time.sleep(10)
                
    def _save_metrics_to_db(self):
        """Save performance metrics to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO system_metrics VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            self.performance_metrics['tasks_processed'],
            self.performance_metrics['tasks_failed'],
            self.performance_metrics['avg_processing_time'],
            self.performance_metrics['system_load'],
            self.performance_metrics['memory_usage'],
            len(self.active_tasks)
        ))
        
        conn.commit()
        conn.close()
        
    def get_task_status(self, task_id: str) -> Optional[ProcessingTask]:
        """Get status of a specific task"""
        # Check active tasks first
        if task_id in self.active_tasks:
            return self.active_tasks[task_id]
            
        # Check completed tasks
        if task_id in self.completed_tasks:
            return self.completed_tasks[task_id]
            
        # Check database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM processing_tasks WHERE task_id = ?", (task_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            # Convert database row to ProcessingTask
            task = ProcessingTask(
                task_id=row[0],
                file_path=row[1],
                task_type=row[2],
                priority=TaskPriority(row[3]),
                status=TaskStatus(row[4]),
                created_at=datetime.fromisoformat(row[6])
            )
            task.progress = row[5]
            task.started_at = datetime.fromisoformat(row[7]) if row[7] else None
            task.completed_at = datetime.fromisoformat(row[8]) if row[8] else None
            task.error_message = row[9] or ""
            task.result_data = json.loads(row[10]) if row[10] else None
            task.retry_count = row[11]
            task.estimated_duration = row[12]
            task.actual_duration = row[13]
            
            return task
            
        return None
        
    def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        return {
            'queue_size': self.task_queue.qsize(),
            'active_tasks': len(self.active_tasks),
            'completed_tasks': len(self.completed_tasks),
            'performance_metrics': self.performance_metrics.copy()
        }
        
def create_pipeline_interface():
    """Create the processing pipeline interface"""
    st.title("⚡ Real-time Processing Pipeline")
    st.markdown("*Production-grade processing with queue management and monitoring*")
    
    # Initialize pipeline
    if 'pipeline' not in st.session_state:
        st.session_state.pipeline = ProcessingPipeline(max_workers=2)
        st.session_state.pipeline.start_processing()
    
    pipeline = st.session_state.pipeline
    
    # Pipeline control panel
    st.subheader("🎛️ Pipeline Control")
    
    col1, col2, col3, col4 = st.columns(4)
    
    queue_status = pipeline.get_queue_status()
    
    with col1:
        st.metric("Queue Size", queue_status['queue_size'])
    with col2:
        st.metric("Active Tasks", queue_status['active_tasks'])
    with col3:
        st.metric("Completed", queue_status['completed_tasks'])
    with col4:
        st.metric("System Load", f"{queue_status['performance_metrics']['system_load']:.1f}%")
    
    # Add new task section
    st.subheader("➕ Add Processing Task")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # File selection
        uploaded_files = list(Path("data/uploads").glob("*.las")) if Path("data/uploads").exists() else []
        if uploaded_files:
            selected_file = st.selectbox("Select File", [f.name for f in uploaded_files])
            file_path = f"data/uploads/{selected_file}"
        else:
            file_path = st.text_input("File Path", "data/synthetic_survey_001.las")
    
    with col2:
        task_type = st.selectbox("Task Type", [
            "full_analysis",
            "quick_analysis", 
            "feature_extraction",
            "risk_assessment"
        ])
    
    with col3:
        priority = st.selectbox("Priority", [
            "LOW", "NORMAL", "HIGH", "CRITICAL"
        ])
    
    if st.button("🚀 Add Task to Queue"):
        task_id = pipeline.add_task(
            file_path=file_path,
            task_type=task_type,
            priority=TaskPriority[priority]
        )
        st.success(f"Task {task_id} added to queue!")
        st.rerun()
    
    # Active tasks monitoring
    st.subheader("🔄 Active Tasks")
    
    if pipeline.active_tasks:
        for task_id, task in pipeline.active_tasks.items():
            with st.container():
                col1, col2, col3 = st.columns([2, 1, 1])
                
                with col1:
                    st.text(f"📁 {Path(task.file_path).name}")
                    st.text(f"🔧 {task.task_type}")
                
                with col2:
                    st.text(f"Priority: {task.priority.name}")
                    st.text(f"Worker: Processing")
                
                with col3:
                    st.progress(task.progress / 100.0)
                    st.text(f"{task.progress:.1f}%")
                
                st.divider()
    else:
        st.info("No active tasks currently processing")
    
    # Recent completed tasks
    st.subheader("✅ Recent Completions")
    
    if pipeline.completed_tasks:
        # Show last 5 completed tasks
        recent_tasks = list(pipeline.completed_tasks.values())[-5:]
        
        for task in reversed(recent_tasks):
            with st.expander(f"📋 {Path(task.file_path).name} - {task.task_type}"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.text(f"Status: {task.status.value}")
                    st.text(f"Duration: {task.actual_duration:.1f}s")
                    st.text(f"Completed: {task.completed_at.strftime('%H:%M:%S')}")
                
                with col2:
                    if task.result_data:
                        st.json(task.result_data)
                    if task.error_message:
                        st.error(task.error_message)
    else:
        st.info("No completed tasks yet")
    
    # System monitoring
    st.subheader("📊 System Monitoring")
    
    # Performance metrics
    metrics = queue_status['performance_metrics']
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            "Tasks Processed", 
            metrics['tasks_processed'],
            delta=metrics['tasks_processed'] - metrics['tasks_failed']
        )
    
    with col2:
        st.metric(
            "Avg Processing Time",
            f"{metrics['avg_processing_time']:.1f}s"
        )
    
    with col3:
        st.metric(
            "Memory Usage",
            f"{metrics['memory_usage']:.1f}%"
        )
    
    # Auto-refresh
    if st.checkbox("🔄 Auto-refresh (5s)", value=True):
        time.sleep(5)
        st.rerun()

if __name__ == "__main__":
    create_pipeline_interface()