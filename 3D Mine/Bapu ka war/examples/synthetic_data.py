"""
Synthetic Data Generator

This script generates synthetic LiDAR data for testing and demonstration
purposes when real mine survey data is not available.
"""

import numpy as np
import pandas as pd
import laspy
from pathlib import Path
import matplotlib.pyplot as plt
from typing import Tuple, Dict, Any, List

def generate_mine_pit_terrain(center_x: float = 500000, center_y: float = 4500000,
                             radius: float = 500, depth: float = 120,
                             n_points: int = 50000) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
    """
    Generate realistic open-pit mine terrain
    
    Args:
        center_x: Center X coordinate (UTM)
        center_y: Center Y coordinate (UTM)
        radius: Mine pit radius (meters)
        depth: Maximum pit depth (meters)
        n_points: Number of points to generate
        
    Returns:
        Tuple of (points array, attributes dict)
    """
    
    print(f"Generating {n_points:,} points for mine pit terrain...")
    
    np.random.seed(42)  # For reproducible results
    
    # Generate points in and around the pit
    points = []
    
    # 1. Pit interior points (60% of points)
    n_pit = int(n_points * 0.6)
    angles = np.random.uniform(0, 2*np.pi, n_pit)
    radii = np.random.uniform(0, radius, n_pit)
    
    x_pit = center_x + radii * np.cos(angles)
    y_pit = center_y + radii * np.sin(angles)
    
    # Create realistic pit depth profile
    distance_from_center = radii
    
    # Multi-level benching (typical in open-pit mining)
    bench_height = 15  # 15m bench height
    bench_width = 30   # 30m bench width
    
    # Calculate which bench level each point is on
    bench_level = np.floor(distance_from_center / bench_width)
    base_elevation = 1000  # Base elevation
    
    # Elevation decreases with bench level
    z_pit = base_elevation - (bench_level * bench_height)
    
    # Add some realistic variation
    z_pit += np.random.normal(0, 2, n_pit)  # Small random variation
    
    # Add slope within each bench
    bench_position = (distance_from_center % bench_width) / bench_width
    slope_variation = -5 * bench_position  # Slight downward slope within bench
    z_pit += slope_variation
    
    pit_points = np.column_stack([x_pit, y_pit, z_pit])
    
    # 2. Pit rim and overburden (30% of points)
    n_rim = int(n_points * 0.3)
    angles = np.random.uniform(0, 2*np.pi, n_rim)
    radii = np.random.uniform(radius, radius * 1.8, n_rim)
    
    x_rim = center_x + radii * np.cos(angles)
    y_rim = center_y + radii * np.sin(angles)
    
    # Rim area - generally higher elevation
    z_rim = base_elevation + np.random.uniform(0, 30, n_rim)
    z_rim += np.random.normal(0, 5, n_rim)
    
    rim_points = np.column_stack([x_rim, y_rim, z_rim])
    
    # 3. Distant terrain (10% of points)
    n_distant = n_points - n_pit - n_rim
    x_distant = np.random.uniform(center_x - radius * 3, center_x + radius * 3, n_distant)
    y_distant = np.random.uniform(center_y - radius * 3, center_y + radius * 3, n_distant)
    
    # Distant terrain - natural topography
    z_distant = base_elevation + 20 * np.sin((x_distant - center_x) / 200) * np.cos((y_distant - center_y) / 200)
    z_distant += np.random.normal(0, 8, n_distant)
    
    distant_points = np.column_stack([x_distant, y_distant, z_distant])
    
    # Combine all points
    all_points = np.vstack([pit_points, rim_points, distant_points])
    
    # Generate realistic attributes
    attributes = generate_realistic_attributes(all_points, center_x, center_y, radius)
    
    print(f"Generated terrain:")
    print(f"  - Pit interior: {n_pit:,} points")
    print(f"  - Pit rim: {n_rim:,} points")
    print(f"  - Distant terrain: {n_distant:,} points")
    print(f"  - Elevation range: {np.min(all_points[:, 2]):.1f} - {np.max(all_points[:, 2]):.1f} m")
    
    return all_points, attributes

