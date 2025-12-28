"""
Feature Engineering Module

This module extracts geotechnical and topographic features from DEMs and point clouds
for rockfall risk prediction.
"""

import numpy as np
import pandas as pd
import rasterio
from rasterio.features import geometry_mask
from rasterio.windows import Window
from scipy import ndimage
from scipy.spatial.distance import cdist
from scipy.stats import skew, kurtosis
from sklearn.preprocessing import StandardScaler
from typing import List, Tuple, Optional, Dict, Any, Union
from pathlib import Path
import logging
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Optional imports with fallback
try:
    import richdem as rd
    HAS_RICHDEM = True
except ImportError:
    HAS_RICHDEM = False
    print("Warning: richdem not available. Some advanced topographic features will use fallback implementations.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FeatureSet:
    """Container for extracted features"""
    features: pd.DataFrame
    feature_names: List[str]
    coordinates: np.ndarray
    metadata: Dict[str, Any]

class FeatureExtractor:
    """Class for extracting geotechnical features from DEMs and point clouds"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize feature extractor
        
        Args:
            config: Configuration dictionary (optional)
        """
        self.config = config or {}
        self.neighborhood_radius = self.config.get('neighborhood_radius', 5.0)
        
    def extract_topographic_features(self, dem: np.ndarray, dem_info: Any, 
                                   cell_size: float = None) -> Dict[str, np.ndarray]:
        """
        Extract topographic features from DEM
        
        Args:
            dem: DEM array
            dem_info: DEM information object
            cell_size: Cell size in meters (uses dem_info.resolution if None)
            
        Returns:
            Dictionary of feature arrays
        """
        logger.info("Extracting topographic features from DEM")
        
        if cell_size is None:
            cell_size = getattr(dem_info, 'resolution', 1.0)
        
        if not HAS_RICHDEM:
            logger.warning("RichDEM not available, using fallback implementations")
            return self._extract_features_fallback(dem, cell_size)
            
        # Convert to RichDEM format
        rd_dem = rd.rdarray(dem, no_data=getattr(dem_info, 'nodata_value', -9999))
        rd_dem.geotransform = [
            dem_info.bounds[0],  # top-left x
            cell_size,           # pixel width
            0,                   # rotation
            dem_info.bounds[3],  # top-left y
            0,                   # rotation
            -cell_size           # pixel height (negative)
        ]
        
        features = {}
        
        # Slope
        if self.config.get('compute_slope', True):
            logger.info("Computing slope")
            slope = rd.TerrainAttribute(rd_dem, attrib='slope_riserun')
            features['slope'] = np.array(slope)
            
        # Aspect
        if self.config.get('compute_aspect', True):
            logger.info("Computing aspect")
            aspect = rd.TerrainAttribute(rd_dem, attrib='aspect')
            features['aspect'] = np.array(aspect)
            
        # Curvature
        if self.config.get('compute_curvature', True):
            logger.info("Computing curvatures")
            profile_curvature = rd.TerrainAttribute(rd_dem, attrib='profile_curvature')
            planform_curvature = rd.TerrainAttribute(rd_dem, attrib='planform_curvature')
            
            features['profile_curvature'] = np.array(profile_curvature)
            features['planform_curvature'] = np.array(planform_curvature)
            features['total_curvature'] = features['profile_curvature'] + features['planform_curvature']
            
        # Roughness
        if self.config.get('compute_roughness', True):
            logger.info("Computing roughness")
            roughness = self._compute_roughness(dem, dem_info.nodata_value)
            features['roughness'] = roughness
            
        # Topographic Position Index (TPI)
        if self.config.get('compute_tpi', True):
            logger.info("Computing TPI")
            tpi = self._compute_tpi(dem, dem_info.nodata_value)
            features['tpi'] = tpi
            
        # Additional terrain features
        features.update(self._compute_additional_terrain_features(dem, dem_info.nodata_value))
        
        logger.info(f"Extracted {len(features)} topographic features")
        return features
        
    def _compute_roughness(self, dem: np.ndarray, nodata_value: float, 
                          window_size: int = 3) -> np.ndarray:
        """
        Compute surface roughness using standard deviation of elevations
        
        Args:
            dem: DEM array
            nodata_value: NoData value
            window_size: Size of moving window
            
        Returns:
            Roughness array
        """
        # Create kernel for moving window
        kernel = np.ones((window_size, window_size))
        kernel_count = kernel.sum()
        
        # Mask for valid data
        valid_mask = dem != nodata_value
        
        # Compute local mean
        valid_sum = ndimage.generic_filter(
            np.where(valid_mask, dem, 0), 
            np.sum, 
            footprint=kernel,
            mode='constant',
            cval=0
        )
        
        valid_count = ndimage.generic_filter(
            valid_mask.astype(float),
            np.sum,
            footprint=kernel,
            mode='constant',
            cval=0
        )
        
        local_mean = np.divide(valid_sum, valid_count, 
                              out=np.full_like(valid_sum, nodata_value),
                              where=valid_count > 0)
        
        # Compute local standard deviation
        def local_std(values):
            values = values[values != nodata_value]
            if len(values) < 2:
                return nodata_value
            return np.std(values)
            
        roughness = ndimage.generic_filter(
            dem,
            local_std,
            size=window_size,
            mode='constant',
            cval=nodata_value
        )
        
        return roughness
        
    def _compute_tpi(self, dem: np.ndarray, nodata_value: float,
                    window_size: int = 3) -> np.ndarray:
        """
        Compute Topographic Position Index
        
        Args:
            dem: DEM array
            nodata_value: NoData value
            window_size: Size of moving window
            
        Returns:
            TPI array
        """
        # Create kernel (excluding center cell)
        kernel = np.ones((window_size, window_size))
        center = window_size // 2
        kernel[center, center] = 0
        
        # Mask for valid data
        valid_mask = dem != nodata_value
        
        # Compute neighborhood mean
        neighbor_sum = ndimage.generic_filter(
            np.where(valid_mask, dem, 0),
            np.sum,
            footprint=kernel,
            mode='constant',
            cval=0
        )
        
        neighbor_count = ndimage.generic_filter(
            valid_mask.astype(float),
            np.sum,
            footprint=kernel,
            mode='constant',
            cval=0
        )
        
        neighbor_mean = np.divide(neighbor_sum, neighbor_count,
                                 out=np.full_like(neighbor_sum, nodata_value),
                                 where=neighbor_count > 0)
        
        # TPI = elevation - neighborhood mean
        tpi = np.where(valid_mask & (neighbor_mean != nodata_value),
                      dem - neighbor_mean,
                      nodata_value)
        
        return tpi
        
    def _compute_additional_terrain_features(self, dem: np.ndarray, 
                                           nodata_value: float) -> Dict[str, np.ndarray]:
        """
        Compute additional terrain features
        
        Args:
            dem: DEM array
            nodata_value: NoData value
            
        Returns:
            Dictionary of additional features
        """
        features = {}
        valid_mask = dem != nodata_value
        
        # Elevation statistics in neighborhood
        window_size = 5
        
        def local_min(values):
            values = values[values != nodata_value]
            return np.min(values) if len(values) > 0 else nodata_value
            
        def local_max(values):
            values = values[values != nodata_value]
            return np.max(values) if len(values) > 0 else nodata_value
            
        def local_range(values):
            values = values[values != nodata_value]
            return np.max(values) - np.min(values) if len(values) > 0 else nodata_value
            
        features['elevation_min'] = ndimage.generic_filter(
            dem, local_min, size=window_size, mode='constant', cval=nodata_value)
        features['elevation_max'] = ndimage.generic_filter(
            dem, local_max, size=window_size, mode='constant', cval=nodata_value)
        features['elevation_range'] = ndimage.generic_filter(
            dem, local_range, size=window_size, mode='constant', cval=nodata_value)
            
        return features
        
    def extract_point_cloud_features(self, points: np.ndarray, attributes: Dict[str, np.ndarray],
                                   ground_mask: np.ndarray = None) -> Dict[str, np.ndarray]:
        """
        Extract features from point cloud data
        
        Args:
            points: Point cloud array (N, 3)
            attributes: Point attributes dictionary
            ground_mask: Boolean mask for ground points
            
        Returns:
            Dictionary of point cloud features
        """
        logger.info("Extracting point cloud features")
        
        if not self.config.get('point_density_features', True):
            return {}
            
        features = {}
        
        # Point density features
        if self.config.get('point_density_features', True):
            features.update(self._compute_point_density_features(points, ground_mask))
            
        # Intensity features
        if self.config.get('intensity_features', True) and 'intensity' in attributes:
            features.update(self._compute_intensity_features(points, attributes['intensity']))
            
        # Height features
        features.update(self._compute_height_features(points, ground_mask))
        
        # Return features
        features.update(self._compute_return_features(points, attributes))
        
        logger.info(f"Extracted {len(features)} point cloud features")
        return features
        
    def _compute_point_density_features(self, points: np.ndarray, 
                                      ground_mask: np.ndarray = None) -> Dict[str, np.ndarray]:
        """
        Compute point density features
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean mask for ground points
            
        Returns:
            Dictionary of density features
        """
        # Create grid
        resolution = self.config.get('resolution', 1.0)
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        n_cols = int((x_max - x_min) / resolution) + 1
        n_rows = int((y_max - y_min) / resolution) + 1
        
        # Initialize feature arrays
        total_density = np.zeros((n_rows, n_cols))
        ground_density = np.zeros((n_rows, n_cols))
        vegetation_density = np.zeros((n_rows, n_cols))
        
        # Compute densities
        for i, point in enumerate(points):
            col = int((point[0] - x_min) / resolution)
            row = int((y_max - point[1]) / resolution)
            
            if 0 <= row < n_rows and 0 <= col < n_cols:
                total_density[row, col] += 1
                
                if ground_mask is not None:
                    if ground_mask[i]:
                        ground_density[row, col] += 1
                    else:
                        vegetation_density[row, col] += 1
                        
        # Convert to density per square meter
        cell_area = resolution ** 2
        total_density /= cell_area
        ground_density /= cell_area
        vegetation_density /= cell_area
        
        features = {
            'point_density_total': total_density,
            'point_density_ground': ground_density,
            'point_density_vegetation': vegetation_density
        }
        
        return features
        
    def _compute_intensity_features(self, points: np.ndarray, 
                                  intensity: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Compute intensity-based features
        
        Args:
            points: Point cloud array (N, 3)
            intensity: Intensity values
            
        Returns:
            Dictionary of intensity features
        """
        # Create grid
        resolution = self.config.get('resolution', 1.0)
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        n_cols = int((x_max - x_min) / resolution) + 1
        n_rows = int((y_max - y_min) / resolution) + 1
        
        # Initialize arrays
        intensity_mean = np.full((n_rows, n_cols), np.nan)
        intensity_std = np.full((n_rows, n_cols), np.nan)
        intensity_max = np.full((n_rows, n_cols), np.nan)
        intensity_min = np.full((n_rows, n_cols), np.nan)
        
        # Compute statistics for each cell
        for i, point in enumerate(points):
            col = int((point[0] - x_min) / resolution)
            row = int((y_max - point[1]) / resolution)
            
            if 0 <= row < n_rows and 0 <= col < n_cols:
                current_intensity = intensity[i]
                
                if np.isnan(intensity_mean[row, col]):
                    intensity_mean[row, col] = current_intensity
                    intensity_std[row, col] = 0
                    intensity_max[row, col] = current_intensity
                    intensity_min[row, col] = current_intensity
                else:
                    # Update statistics (simplified approach)
                    intensity_max[row, col] = max(intensity_max[row, col], current_intensity)
                    intensity_min[row, col] = min(intensity_min[row, col], current_intensity)
                    
        features = {
            'intensity_mean': np.nan_to_num(intensity_mean, nan=-9999),
            'intensity_std': np.nan_to_num(intensity_std, nan=-9999),
            'intensity_max': np.nan_to_num(intensity_max, nan=-9999),
            'intensity_min': np.nan_to_num(intensity_min, nan=-9999)
        }
        
        return features
        
    def _compute_height_features(self, points: np.ndarray, 
                               ground_mask: np.ndarray = None) -> Dict[str, np.ndarray]:
        """
        Compute height-based features
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean mask for ground points
            
        Returns:
            Dictionary of height features
        """
        # Create grid
        resolution = self.config.get('resolution', 1.0)
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        n_cols = int((x_max - x_min) / resolution) + 1
        n_rows = int((y_max - y_min) / resolution) + 1
        
        # Initialize arrays
        height_mean = np.full((n_rows, n_cols), np.nan)
        height_std = np.full((n_rows, n_cols), np.nan)
        height_max = np.full((n_rows, n_cols), np.nan)
        height_percentile_95 = np.full((n_rows, n_cols), np.nan)
        height_percentile_99 = np.full((n_rows, n_cols), np.nan)
        
        # Group points by grid cell
        for col in range(n_cols):
            for row in range(n_rows):
                x_start = x_min + col * resolution
                x_end = x_start + resolution
                y_start = y_max - (row + 1) * resolution
                y_end = y_start + resolution
                
                # Find points in this cell
                cell_mask = (
                    (points[:, 0] >= x_start) & (points[:, 0] < x_end) &
                    (points[:, 1] >= y_start) & (points[:, 1] < y_end)
                )
                
                if np.any(cell_mask):
                    cell_heights = points[cell_mask, 2]
                    
                    height_mean[row, col] = np.mean(cell_heights)
                    height_std[row, col] = np.std(cell_heights)
                    height_max[row, col] = np.max(cell_heights)
                    height_percentile_95[row, col] = np.percentile(cell_heights, 95)
                    height_percentile_99[row, col] = np.percentile(cell_heights, 99)
                    
        features = {
            'height_mean': np.nan_to_num(height_mean, nan=-9999),
            'height_std': np.nan_to_num(height_std, nan=-9999),
            'height_max': np.nan_to_num(height_max, nan=-9999),
            'height_p95': np.nan_to_num(height_percentile_95, nan=-9999),
            'height_p99': np.nan_to_num(height_percentile_99, nan=-9999)
        }
        
        return features
        
    def _compute_return_features(self, points: np.ndarray, 
                               attributes: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Compute return-based features
        
        Args:
            points: Point cloud array (N, 3)
            attributes: Point attributes dictionary
            
        Returns:
            Dictionary of return features
        """
        features = {}
        
        if 'return_number' in attributes and 'number_of_returns' in attributes:
            # Create grid
            resolution = self.config.get('resolution', 1.0)
            x_min, x_max = points[:, 0].min(), points[:, 0].max()
            y_min, y_max = points[:, 1].min(), points[:, 1].max()
            
            n_cols = int((x_max - x_min) / resolution) + 1
            n_rows = int((y_max - y_min) / resolution) + 1
            
            first_return_ratio = np.zeros((n_rows, n_cols))
            last_return_ratio = np.zeros((n_rows, n_cols))
            
            # Compute return ratios
            for i, point in enumerate(points):
                col = int((point[0] - x_min) / resolution)
                row = int((y_max - point[1]) / resolution)
                
                if 0 <= row < n_rows and 0 <= col < n_cols:
                    return_num = attributes['return_number'][i]
                    num_returns = attributes['number_of_returns'][i]
                    
                    if return_num == 1:
                        first_return_ratio[row, col] += 1
                    if return_num == num_returns:
                        last_return_ratio[row, col] += 1
                        
            # Normalize by total points in each cell
            point_counts = np.zeros((n_rows, n_cols))
            for i, point in enumerate(points):
                col = int((point[0] - x_min) / resolution)
                row = int((y_max - point[1]) / resolution)
                
                if 0 <= row < n_rows and 0 <= col < n_cols:
                    point_counts[row, col] += 1
                    
            first_return_ratio = np.divide(first_return_ratio, point_counts,
                                         out=np.zeros_like(first_return_ratio),
                                         where=point_counts > 0)
            last_return_ratio = np.divide(last_return_ratio, point_counts,
                                        out=np.zeros_like(last_return_ratio),
                                        where=point_counts > 0)
            
            features['first_return_ratio'] = first_return_ratio
            features['last_return_ratio'] = last_return_ratio
            
        return features
        
    def extract_temporal_features(self, dem1: np.ndarray, dem2: np.ndarray, 
                                dem_info: Any, time_diff_days: float) -> Dict[str, np.ndarray]:
        """
        Extract temporal change features from multiple DEMs
        
        Args:
            dem1: Earlier DEM
            dem2: Later DEM
            dem_info: DEM information
            time_diff_days: Time difference in days
            
        Returns:
            Dictionary of temporal features
        """
        logger.info("Extracting temporal features")
        
        if not self.config.get('compute_dod', True):
            return {}
            
        features = {}
        
        # Difference of DEMs
        dod = dem2 - dem1
        valid_mask = (dem1 != dem_info.nodata_value) & (dem2 != dem_info.nodata_value)
        dod[~valid_mask] = dem_info.nodata_value
        
        features['elevation_change'] = dod
        
        # Rate of change
        if time_diff_days > 0:
            change_rate = dod / time_diff_days * 365  # Annual rate
            change_rate[~valid_mask] = dem_info.nodata_value
            features['elevation_change_rate'] = change_rate
            
        # Change magnitude
        change_magnitude = np.abs(dod)
        change_magnitude[~valid_mask] = dem_info.nodata_value
        features['change_magnitude'] = change_magnitude
        
        # Change direction (erosion vs deposition)
        erosion_mask = (dod < -0.1) & valid_mask  # 10cm threshold
        deposition_mask = (dod > 0.1) & valid_mask
        
        change_type = np.zeros_like(dod)
        change_type[erosion_mask] = -1  # Erosion
        change_type[deposition_mask] = 1  # Deposition
        change_type[~valid_mask] = dem_info.nodata_value
        features['change_type'] = change_type
        
        logger.info(f"Extracted {len(features)} temporal features")
        return features
        
    def create_feature_dataframe(self, feature_dict: Dict[str, np.ndarray], 
                                coordinates: np.ndarray = None,
                                mask: np.ndarray = None) -> FeatureSet:
        """
        Convert feature dictionary to structured DataFrame
        
        Args:
            feature_dict: Dictionary of feature arrays
            coordinates: Coordinate array (N, 2) for x, y
            mask: Boolean mask for valid pixels
            
        Returns:
            FeatureSet object
        """
        logger.info("Creating feature DataFrame")
        
        if len(feature_dict) == 0:
            logger.warning("No features provided")
            return FeatureSet(
                features=pd.DataFrame(),
                feature_names=[],
                coordinates=np.array([]),
                metadata={}
            )
            
        # Get first feature to determine shape
        first_feature = next(iter(feature_dict.values()))
        shape = first_feature.shape
        
        # Create coordinate grid if not provided
        if coordinates is None:
            y_coords, x_coords = np.mgrid[0:shape[0], 0:shape[1]]
            coordinates = np.column_stack([x_coords.ravel(), y_coords.ravel()])
        
        # Apply mask if provided
        if mask is not None:
            valid_indices = mask.ravel()
        else:
            # Create mask from non-nodata values
            nodata_value = -9999.0
            valid_mask = np.ones(shape, dtype=bool)
            
            for feature_name, feature_array in feature_dict.items():
                if np.any(feature_array == nodata_value):
                    valid_mask &= (feature_array != nodata_value)
                    
            valid_indices = valid_mask.ravel()
            
        # Convert features to DataFrame
        feature_data = {}
        feature_names = []
        
        for feature_name, feature_array in feature_dict.items():
            if feature_array.shape != shape:
                logger.warning(f"Feature {feature_name} has different shape {feature_array.shape}, expected {shape}")
                continue
                
            flattened = feature_array.ravel()[valid_indices]
            feature_data[feature_name] = flattened
            feature_names.append(feature_name)
            
        df = pd.DataFrame(feature_data)
        valid_coords = coordinates[valid_indices]
        
        # Create metadata
        metadata = {
            'total_pixels': np.prod(shape),
            'valid_pixels': np.sum(valid_indices),
            'feature_count': len(feature_names),
            'shape': shape
        }
        
        feature_set = FeatureSet(
            features=df,
            feature_names=feature_names,
            coordinates=valid_coords,
            metadata=metadata
        )
        
        logger.info(f"Created feature DataFrame with {len(df)} samples and {len(feature_names)} features")
        return feature_set
        
    def save_features(self, feature_set: FeatureSet, output_path: str):
        """
        Save feature set to files
        
        Args:
            feature_set: FeatureSet object
            output_path: Output path (without extension)
        """
        output_path = Path(output_path)
        
        # Save features as CSV
        feature_set.features.to_csv(f"{output_path}_features.csv", index=False)
        
        # Save coordinates
        np.save(f"{output_path}_coordinates.npy", feature_set.coordinates)
        
        # Save metadata as JSON
        import json
        with open(f"{output_path}_metadata.json", 'w') as f:
            json.dump(feature_set.metadata, f, indent=2)
            
        logger.info(f"Saved features to {output_path}")
    
    def _extract_features_fallback(self, dem: np.ndarray, cell_size: float) -> Dict[str, np.ndarray]:
        """
        Fallback feature extraction without RichDEM
        """
        features = {}
        
        # Simple slope calculation using gradient
        if self.config.get('compute_slope', True):
            logger.info("Computing slope (fallback)")
            gy, gx = np.gradient(dem, cell_size, cell_size)
            slope = np.sqrt(gx**2 + gy**2)
            features['slope'] = slope
            
        # Simple aspect calculation  
        if self.config.get('compute_aspect', True):
            logger.info("Computing aspect (fallback)")
            gy, gx = np.gradient(dem, cell_size, cell_size)
            aspect = np.arctan2(-gx, gy) * 180 / np.pi
            aspect = (aspect + 360) % 360  # Convert to 0-360 degrees
            features['aspect'] = aspect
            
        # Simple curvature approximation
        if self.config.get('compute_curvature', True):
            logger.info("Computing curvature (fallback)")
            # Second derivatives
            gy, gx = np.gradient(dem, cell_size, cell_size)
            gyy, gyx = np.gradient(gy, cell_size, cell_size)
            gxy, gxx = np.gradient(gx, cell_size, cell_size)
            
            # Profile curvature approximation
            profile_curvature = (gxx * gy**2 - 2 * gxy * gx * gy + gyy * gx**2) / (gx**2 + gy**2)**(3/2)
            profile_curvature = np.nan_to_num(profile_curvature)
            features['profile_curvature'] = profile_curvature
            
            # Planform curvature approximation
            planform_curvature = (gxx * gy**2 - 2 * gxy * gx * gy + gyy * gx**2) / (gx**2 + gy**2)**(3/2)  
            planform_curvature = np.nan_to_num(planform_curvature)
            features['planform_curvature'] = planform_curvature
            
        # Roughness
        if self.config.get('compute_roughness', True):
            logger.info("Computing roughness (fallback)")
            # Standard deviation in local neighborhood
            from scipy import ndimage
            roughness = ndimage.generic_filter(dem, np.std, size=3, mode='constant', cval=0)
            features['roughness'] = roughness
            
        logger.info(f"Extracted {len(features)} features using fallback methods")
        return features

def main():
    """Example usage"""
    # Configuration
    config = {
        'resolution': 1.0,
        'compute_slope': True,
        'compute_aspect': True,
        'compute_curvature': True,
        'compute_roughness': True,
        'compute_tpi': True,
        'point_density_features': True,
        'intensity_features': True,
        'compute_dod': True,
        'neighborhood_radius': 5.0
    }
    
    # Initialize extractor
    extractor = FeatureExtractor(config)
    
    # Create synthetic DEM for testing
    np.random.seed(42)
    shape = (100, 100)
    x = np.linspace(0, 99, shape[1])
    y = np.linspace(0, 99, shape[0])
    X, Y = np.meshgrid(x, y)
    
    # Create terrain-like surface
    dem = (np.sin(X/10) * np.cos(Y/10) * 5 + 
           np.random.normal(0, 0.1, shape) + 50)
    
    # Mock DEM info
    from types import SimpleNamespace
    dem_info = SimpleNamespace()
    dem_info.resolution = 1.0
    dem_info.nodata_value = -9999.0
    dem_info.bounds = (0, 0, 99, 99)
    
    # Extract topographic features
    topo_features = extractor.extract_topographic_features(dem, dem_info)
    
    # Create feature DataFrame
    feature_set = extractor.create_feature_dataframe(topo_features)
    
    # Save features
    output_dir = Path("outputs/features")
    output_dir.mkdir(parents=True, exist_ok=True)
    extractor.save_features(feature_set, output_dir / "example_features")
    
    print(f"Feature extraction complete! Extracted {len(feature_set.feature_names)} features")
    print(f"Feature names: {feature_set.feature_names}")

if __name__ == "__main__":
    main()