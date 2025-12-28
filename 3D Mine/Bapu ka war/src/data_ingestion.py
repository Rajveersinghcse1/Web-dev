"""
LiDAR Data Ingestion and Processing Module

This module handles loading, cleaning, and preprocessing of LiDAR .las files
for rockfall prediction analysis.
"""

import numpy as np
import pandas as pd
import laspy
from typing import List, Tuple, Optional, Dict, Any
from pathlib import Path
import logging
from dataclasses import dataclass
import json

# Optional imports with fallback
try:
    import open3d as o3d
    HAS_OPEN3D = True
except ImportError:
    HAS_OPEN3D = False
    print("Warning: open3d not available. Some 3D processing features will be disabled.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PointCloudStats:
    """Statistics for point cloud data"""
    total_points: int
    ground_points: int
    vegetation_points: int
    noise_points: int
    bounds: Dict[str, Tuple[float, float]]
    point_density: float
    
class LiDARProcessor:
    """Main class for processing LiDAR data"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize LiDAR processor with configuration
        
        Args:
            config: Configuration dictionary (optional)
        """
        self.config = config or {}
        self.point_clouds = []
        self.stats = []
        
    def load_las_file(self, file_path: str) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """
        Load a single LAS file
        
        Args:
            file_path: Path to the LAS file
            
        Returns:
            Tuple of (points array, attributes dictionary)
        """
        try:
            logger.info(f"Loading LAS file: {file_path}")
            
            # Read LAS file
            las_file = laspy.read(file_path)
            
            # Extract coordinates
            points = np.vstack([
                las_file.x,
                las_file.y, 
                las_file.z
            ]).transpose()
            
            # Extract attributes
            attributes = {}
            
            # Standard attributes
            if hasattr(las_file, 'intensity'):
                attributes['intensity'] = las_file.intensity
            if hasattr(las_file, 'return_number'):
                attributes['return_number'] = las_file.return_number
            if hasattr(las_file, 'number_of_returns'):
                attributes['number_of_returns'] = las_file.number_of_returns
            if hasattr(las_file, 'classification'):
                attributes['classification'] = las_file.classification
            if hasattr(las_file, 'scan_angle_rank'):
                attributes['scan_angle'] = las_file.scan_angle_rank
                
            # GPS time if available
            if hasattr(las_file, 'gps_time'):
                attributes['gps_time'] = las_file.gps_time
                
            # RGB if available
            if hasattr(las_file, 'red'):
                attributes['red'] = las_file.red
                attributes['green'] = las_file.green
                attributes['blue'] = las_file.blue
                
            logger.info(f"Loaded {len(points)} points from {file_path}")
            return points, attributes
            
        except Exception as e:
            logger.error(f"Error loading LAS file {file_path}: {str(e)}")
            raise
            
    def load_multiple_las_files(self, file_paths: List[str]) -> List[Tuple[np.ndarray, Dict[str, np.ndarray]]]:
        """
        Load multiple LAS files
        
        Args:
            file_paths: List of paths to LAS files
            
        Returns:
            List of (points, attributes) tuples
        """
        point_clouds = []
        
        for file_path in file_paths:
            try:
                points, attributes = self.load_las_file(file_path)
                point_clouds.append((points, attributes))
            except Exception as e:
                logger.warning(f"Skipping file {file_path} due to error: {str(e)}")
                continue
                
        return point_clouds
        
    def remove_outliers(self, points: np.ndarray, method: str = "statistical") -> Tuple[np.ndarray, np.ndarray]:
        """
        Remove outliers from point cloud
        
        Args:
            points: Point cloud array (N, 3)
            method: Outlier removal method ("statistical" or "radius")
            
        Returns:
            Tuple of (cleaned_points, outlier_mask)
        """
        logger.info(f"Removing outliers using {method} method")
        
        if not HAS_OPEN3D:
            # Fallback to simple statistical outlier removal
            logger.warning("Open3D not available, using simple statistical outlier removal")
            return self._remove_outliers_simple(points, method)
        
        # Convert to Open3D format
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        
        if method == "statistical":
            # Statistical outlier removal
            pcd_clean, outlier_mask = pcd.remove_statistical_outlier(
                nb_neighbors=20,
                std_ratio=self.config.get('noise_threshold', 2.0)
            )
        elif method == "radius":
            # Radius outlier removal
            pcd_clean, outlier_mask = pcd.remove_radius_outlier(
                nb_points=16,
                radius=self.config.get('outlier_radius', 0.5)
            )
        else:
            raise ValueError(f"Unknown outlier removal method: {method}")
            
        cleaned_points = np.asarray(pcd_clean.points)
        outlier_indices = np.where(np.logical_not(outlier_mask))[0]
        
        logger.info(f"Removed {len(outlier_indices)} outliers ({len(outlier_indices)/len(points)*100:.1f}%)")
        
        return cleaned_points, np.array(outlier_mask)
    
    def _remove_outliers_simple(self, points: np.ndarray, method: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Simple outlier removal without Open3D dependency
        """
        if method == "statistical":
            # Simple statistical outlier removal using Z-score
            mean_z = np.mean(points[:, 2])
            std_z = np.std(points[:, 2])
            z_threshold = self.config.get('noise_threshold', 2.0)
            
            # Keep points within threshold standard deviations
            z_scores = np.abs((points[:, 2] - mean_z) / std_z)
            valid_mask = z_scores < z_threshold
            
            cleaned_points = points[valid_mask]
            logger.info(f"Removed {np.sum(~valid_mask)} outliers ({np.sum(~valid_mask)/len(points)*100:.1f}%)")
            
            return cleaned_points, valid_mask
        else:
            # For radius method without Open3D, just return original points
            logger.warning("Radius outlier removal requires Open3D, returning original points")
            return points, np.ones(len(points), dtype=bool)
        
    def classify_ground_points(self, points: np.ndarray, method: str = "smrf") -> np.ndarray:
        """
        Classify ground points using specified method
        
        Args:
            points: Point cloud array (N, 3)
            method: Ground classification method ("smrf" or "progressive_tin")
            
        Returns:
            Boolean array indicating ground points
        """
        logger.info(f"Classifying ground points using {method}")
        
        if method == "smrf":
            return self._classify_ground_smrf(points)
        elif method == "progressive_tin":
            return self._classify_ground_progressive_tin(points)
        else:
            raise ValueError(f"Unknown ground classification method: {method}")
            
    def _classify_ground_smrf(self, points: np.ndarray) -> np.ndarray:
        """
        Simple Morphological Filter (SMRF) for ground classification
        
        Args:
            points: Point cloud array (N, 3)
            
        Returns:
            Boolean array indicating ground points
        """
        # Simplified SMRF implementation
        # In a full implementation, you would use PDAL or a specialized library
        
        # Create initial ground estimate using lowest points in grid
        resolution = self.config.get('resolution', 1.0)
        
        # Grid the points
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        x_bins = int((x_max - x_min) / resolution) + 1
        y_bins = int((y_max - y_min) / resolution) + 1
        
        # Find minimum Z value in each grid cell
        ground_mask = np.zeros(len(points), dtype=bool)
        
        for i in range(x_bins):
            for j in range(y_bins):
                x_start = x_min + i * resolution
                x_end = x_start + resolution
                y_start = y_min + j * resolution
                y_end = y_start + resolution
                
                # Find points in this grid cell
                cell_mask = (
                    (points[:, 0] >= x_start) & (points[:, 0] < x_end) &
                    (points[:, 1] >= y_start) & (points[:, 1] < y_end)
                )
                
                if np.any(cell_mask):
                    cell_points = points[cell_mask]
                    # Find points within threshold of minimum Z
                    min_z = cell_points[:, 2].min()
                    height_threshold = 0.5  # meters
                    
                    ground_candidates = cell_mask & (points[:, 2] <= min_z + height_threshold)
                    ground_mask |= ground_candidates
                    
        logger.info(f"Classified {np.sum(ground_mask)} ground points ({np.sum(ground_mask)/len(points)*100:.1f}%)")
        return ground_mask
        
    def _classify_ground_progressive_tin(self, points: np.ndarray) -> np.ndarray:
        """
        Progressive TIN densification for ground classification
        
        Args:
            points: Point cloud array (N, 3)
            
        Returns:
            Boolean array indicating ground points
        """
        # Simplified progressive TIN implementation
        # For production use, consider using PDAL or specialized libraries
        
        # Start with seed points (lowest points in coarse grid)
        resolution = self.config.get('resolution', 1.0) * 4  # Coarse initial grid
        
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        x_bins = max(1, int((x_max - x_min) / resolution))
        y_bins = max(1, int((y_max - y_min) / resolution))
        
        seed_points = []
        
        for i in range(x_bins):
            for j in range(y_bins):
                x_start = x_min + i * resolution
                x_end = x_start + resolution
                y_start = y_min + j * resolution
                y_end = y_start + resolution
                
                cell_mask = (
                    (points[:, 0] >= x_start) & (points[:, 0] < x_end) &
                    (points[:, 1] >= y_start) & (points[:, 1] < y_end)
                )
                
                if np.any(cell_mask):
                    cell_points = points[cell_mask]
                    min_idx = np.argmin(cell_points[:, 2])
                    seed_points.append(np.where(cell_mask)[0][min_idx])
                    
        # Initialize ground mask with seed points
        ground_mask = np.zeros(len(points), dtype=bool)
        ground_mask[seed_points] = True
        
        # Iteratively add points that are close to the TIN surface
        max_iterations = 5
        angle_threshold = 15.0  # degrees
        distance_threshold = 1.0  # meters
        
        for iteration in range(max_iterations):
            # For simplicity, use height-based classification
            # In full implementation, would build TIN and check angles/distances
            current_ground = points[ground_mask]
            if len(current_ground) < 3:
                break
                
            # Estimate ground surface height for each point
            for i, point in enumerate(points):
                if ground_mask[i]:
                    continue
                    
                # Find nearby ground points
                distances = np.linalg.norm(current_ground[:, :2] - point[:2], axis=1)
                nearby_mask = distances < distance_threshold * 2
                
                if np.any(nearby_mask):
                    nearby_ground = current_ground[nearby_mask]
                    estimated_height = np.mean(nearby_ground[:, 2])
                    
                    if abs(point[2] - estimated_height) < distance_threshold:
                        ground_mask[i] = True
                        
        logger.info(f"Classified {np.sum(ground_mask)} ground points ({np.sum(ground_mask)/len(points)*100:.1f}%)")
        return ground_mask
        
    def classify_vegetation(self, points: np.ndarray, ground_mask: np.ndarray) -> np.ndarray:
        """
        Classify vegetation points
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean array indicating ground points
            
        Returns:
            Boolean array indicating vegetation points
        """
        vegetation_threshold = self.config.get('vegetation_threshold', 2.0)
        
        # Estimate ground height for each point
        ground_points = points[ground_mask]
        vegetation_mask = np.zeros(len(points), dtype=bool)
        
        if len(ground_points) == 0:
            return vegetation_mask
            
        for i, point in enumerate(points):
            if ground_mask[i]:
                continue
                
            # Find nearby ground points
            distances = np.linalg.norm(ground_points[:, :2] - point[:2], axis=1)
            if len(distances) > 0:
                min_distance_idx = np.argmin(distances)
                if distances[min_distance_idx] < 10.0:  # Within 10m
                    ground_height = ground_points[min_distance_idx, 2]
                    height_above_ground = point[2] - ground_height
                    
                    if height_above_ground > vegetation_threshold:
                        vegetation_mask[i] = True
                        
        logger.info(f"Classified {np.sum(vegetation_mask)} vegetation points ({np.sum(vegetation_mask)/len(points)*100:.1f}%)")
        return vegetation_mask
        
    def compute_statistics(self, points: np.ndarray, ground_mask: np.ndarray, 
                          vegetation_mask: np.ndarray, noise_mask: np.ndarray = None) -> PointCloudStats:
        """
        Compute statistics for the point cloud
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean array indicating ground points
            vegetation_mask: Boolean array indicating vegetation points
            noise_mask: Boolean array indicating noise points
            
        Returns:
            PointCloudStats object
        """
        if noise_mask is None:
            noise_mask = np.zeros(len(points), dtype=bool)
            
        # Compute bounds
        bounds = {
            'x': (points[:, 0].min(), points[:, 0].max()),
            'y': (points[:, 1].min(), points[:, 1].max()),
            'z': (points[:, 2].min(), points[:, 2].max())
        }
        
        # Compute point density (points per square meter)
        area = (bounds['x'][1] - bounds['x'][0]) * (bounds['y'][1] - bounds['y'][0])
        point_density = len(points) / area if area > 0 else 0
        
        stats = PointCloudStats(
            total_points=len(points),
            ground_points=np.sum(ground_mask),
            vegetation_points=np.sum(vegetation_mask),
            noise_points=np.sum(noise_mask),
            bounds=bounds,
            point_density=point_density
        )
        
        return stats
        
    def process_point_cloud(self, file_path: str) -> Dict[str, Any]:
        """
        Complete processing pipeline for a single point cloud
        
        Args:
            file_path: Path to LAS file
            
        Returns:
            Dictionary containing processed data and statistics
        """
        logger.info(f"Processing point cloud: {file_path}")
        
        # Load data
        points, attributes = self.load_las_file(file_path)
        
        # Remove outliers if configured
        if self.config.get('outlier_removal', True):
            points, outlier_mask = self.remove_outliers(points)
            # Update attributes to match cleaned points
            for key, values in attributes.items():
                attributes[key] = values[outlier_mask]
        
        # Classify ground points
        ground_method = self.config.get('ground_filter', 'smrf')
        ground_mask = self.classify_ground_points(points, ground_method)
        
        # Classify vegetation if configured
        vegetation_mask = np.zeros(len(points), dtype=bool)
        if self.config.get('classify_points', True):
            vegetation_mask = self.classify_vegetation(points, ground_mask)
            
        # Compute statistics
        stats = self.compute_statistics(points, ground_mask, vegetation_mask)
        
        # Prepare result
        result = {
            'points': points,
            'attributes': attributes,
            'ground_mask': ground_mask,
            'vegetation_mask': vegetation_mask,
            'stats': stats,
            'file_path': file_path
        }
        
        logger.info(f"Processing complete for {file_path}")
        logger.info(f"Statistics: {stats}")
        
        return result
        
    def save_processed_data(self, processed_data: Dict[str, Any], output_path: str):
        """
        Save processed point cloud data
        
        Args:
            processed_data: Dictionary from process_point_cloud
            output_path: Output file path (without extension)
        """
        output_path = Path(output_path)
        
        # Save points as numpy arrays
        np.save(f"{output_path}_points.npy", processed_data['points'])
        np.save(f"{output_path}_ground_mask.npy", processed_data['ground_mask'])
        np.save(f"{output_path}_vegetation_mask.npy", processed_data['vegetation_mask'])
        
        # Save attributes
        attributes_path = f"{output_path}_attributes.npz"
        np.savez(attributes_path, **processed_data['attributes'])
        
        # Save statistics as JSON
        stats_dict = {
            'total_points': processed_data['stats'].total_points,
            'ground_points': processed_data['stats'].ground_points,
            'vegetation_points': processed_data['stats'].vegetation_points,
            'noise_points': processed_data['stats'].noise_points,
            'bounds': processed_data['stats'].bounds,
            'point_density': processed_data['stats'].point_density,
            'file_path': processed_data['file_path']
        }
        
        with open(f"{output_path}_stats.json", 'w') as f:
            json.dump(stats_dict, f, indent=2)
            
        logger.info(f"Saved processed data to {output_path}")

def main():
    """Example usage"""
    # Configuration
    config = {
        'resolution': 1.0,
        'outlier_removal': True,
        'noise_threshold': 2.0,
        'ground_filter': 'smrf',
        'classify_points': True,
        'vegetation_threshold': 2.0
    }
    
    # Initialize processor
    processor = LiDARProcessor(config)
    
    # Example file path (update with actual path)
    las_file = "data/raw_las/example.las"
    
    if Path(las_file).exists():
        # Process point cloud
        result = processor.process_point_cloud(las_file)
        
        # Save results
        output_path = "data/processed/example"
        processor.save_processed_data(result, output_path)
        
        print(f"Processing complete! Results saved to {output_path}")
    else:
        print(f"Example file {las_file} not found. Please provide a valid LAS file path.")

if __name__ == "__main__":
    main()