def generate_realistic_attributes(points: np.ndarray, center_x: float, 
                                center_y: float, radius: float) -> Dict[str, np.ndarray]:
    """
    Generate realistic LiDAR attributes
    
    Args:
        points: Point cloud array (N, 3)
        center_x: Pit center X coordinate
        center_y: Pit center Y coordinate
        radius: Pit radius
        
    Returns:
        Dictionary of attributes
    """
    
    n_points = len(points)
    
    # Distance from pit center
    distance = np.sqrt((points[:, 0] - center_x)**2 + (points[:, 1] - center_y)**2)
    
    # Intensity - varies by surface type
    intensity = np.zeros(n_points, dtype=np.uint16)
    
    # Rock surfaces (in pit) - high intensity
    pit_mask = distance <= radius
    intensity[pit_mask] = np.random.randint(30000, 65535, np.sum(pit_mask))
    
    # Soil/overburden - medium intensity
    rim_mask = (distance > radius) & (distance <= radius * 1.5)
    intensity[rim_mask] = np.random.randint(15000, 40000, np.sum(rim_mask))
    
    # Vegetation/distant - low to medium intensity
    distant_mask = distance > radius * 1.5
    intensity[distant_mask] = np.random.randint(5000, 25000, np.sum(distant_mask))
    
    # Return numbers - simulate multiple returns
    return_number = np.random.randint(1, 6, n_points)
    number_of_returns = np.maximum(return_number, np.random.randint(1, 6, n_points))
    
    # Classification
    classification = np.zeros(n_points, dtype=np.uint8)
    
    # Ground classification (class 2)
    # Most pit points are ground
    classification[pit_mask] = 2
    
    # Mix of ground and low vegetation on rim
    rim_ground_mask = rim_mask & (np.random.random(n_points) < 0.7)
    rim_veg_mask = rim_mask & ~rim_ground_mask
    classification[rim_ground_mask] = 2  # Ground
    classification[rim_veg_mask] = 3     # Low vegetation
    
    # Distant areas - mix of ground and vegetation
    distant_ground_mask = distant_mask & (np.random.random(n_points) < 0.4)
    distant_low_veg_mask = distant_mask & ~distant_ground_mask & (np.random.random(n_points) < 0.6)
    distant_high_veg_mask = distant_mask & ~distant_ground_mask & ~distant_low_veg_mask
    
    classification[distant_ground_mask] = 2  # Ground
    classification[distant_low_veg_mask] = 3  # Low vegetation
    classification[distant_high_veg_mask] = 5  # High vegetation
    
    # Scan angle rank
    scan_angle_rank = np.random.randint(-30, 31, n_points)
    
    # GPS time (simulate survey time)
    base_time = 1000000000  # Arbitrary GPS time
    gps_time = base_time + np.random.uniform(0, 3600, n_points)  # 1 hour survey
    
    # RGB (for some points)
    red = np.random.randint(0, 65535, n_points, dtype=np.uint16)
    green = np.random.randint(0, 65535, n_points, dtype=np.uint16)
    blue = np.random.randint(0, 65535, n_points, dtype=np.uint16)
    
    # Make rock surfaces more gray/brown
    rock_mask = distance <= radius
    red[rock_mask] = np.random.randint(20000, 40000, np.sum(rock_mask))
    green[rock_mask] = np.random.randint(18000, 35000, np.sum(rock_mask))
    blue[rock_mask] = np.random.randint(15000, 30000, np.sum(rock_mask))
    
    # Make vegetation more green
    veg_mask = (classification == 3) | (classification == 5)
    red[veg_mask] = np.random.randint(10000, 30000, np.sum(veg_mask))
    green[veg_mask] = np.random.randint(35000, 65535, np.sum(veg_mask))
    blue[veg_mask] = np.random.randint(10000, 25000, np.sum(veg_mask))
    
    attributes = {
        'intensity': intensity,
        'return_number': return_number.astype(np.uint8),
        'number_of_returns': number_of_returns.astype(np.uint8),
        'classification': classification,
        'scan_angle_rank': scan_angle_rank.astype(np.int8),
        'gps_time': gps_time,
        'red': red,
        'green': green,
        'blue': blue
    }
    
    return attributes

def save_synthetic_las_file(points: np.ndarray, attributes: Dict[str, np.ndarray], 
                           output_path: str):
    """
    Save synthetic data as LAS file
    
    Args:
        points: Point cloud array (N, 3)
        attributes: Attributes dictionary
        output_path: Output file path
    """
    
    print(f"Saving synthetic LAS file: {output_path}")
    
    # Create LAS header with default version
    header = laspy.LasHeader(point_format=3)
    header.add_extra_dim(laspy.ExtraBytesParams(name="synthetic_flag", type=np.uint8))
    
    # Set coordinate system (UTM Zone 12N - modify as needed)
    header.scales = np.array([0.01, 0.01, 0.01])
    header.offsets = np.array([500000, 4500000, 1000])
    
    # Create LAS file
    las = laspy.LasData(header)
    
    # Set coordinates
    las.x = points[:, 0]
    las.y = points[:, 1]
    las.z = points[:, 2]
    
    # Set attributes
    las.intensity = attributes['intensity']
    las.return_number = attributes['return_number']
    las.number_of_returns = attributes['number_of_returns']
    las.classification = attributes['classification']
    las.scan_angle_rank = attributes['scan_angle_rank']
    las.gps_time = attributes['gps_time']
    las.red = attributes['red']
    las.green = attributes['green']
    las.blue = attributes['blue']
    
    # Add synthetic flag
    las.synthetic_flag = np.ones(len(points), dtype=np.uint8)
    
    # Write file
    las.write(output_path)
    
    print(f"Saved {len(points):,} points to {output_path}")

