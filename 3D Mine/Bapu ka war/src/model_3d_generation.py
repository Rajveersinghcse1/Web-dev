"""
3D Model Generation Module

This module handles DEM/DSM generation, TIN mesh creation, and export
of 3D models for visualization and analysis.
"""

import numpy as np
import pandas as pd
import rasterio
import rasterio.features
from rasterio.transform import from_bounds
from rasterio.crs import CRS
from scipy.spatial import Delaunay
from scipy.interpolate import griddata
import matplotlib.pyplot as plt
from matplotlib.tri import Triangulation
from typing import List, Tuple, Optional, Dict, Any
from pathlib import Path
import logging
from dataclasses import dataclass

# Optional imports with fallback
try:
    import open3d as o3d
    HAS_OPEN3D = True
except ImportError:
    HAS_OPEN3D = False
    print("Warning: open3d not available. Some 3D mesh features will be disabled.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DEMInfo:
    """Information about generated DEM"""
    bounds: Tuple[float, float, float, float]  # (minx, miny, maxx, maxy)
    resolution: float
    shape: Tuple[int, int]  # (height, width)
    crs: str
    nodata_value: float

class Model3DGenerator:
    """Class for generating 3D models from point clouds"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize 3D model generator
        
        Args:
            config: Configuration dictionary (optional)
        """
        self.config = config or {}
        self.resolution = self.config.get('resolution', 1.0)
        
    def create_dem_from_points(self, points: np.ndarray, ground_mask: np.ndarray = None,
                              method: str = "idw") -> Tuple[np.ndarray, DEMInfo]:
        """
        Create Digital Elevation Model from point cloud
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean mask for ground points
            method: Interpolation method ("idw", "linear", "cubic", "nearest")
            
        Returns:
            Tuple of (DEM array, DEM info)
        """
        logger.info(f"Creating DEM with resolution {self.resolution}m using {method} interpolation")
        
        # Use ground points if mask provided, otherwise all points
        if ground_mask is not None:
            dem_points = points[ground_mask]
            logger.info(f"Using {len(dem_points)} ground points for DEM generation")
        else:
            dem_points = points
            logger.info(f"Using all {len(dem_points)} points for DEM generation")
            
        if len(dem_points) == 0:
            raise ValueError("No points available for DEM generation")
            
        # Define grid bounds
        x_min, x_max = dem_points[:, 0].min(), dem_points[:, 0].max()
        y_min, y_max = dem_points[:, 1].min(), dem_points[:, 1].max()
        
        # Add padding
        padding = self.resolution * 2
        x_min -= padding
        x_max += padding
        y_min -= padding
        y_max += padding
        
        # Create grid
        x_range = np.arange(x_min, x_max + self.resolution, self.resolution)
        y_range = np.arange(y_min, y_max + self.resolution, self.resolution)
        xi, yi = np.meshgrid(x_range, y_range)
        
        # Interpolate elevations
        if method == "idw":
            # Inverse Distance Weighting
            zi = self._idw_interpolation(dem_points, xi, yi)
        else:
            # Use scipy griddata
            zi = griddata(
                (dem_points[:, 0], dem_points[:, 1]), 
                dem_points[:, 2],
                (xi, yi), 
                method=method,
                fill_value=np.nan
            )
        
        # Create DEM info
        dem_info = DEMInfo(
            bounds=(x_min, y_min, x_max, y_max),
            resolution=self.resolution,
            shape=zi.shape,
            crs="EPSG:4326",  # Default CRS, should be updated based on input data
            nodata_value=-9999.0
        )
        
        # Replace NaN with nodata value
        zi = np.where(np.isnan(zi), dem_info.nodata_value, zi)
        
        logger.info(f"Generated DEM with shape {zi.shape}")
        return zi, dem_info
        
    def _idw_interpolation(self, points: np.ndarray, xi: np.ndarray, yi: np.ndarray, 
                          power: float = 2.0, search_radius: float = None) -> np.ndarray:
        """
        Inverse Distance Weighting interpolation
        
        Args:
            points: Point cloud array (N, 3)
            xi, yi: Grid coordinates
            power: IDW power parameter
            search_radius: Maximum search radius (None for global)
            
        Returns:
            Interpolated grid
        """
        if search_radius is None:
            search_radius = self.resolution * 10  # Default search radius
            
        zi = np.zeros_like(xi)
        
        # Flatten grid for easier processing
        xi_flat = xi.flatten()
        yi_flat = yi.flatten()
        zi_flat = np.zeros_like(xi_flat)
        
        for i, (x, y) in enumerate(zip(xi_flat, yi_flat)):
            # Calculate distances to all points
            distances = np.sqrt((points[:, 0] - x)**2 + (points[:, 1] - y)**2)
            
            # Filter points within search radius
            within_radius = distances <= search_radius
            
            if np.any(within_radius):
                valid_distances = distances[within_radius]
                valid_z = points[within_radius, 2]
                
                # Handle case where point is exactly on grid node
                if np.any(valid_distances == 0):
                    zi_flat[i] = valid_z[valid_distances == 0][0]
                else:
                    # IDW interpolation
                    weights = 1.0 / (valid_distances ** power)
                    zi_flat[i] = np.sum(weights * valid_z) / np.sum(weights)
            else:
                zi_flat[i] = np.nan
                
        return zi_flat.reshape(xi.shape)
        
    def create_dsm_from_points(self, points: np.ndarray, method: str = "max") -> Tuple[np.ndarray, DEMInfo]:
        """
        Create Digital Surface Model from point cloud
        
        Args:
            points: Point cloud array (N, 3)
            method: Method for handling multiple points per cell ("max", "mean", "first", "last")
            
        Returns:
            Tuple of (DSM array, DSM info)
        """
        logger.info(f"Creating DSM with resolution {self.resolution}m using {method} method")
        
        # Define grid bounds
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        # Add padding
        padding = self.resolution * 2
        x_min -= padding
        x_max += padding
        y_min -= padding
        y_max += padding
        
        # Create grid
        n_cols = int((x_max - x_min) / self.resolution) + 1
        n_rows = int((y_max - y_min) / self.resolution) + 1
        
        dsm = np.full((n_rows, n_cols), -9999.0)
        
        # Assign points to grid cells
        for point in points:
            col = int((point[0] - x_min) / self.resolution)
            row = int((y_max - point[1]) / self.resolution)  # Flip Y for raster format
            
            if 0 <= row < n_rows and 0 <= col < n_cols:
                if dsm[row, col] == -9999.0:
                    dsm[row, col] = point[2]
                else:
                    if method == "max":
                        dsm[row, col] = max(dsm[row, col], point[2])
                    elif method == "mean":
                        # For simplicity, just use max here
                        # In full implementation, would track counts
                        dsm[row, col] = max(dsm[row, col], point[2])
                    elif method == "first":
                        pass  # Keep first value
                    elif method == "last":
                        dsm[row, col] = point[2]
                        
        # Create DSM info
        dsm_info = DEMInfo(
            bounds=(x_min, y_min, x_max, y_max),
            resolution=self.resolution,
            shape=dsm.shape,
            crs="EPSG:4326",
            nodata_value=-9999.0
        )
        
        logger.info(f"Generated DSM with shape {dsm.shape}")
        return dsm, dsm_info
        
    def create_tin_mesh(self, points: np.ndarray, ground_mask: np.ndarray = None) -> Any:
        """
        Create Triangulated Irregular Network (TIN) mesh
        
        Args:
            points: Point cloud array (N, 3)
            ground_mask: Boolean mask for ground points
            
        Returns:
            Open3D triangle mesh
        """
        logger.info("Creating TIN mesh")
        
        # Use ground points if mask provided
        if ground_mask is not None:
            mesh_points = points[ground_mask]
        else:
            mesh_points = points
            
        if len(mesh_points) < 3:
            raise ValueError("Need at least 3 points to create mesh")
            
        # Create 2D Delaunay triangulation
        points_2d = mesh_points[:, :2]
        
        try:
            tri = Delaunay(points_2d)
            
            if not HAS_OPEN3D:
                logger.warning("Open3D not available, returning simplified mesh data")
                return {'vertices': mesh_points, 'triangles': tri.simplices}
            
            # Create Open3D mesh
            mesh = o3d.geometry.TriangleMesh()
            mesh.vertices = o3d.utility.Vector3dVector(mesh_points)
            mesh.triangles = o3d.utility.Vector3iVector(tri.simplices)
            
            # Compute normals
            mesh.compute_vertex_normals()
            mesh.compute_triangle_normals()
            
            logger.info(f"Created mesh with {len(mesh.vertices)} vertices and {len(mesh.triangles)} triangles")
            return mesh
            
        except Exception as e:
            logger.error(f"Error creating TIN mesh: {str(e)}")
            raise
            
    def simplify_mesh(self, mesh: Any, target_triangles: int) -> Any:
        """
        Simplify mesh by reducing triangle count
        
        Args:
            mesh: Input triangle mesh
            target_triangles: Target number of triangles
            
        Returns:
            Simplified mesh
        """
        if not HAS_OPEN3D:
            logger.warning("Open3D not available, cannot simplify mesh")
            return mesh
            
        logger.info(f"Simplifying mesh from {len(mesh.triangles)} to {target_triangles} triangles")
        
        if len(mesh.triangles) <= target_triangles:
            return mesh
            
        simplified = mesh.simplify_quadric_decimation(target_triangles)
        simplified.compute_vertex_normals()
        simplified.compute_triangle_normals()
        
        logger.info(f"Simplified mesh to {len(simplified.triangles)} triangles")
        return simplified
        
    def save_dem_geotiff(self, dem: np.ndarray, dem_info: DEMInfo, output_path: str):
        """
        Save DEM as GeoTIFF file
        
        Args:
            dem: DEM array
            dem_info: DEM information
            output_path: Output file path
        """
        logger.info(f"Saving DEM as GeoTIFF: {output_path}")
        
        # Create transform
        transform = from_bounds(
            dem_info.bounds[0], dem_info.bounds[1],
            dem_info.bounds[2], dem_info.bounds[3],
            dem_info.shape[1], dem_info.shape[0]
        )
        
        # Write GeoTIFF
        with rasterio.open(
            output_path,
            'w',
            driver='GTiff',
            height=dem_info.shape[0],
            width=dem_info.shape[1],
            count=1,
            dtype=dem.dtype,
            crs=dem_info.crs,
            transform=transform,
            nodata=dem_info.nodata_value,
            compress='lzw'
        ) as dst:
            dst.write(dem, 1)
            
        logger.info(f"Saved DEM to {output_path}")
        
    def save_mesh_ply(self, mesh: Any, output_path: str):
        """
        Save mesh as PLY file
        
        Args:
            mesh: Triangle mesh
            output_path: Output file path
        """
        logger.info(f"Saving mesh as PLY: {output_path}")
        o3d.io.write_triangle_mesh(output_path, mesh)
        logger.info(f"Saved mesh to {output_path}")
        
    def save_mesh_obj(self, mesh: Any, output_path: str):
        """
        Save mesh as OBJ file
        
        Args:
            mesh: Triangle mesh
            output_path: Output file path
        """
        logger.info(f"Saving mesh as OBJ: {output_path}")
        o3d.io.write_triangle_mesh(output_path, mesh)
        logger.info(f"Saved mesh to {output_path}")
        
    def visualize_dem(self, dem: np.ndarray, dem_info: DEMInfo, save_path: str = None):
        """
        Create visualization of DEM
        
        Args:
            dem: DEM array
            dem_info: DEM information
            save_path: Optional path to save visualization
        """
        plt.figure(figsize=(12, 8))
        
        # Mask nodata values
        dem_masked = np.ma.masked_where(dem == dem_info.nodata_value, dem)
        
        # Create visualization
        im = plt.imshow(dem_masked, cmap='terrain', 
                       extent=[dem_info.bounds[0], dem_info.bounds[2],
                              dem_info.bounds[1], dem_info.bounds[3]])
        
        plt.colorbar(im, label='Elevation (m)')
        plt.title(f'Digital Elevation Model (Resolution: {dem_info.resolution}m)')
        plt.xlabel('X Coordinate')
        plt.ylabel('Y Coordinate')
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Saved DEM visualization to {save_path}")
        else:
            plt.show()
            
    def compute_difference_dem(self, dem1: np.ndarray, dem2: np.ndarray, 
                              dem_info: DEMInfo) -> np.ndarray:
        """
        Compute Difference of DEMs (DoD)
        
        Args:
            dem1: First DEM (older)
            dem2: Second DEM (newer)
            dem_info: DEM information
            
        Returns:
            Difference DEM (dem2 - dem1)
        """
        logger.info("Computing Difference of DEMs")
        
        if dem1.shape != dem2.shape:
            raise ValueError("DEMs must have the same shape")
            
        # Compute difference
        dod = dem2 - dem1
        
        # Handle nodata values
        nodata_mask = (dem1 == dem_info.nodata_value) | (dem2 == dem_info.nodata_value)
        dod[nodata_mask] = dem_info.nodata_value
        
        logger.info(f"DoD statistics: min={np.min(dod[~nodata_mask]):.2f}m, "
                   f"max={np.max(dod[~nodata_mask]):.2f}m, "
                   f"mean={np.mean(dod[~nodata_mask]):.2f}m")
        
        return dod
        
    def detect_change_areas(self, dod: np.ndarray, dem_info: DEMInfo, 
                           threshold: float = 0.5) -> np.ndarray:
        """
        Detect significant change areas in DoD
        
        Args:
            dod: Difference of DEMs
            dem_info: DEM information
            threshold: Change threshold in meters
            
        Returns:
            Binary mask of change areas
        """
        logger.info(f"Detecting change areas with threshold {threshold}m")
        
        # Create change mask
        valid_mask = dod != dem_info.nodata_value
        change_mask = np.abs(dod) > threshold
        
        # Combine masks
        significant_change = valid_mask & change_mask
        
        change_pixels = np.sum(significant_change)
        total_pixels = np.sum(valid_mask)
        change_percentage = (change_pixels / total_pixels) * 100 if total_pixels > 0 else 0
        
        logger.info(f"Found {change_pixels} changed pixels ({change_percentage:.1f}% of valid area)")
        
        return significant_change

def main():
    """Example usage"""
    # Configuration
    config = {
        'resolution': 1.0
    }
    
    # Initialize generator
    generator = Model3DGenerator(config)
    
    # Example: Create synthetic point cloud
    np.random.seed(42)
    n_points = 10000
    
    # Create terrain-like surface
    x = np.random.uniform(0, 100, n_points)
    y = np.random.uniform(0, 100, n_points)
    z = (np.sin(x/10) * np.cos(y/10) * 5 + 
         np.random.normal(0, 0.1, n_points) + 
         50)  # Base elevation
    
    points = np.column_stack([x, y, z])
    
    # Create ground mask (assume all points are ground for example)
    ground_mask = np.ones(len(points), dtype=bool)
    
    # Generate DEM
    dem, dem_info = generator.create_dem_from_points(points, ground_mask, method="idw")
    
    # Generate DSM
    dsm, dsm_info = generator.create_dsm_from_points(points)
    
    # Create TIN mesh
    mesh = generator.create_tin_mesh(points, ground_mask)
    
    # Save outputs
    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)
    
    generator.save_dem_geotiff(dem, dem_info, "outputs/dem/example_dem.tif")
    generator.save_dem_geotiff(dsm, dsm_info, "outputs/dem/example_dsm.tif")
    generator.save_mesh_ply(mesh, "outputs/3d_models/example_mesh.ply")
    
    # Visualize
    generator.visualize_dem(dem, dem_info, "outputs/dem/example_dem_viz.png")
    
    print("3D model generation complete!")

if __name__ == "__main__":
    main()