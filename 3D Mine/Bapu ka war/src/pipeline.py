"""
Deployment Pipeline Module

This module handles automated processing of new LiDAR data,
model predictions, and alert generation.
"""

import os
import sys
import logging
import yaml
import json
import smtplib
import schedule
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import numpy as np
import pandas as pd
import rasterio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Import our custom modules
from data_ingestion import LiDARProcessor
from model_3d_generation import Model3DGenerator
from feature_engineering import FeatureExtractor
from ml_training import RockfallPredictor

# Create logs directory if it doesn't exist
import os
logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(logs_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(logs_dir, 'pipeline.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LASFileHandler(FileSystemEventHandler):
    """Handler for monitoring new LAS files"""
    
    def __init__(self, pipeline):
        self.pipeline = pipeline
        
    def on_created(self, event):
        if event.is_file and event.src_path.endswith('.las'):
            logger.info(f"New LAS file detected: {event.src_path}")
            self.pipeline.process_new_file(event.src_path)

class AlertSystem:
    """Alert and notification system"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.alert_config = config.get('monitoring', {})
        
    def check_risk_thresholds(self, risk_map: np.ndarray, coordinates: np.ndarray,
                             dem_info: Any) -> List[Dict[str, Any]]:
        """
        Check for areas exceeding risk thresholds
        
        Args:
            risk_map: Risk probability array
            coordinates: Coordinate array
            dem_info: DEM information
            
        Returns:
            List of alert dictionaries
        """
        alerts = []
        threshold = self.alert_config.get('alert_threshold', 0.8)
        critical_zones = self.alert_config.get('critical_zones', [])
        
        # Find high-risk pixels
        high_risk_mask = risk_map > threshold
        
        if np.any(high_risk_mask):
            # Get coordinates of high-risk areas
            high_risk_coords = coordinates[high_risk_mask.flatten()]
            high_risk_probs = risk_map.flatten()[high_risk_mask.flatten()]
            
            # Group nearby high-risk areas
            clusters = self._cluster_high_risk_areas(high_risk_coords, high_risk_probs)
            
            for cluster in clusters:
                alert = {
                    'timestamp': datetime.now().isoformat(),
                    'location': f"Coordinates: ({cluster['center_x']:.1f}, {cluster['center_y']:.1f})",
                    'risk_level': self._classify_risk_level(cluster['max_probability']),
                    'probability': cluster['max_probability'],
                    'area_affected': cluster['area'],
                    'description': f"High risk area detected with {cluster['pixel_count']} affected pixels"
                }
                
                # Check if in critical zone
                alert['in_critical_zone'] = self._is_in_critical_zone(
                    cluster['center_x'], cluster['center_y'], critical_zones
                )
                
                alerts.append(alert)
                
        return alerts
        
    def _cluster_high_risk_areas(self, coordinates: np.ndarray, 
                                probabilities: np.ndarray, 
                                cluster_distance: float = 50.0) -> List[Dict[str, Any]]:
        """
        Cluster nearby high-risk pixels into alert zones
        
        Args:
            coordinates: High-risk pixel coordinates
            probabilities: Risk probabilities
            cluster_distance: Maximum distance for clustering (meters)
            
        Returns:
            List of cluster information
        """
        if len(coordinates) == 0:
            return []
            
        from sklearn.cluster import DBSCAN
        
        # Cluster coordinates
        clustering = DBSCAN(eps=cluster_distance, min_samples=3)
        cluster_labels = clustering.fit_predict(coordinates)
        
        clusters = []
        
        for cluster_id in set(cluster_labels):
            if cluster_id == -1:  # Noise points
                continue
                
            cluster_mask = cluster_labels == cluster_id
            cluster_coords = coordinates[cluster_mask]
            cluster_probs = probabilities[cluster_mask]
            
            cluster_info = {
                'center_x': np.mean(cluster_coords[:, 0]),
                'center_y': np.mean(cluster_coords[:, 1]),
                'max_probability': np.max(cluster_probs),
                'mean_probability': np.mean(cluster_probs),
                'pixel_count': len(cluster_coords),
                'area': len(cluster_coords) * (self._get_pixel_area())
            }
            
            clusters.append(cluster_info)
            
        return clusters
        
    def _get_pixel_area(self) -> float:
        """Get pixel area in square meters"""
        resolution = self.config.get('resolution', 1.0)
        return resolution ** 2
        
    def _classify_risk_level(self, probability: float) -> str:
        """Classify risk level based on probability"""
        if probability >= 0.8:
            return "CRITICAL"
        elif probability >= 0.6:
            return "HIGH"
        elif probability >= 0.4:
            return "MEDIUM"
        else:
            return "LOW"
            
    def _is_in_critical_zone(self, x: float, y: float, 
                           critical_zones: List[Dict]) -> bool:
        """Check if coordinates are in critical zone"""
        for zone in critical_zones:
            # Simple bounding box check (can be extended for polygons)
            if ('bounds' in zone and
                zone['bounds']['x_min'] <= x <= zone['bounds']['x_max'] and
                zone['bounds']['y_min'] <= y <= zone['bounds']['y_max']):
                return True
        return False
        
    def send_email_alert(self, alerts: List[Dict[str, Any]]):
        """
        Send email alerts
        
        Args:
            alerts: List of alert dictionaries
        """
        email_config = self.alert_config.get('email', {})
        if not email_config.get('enabled', False):
            return
            
        smtp_server = email_config.get('smtp_server')
        smtp_port = email_config.get('smtp_port', 587)
        username = email_config.get('username')
        password = email_config.get('password')
        recipients = email_config.get('recipients', [])
        
        if not all([smtp_server, username, password, recipients]):
            logger.warning("Email configuration incomplete, skipping email alerts")
            return
            
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = username
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = f"Rockfall Risk Alert - {len(alerts)} New Alerts"
            
            # Create email body
            body = self._create_email_body(alerts)
            msg.attach(MIMEText(body, 'html'))
            
            # Send email
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(username, password)
            text = msg.as_string()
            server.sendmail(username, recipients, text)
            server.quit()
            
            logger.info(f"Email alert sent to {len(recipients)} recipients")
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {str(e)}")
            
    def _create_email_body(self, alerts: List[Dict[str, Any]]) -> str:
        """Create HTML email body for alerts"""
        
        html = """
        <html>
        <head>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .critical { background-color: #ffebee; color: #c62828; }
                .high { background-color: #fff3e0; color: #ef6c00; }
                .medium { background-color: #f3e5f5; color: #7b1fa2; }
                .low { background-color: #e8f5e8; color: #2e7d32; }
            </style>
        </head>
        <body>
            <h2>🚨 Rockfall Risk Alert</h2>
            <p>New high-risk areas have been detected in the mine. Please review the following alerts:</p>
            
            <table>
                <tr>
                    <th>Timestamp</th>
                    <th>Location</th>
                    <th>Risk Level</th>
                    <th>Probability</th>
                    <th>Area Affected</th>
                    <th>Critical Zone</th>
                </tr>
        """
        
        for alert in alerts:
            risk_class = alert['risk_level'].lower()
            critical_icon = "⚠️" if alert.get('in_critical_zone', False) else ""
            
            html += f"""
                <tr class="{risk_class}">
                    <td>{alert['timestamp']}</td>
                    <td>{alert['location']}</td>
                    <td>{alert['risk_level']}</td>
                    <td>{alert['probability']:.3f}</td>
                    <td>{alert.get('area_affected', 'N/A'):.1f} m²</td>
                    <td>{critical_icon}</td>
                </tr>
            """
            
        html += """
            </table>
            
            <p><strong>Recommended Actions:</strong></p>
            <ul>
                <li>Inspect high-risk areas immediately</li>
                <li>Consider restricting access to critical zones</li>
                <li>Monitor areas for continued changes</li>
                <li>Update safety protocols as needed</li>
            </ul>
            
            <p>This is an automated alert from the Rockfall Risk Prediction System.</p>
        </body>
        </html>
        """
        
        return html

class RockfallPipeline:
    """Main automated processing pipeline"""
    
    def __init__(self, config_path: str = 'config/config.yaml'):
        """
        Initialize pipeline
        
        Args:
            config_path: Path to configuration file
        """
        self.config = self._load_config(config_path)
        
        # Initialize components
        self.lidar_processor = LiDARProcessor(self.config.get('data', {}))
        self.model_generator = Model3DGenerator(self.config.get('data', {}))
        self.feature_extractor = FeatureExtractor(self.config.get('features', {}))
        self.predictor = RockfallPredictor(self.config.get('ml', {}))
        self.alert_system = AlertSystem(self.config)
        
        # Load trained model
        self.model_results = None
        self._load_trained_model()
        
        # Setup directories
        self._setup_directories()
        
        # File monitoring
        self.observer = None
        
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            return {}
            
    def _load_trained_model(self):
        """Load pre-trained ML model"""
        model_path = Path('models/rockfall_model')
        
        if model_path.with_suffix('_model.pkl').exists():
            try:
                self.model_results = self.predictor.load_model(str(model_path))
                logger.info("Loaded pre-trained model successfully")
            except Exception as e:
                logger.error(f"Error loading model: {str(e)}")
                self.model_results = None
        else:
            logger.warning("No pre-trained model found. Train a model first.")
            
    def _setup_directories(self):
        """Setup required directories"""
        directories = [
            'data/raw_las',
            'data/processed',
            'outputs/dem',
            'outputs/3d_models',
            'outputs/features',
            'outputs/predictions',
            'logs'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            
    def start_monitoring(self, watch_directory: str = 'data/raw_las'):
        """
        Start monitoring directory for new LAS files
        
        Args:
            watch_directory: Directory to monitor
        """
        logger.info(f"Starting file monitoring on {watch_directory}")
        
        event_handler = LASFileHandler(self)
        self.observer = Observer()
        self.observer.schedule(event_handler, watch_directory, recursive=False)
        self.observer.start()
        
    def stop_monitoring(self):
        """Stop file monitoring"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("File monitoring stopped")
            
    def process_new_file(self, file_path: str):
        """
        Process a new LAS file through the complete pipeline
        
        Args:
            file_path: Path to new LAS file
        """
        logger.info(f"Processing new file: {file_path}")
        
        try:
            # Step 1: Process point cloud
            processed_data = self.lidar_processor.process_point_cloud(file_path)
            
            # Step 2: Generate DEM
            dem, dem_info = self.model_generator.create_dem_from_points(
                processed_data['points'],
                processed_data['ground_mask']
            )
            
            # Step 3: Extract features
            topo_features = self.feature_extractor.extract_topographic_features(
                dem, dem_info
            )
            
            pc_features = self.feature_extractor.extract_point_cloud_features(
                processed_data['points'],
                processed_data['attributes'],
                processed_data['ground_mask']
            )
            
            # Combine features
            all_features = {**topo_features, **pc_features}
            feature_set = self.feature_extractor.create_feature_dataframe(all_features)
            
            # Step 4: Make predictions
            if self.model_results is not None:
                predictions, probabilities = self.predictor.predict(
                    self.model_results, feature_set.features
                )
                
                # Reshape probabilities to match DEM
                prob_map = probabilities.reshape(dem.shape)
                
                # Step 5: Check for alerts
                alerts = self.alert_system.check_risk_thresholds(
                    prob_map, feature_set.coordinates, dem_info
                )
                
                # Step 6: Save outputs
                self._save_outputs(file_path, dem, dem_info, prob_map, alerts)
                
                # Step 7: Send alerts if any
                if alerts:
                    logger.info(f"Generated {len(alerts)} alerts")
                    self.alert_system.send_email_alert(alerts)
                    
                logger.info(f"Successfully processed {file_path}")
                
            else:
                logger.error("No trained model available for predictions")
                
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            
    def _save_outputs(self, input_file: str, dem: np.ndarray, dem_info: Any,
                     risk_map: np.ndarray, alerts: List[Dict]):
        """Save processing outputs"""
        
        # Create output filename base
        input_path = Path(input_file)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_base = f"{input_path.stem}_{timestamp}"
        
        # Save DEM
        dem_path = Path(f"outputs/dem/{output_base}_dem.tif")
        self.model_generator.save_dem_geotiff(dem, dem_info, str(dem_path))
        
        # Save risk map
        risk_path = Path(f"outputs/predictions/{output_base}_risk.tif")
        risk_info = dem_info  # Use same georeferencing
        self.model_generator.save_dem_geotiff(risk_map, risk_info, str(risk_path))
        
        # Save alerts
        if alerts:
            alert_path = Path(f"outputs/predictions/{output_base}_alerts.json")
            with open(alert_path, 'w') as f:
                json.dump(alerts, f, indent=2)
                
    def run_scheduled_processing(self):
        """Run scheduled processing of existing files"""
        logger.info("Running scheduled processing")
        
        # Process any unprocessed files in the raw_las directory
        raw_las_dir = Path('data/raw_las')
        
        for las_file in raw_las_dir.glob('*.las'):
            # Check if already processed (simple timestamp check)
            if self._needs_processing(las_file):
                self.process_new_file(str(las_file))
                
    def _needs_processing(self, las_file: Path) -> bool:
        """Check if LAS file needs processing"""
        # Simple check based on file modification time
        # In production, would use a more sophisticated tracking system
        
        processed_dir = Path('data/processed')
        processed_file = processed_dir / f"{las_file.stem}_processed.json"
        
        if not processed_file.exists():
            return True
            
        # Check if LAS file is newer than processed file
        las_mtime = las_file.stat().st_mtime
        processed_mtime = processed_file.stat().st_mtime
        
        return las_mtime > processed_mtime
        
    def schedule_jobs(self):
        """Setup scheduled jobs"""
        # Schedule regular processing
        schedule.every(1).hours.do(self.run_scheduled_processing)
        
        # Schedule model retraining (daily)
        schedule.every().day.at("02:00").do(self._retrain_model_if_needed)
        
        # Schedule cleanup (weekly)
        schedule.every().week.do(self._cleanup_old_files)
        
    def _retrain_model_if_needed(self):
        """Check and retrain model if needed"""
        logger.info("Checking if model retraining is needed")
        # Implementation would check for new training data, performance degradation, etc.
        pass
        
    def _cleanup_old_files(self):
        """Clean up old files"""
        logger.info("Cleaning up old files")
        
        # Remove files older than configured retention period
        retention_days = self.config.get('cleanup', {}).get('retention_days', 30)
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        cleanup_dirs = ['outputs/dem', 'outputs/predictions', 'logs']
        
        for directory in cleanup_dirs:
            dir_path = Path(directory)
            if dir_path.exists():
                for file_path in dir_path.iterdir():
                    if file_path.is_file():
                        file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                        if file_mtime < cutoff_date:
                            file_path.unlink()
                            logger.info(f"Deleted old file: {file_path}")
                            
    def run(self):
        """Run the complete pipeline"""
        logger.info("Starting Rockfall Prediction Pipeline")
        
        # Setup scheduled jobs
        self.schedule_jobs()
        
        # Start file monitoring
        self.start_monitoring()
        
        try:
            # Main loop
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
        except KeyboardInterrupt:
            logger.info("Pipeline interrupted by user")
        except Exception as e:
            logger.error(f"Pipeline error: {str(e)}")
        finally:
            self.stop_monitoring()
            logger.info("Pipeline stopped")

def main():
    """Main function for running the pipeline"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Rockfall Prediction Pipeline')
    parser.add_argument('--config', default='config/config.yaml',
                       help='Configuration file path')
    parser.add_argument('--mode', choices=['monitor', 'process', 'single'],
                       default='monitor',
                       help='Pipeline mode: monitor (continuous), process (scheduled), single (one file)')
    parser.add_argument('--file', help='Single file to process (for single mode)')
    
    args = parser.parse_args()
    
    # Initialize pipeline
    pipeline = RockfallPipeline(args.config)
    
    if args.mode == 'monitor':
        # Continuous monitoring mode
        pipeline.run()
    elif args.mode == 'process':
        # Scheduled processing mode
        pipeline.run_scheduled_processing()
    elif args.mode == 'single':
        # Single file processing
        if args.file:
            pipeline.process_new_file(args.file)
        else:
            print("Error: --file required for single mode")
            sys.exit(1)

if __name__ == "__main__":
    main()