def create_temporal_datasets(base_points: np.ndarray, base_attributes: Dict[str, np.ndarray],
                           n_epochs: int = 3, output_dir: str = "data/raw_las") -> List[str]:
    """
    Create temporal datasets showing mine progression
    
    Args:
        base_points: Base point cloud
        base_attributes: Base attributes
        n_epochs: Number of time epochs
        output_dir: Output directory
        
    Returns:
        List of created file paths
    """
    
    print(f"Creating {n_epochs} temporal datasets...")
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    file_paths = []
    
    # Parameters
    center_x, center_y = 500000, 4500000
    radius = 500
    
    for epoch in range(n_epochs):
        print(f"  Creating epoch {epoch + 1}/{n_epochs}")
        
        # Make a copy of the base data
        points = base_points.copy()
        attributes = {k: v.copy() for k, v in base_attributes.items()}
        
        # Simulate mining progression
        if epoch > 0:
            # Deepen the pit progressively
            distance_from_center = np.sqrt((points[:, 0] - center_x)**2 + (points[:, 1] - center_y)**2)
            pit_mask = distance_from_center <= radius
            
            # Add random mining-related changes
            np.random.seed(42 + epoch)  # Different seed for each epoch
            
            # Simulate excavation (lower elevations in pit)
            excavation_factor = epoch * 0.3
            points[pit_mask, 2] -= np.random.uniform(0, 5 * excavation_factor, np.sum(pit_mask))
            
            # Simulate some rockfall events (add noise to steep areas)
            slope_mask = pit_mask & (np.random.random(len(points)) < 0.02)  # 2% of pit points
            points[slope_mask, 2] -= np.random.uniform(2, 8, np.sum(slope_mask))
            
            # Update GPS time
            attributes['gps_time'] += epoch * 86400 * 30  # 30 days between epochs
        
        # Save file
        filename = f"synthetic_mine_epoch_{epoch + 1:02d}.las"
        file_path = output_dir / filename
        save_synthetic_las_file(points, attributes, str(file_path))
        file_paths.append(str(file_path))
    
    return file_paths

def visualize_synthetic_data(points: np.ndarray, attributes: Dict[str, np.ndarray],
                           save_path: str = None):
    """
    Create visualization of synthetic data
    
    Args:
        points: Point cloud array
        attributes: Attributes dictionary
        save_path: Optional path to save visualization
    """
    
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    fig.suptitle('Synthetic Mine LiDAR Data', fontsize=16)
    
    # 3D scatter plot (top view)
    scatter = axes[0,0].scatter(points[:, 0], points[:, 1], c=points[:, 2], 
                               cmap='terrain', s=0.1, alpha=0.6)
    axes[0,0].set_title('Elevation (Top View)')
    axes[0,0].set_xlabel('X (UTM)')
    axes[0,0].set_ylabel('Y (UTM)')
    axes[0,0].axis('equal')
    plt.colorbar(scatter, ax=axes[0,0], label='Elevation (m)')
    
    # Intensity
    scatter2 = axes[0,1].scatter(points[:, 0], points[:, 1], c=attributes['intensity'],
                                cmap='hot', s=0.1, alpha=0.6)
    axes[0,1].set_title('Intensity')
    axes[0,1].set_xlabel('X (UTM)')
    axes[0,1].set_ylabel('Y (UTM)')
    axes[0,1].axis('equal')
    plt.colorbar(scatter2, ax=axes[0,1], label='Intensity')
    
    # Classification
    scatter3 = axes[0,2].scatter(points[:, 0], points[:, 1], c=attributes['classification'],
                                cmap='Set1', s=0.1, alpha=0.6)
    axes[0,2].set_title('Classification')
    axes[0,2].set_xlabel('X (UTM)')
    axes[0,2].set_ylabel('Y (UTM)')
    axes[0,2].axis('equal')
    plt.colorbar(scatter3, ax=axes[0,2], label='Class')
    
    # Elevation histogram
    axes[1,0].hist(points[:, 2], bins=50, alpha=0.7, color='brown')
    axes[1,0].set_title('Elevation Distribution')
    axes[1,0].set_xlabel('Elevation (m)')
    axes[1,0].set_ylabel('Frequency')
    
    # Intensity histogram
    axes[1,1].hist(attributes['intensity'], bins=50, alpha=0.7, color='orange')
    axes[1,1].set_title('Intensity Distribution')
    axes[1,1].set_xlabel('Intensity')
    axes[1,1].set_ylabel('Frequency')
    
    # Classification distribution
    class_counts = np.bincount(attributes['classification'])
    class_labels = ['Unclassified', 'Unclassified', 'Ground', 'Low Veg', 'Medium Veg', 'High Veg', 'Building', 'Water']
    valid_classes = np.where(class_counts > 0)[0]
    
    axes[1,2].bar([class_labels[i] if i < len(class_labels) else f'Class {i}' for i in valid_classes],
                  class_counts[valid_classes], color=['gray', 'brown', 'lightgreen', 'green', 'darkgreen', 'blue', 'red'][:len(valid_classes)])
    axes[1,2].set_title('Point Classification')
    axes[1,2].set_xlabel('Class')
    axes[1,2].set_ylabel('Count')
    axes[1,2].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Visualization saved to {save_path}")
    else:
        plt.show()

def main():
    """Generate comprehensive synthetic dataset"""
    
    print("🏗️ Synthetic Mine Data Generator")
    print("=" * 40)
    
    # Create output directory
    output_dir = Path("data/raw_las")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate different mine scenarios
    scenarios = [
        {
            'name': 'JIET_OpenPit_Mine_Synthetic',
            'center_x': 500000,
            'center_y': 4500000,
            'radius': 400,
            'depth': 100,
            'n_points': 25000,
            'description': 'Medium-sized open pit mine'
        },
        {
            'name': 'RealWorld_OpenPit_Mine_Synthetic',
            'center_x': 501000,
            'center_y': 4501000,
            'radius': 600,
            'depth': 150,
            'n_points': 40000,
            'description': 'Large-scale open pit mine'
        },
        {
            'name': 'JIET_University_Campus_Synthetic',
            'center_x': 502000,
            'center_y': 4502000,
            'radius': 200,
            'depth': 30,
            'n_points': 15000,
            'description': 'Small educational site'
        }
    ]
    
    all_files = []
    
    for scenario in scenarios:
        print(f"\n📊 Generating {scenario['name']}")
        print(f"   {scenario['description']}")
        
        # Generate terrain
        points, attributes = generate_mine_pit_terrain(
            center_x=scenario['center_x'],
            center_y=scenario['center_y'],
            radius=scenario['radius'],
            depth=scenario['depth'],
            n_points=scenario['n_points']
        )
        
        # Save single epoch
        single_file = output_dir / f"{scenario['name']}.las"
        save_synthetic_las_file(points, attributes, str(single_file))
        all_files.append(str(single_file))
        
        # Create temporal series for the main mine
        if 'OpenPit_Mine' in scenario['name']:
            temporal_files = create_temporal_datasets(
                points, attributes, n_epochs=3, 
                output_dir=str(output_dir)
            )
            all_files.extend(temporal_files)
        
        # Create visualization
        viz_path = output_dir.parent.parent / "outputs" / "dem" / f"{scenario['name']}_visualization.png"
        viz_path.parent.mkdir(parents=True, exist_ok=True)
        visualize_synthetic_data(points, attributes, str(viz_path))
    
    # Generate summary report
    print(f"\n📄 Summary Report")
    print("-" * 20)
    
    total_points = 0
    for file_path in all_files:
        if Path(file_path).exists():
            # Quick point count (simplified)
            las = laspy.read(file_path)
            n_points = len(las.points)
            total_points += n_points
            print(f"  ✅ {Path(file_path).name}: {n_points:,} points")
    
    print(f"\n🎯 Generation Complete!")
    print(f"   Total files: {len(all_files)}")
    print(f"   Total points: {total_points:,}")
    print(f"   Output directory: {output_dir}")
    
    print(f"\n📋 Next Steps:")
    print(f"   1. Run workflow: python examples/example_workflow.py")
    print(f"   2. Start dashboard: streamlit run src/dashboard.py")
    print(f"   3. Process files: python -m src.pipeline --mode process")

if __name__ == "__main__":
    main()