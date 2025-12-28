"""
Complete Workflow Example

This script demonstrates the full end-to-end workflow from LAS file
to risk prediction and visualization.
"""

import sys
import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / 'src'))

from data_ingestion import LiDARProcessor
from model_3d_generation import Model3DGenerator
from feature_engineering import FeatureExtractor
from ml_training import RockfallPredictor

def create_synthetic_las_data():
    """Create synthetic LAS data for demonstration"""
    
    print("Creating synthetic LAS data...")
    
    # Generate synthetic mine pit data
    np.random.seed(42)
    
    # Create a mine pit shape (1km x 1km, 10k points)
    n_points = 10000
    
    # Center coordinates
    center_x, center_y = 500000, 4500000  # UTM coordinates
    
    # Generate points in a circular pattern (mine pit)
    angles = np.random.uniform(0, 2*np.pi, n_points)
    radii = np.random.uniform(0, 400, n_points)  # 400m radius
    
    x = center_x + radii * np.cos(angles) + np.random.normal(0, 10, n_points)
    y = center_y + radii * np.sin(angles) + np.random.normal(0, 10, n_points)
    
    # Create elevation profile (pit gets deeper towards center)
    distance_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    base_elevation = 1000  # 1000m base elevation
    
    # Pit depth profile
    max_depth = 100
    z = base_elevation - (max_depth * np.exp(-distance_from_center/200)) + np.random.normal(0, 2, n_points)
    
    # Add some bench structures (terraced mining)
    bench_height = 15  # 15m bench height
    z = np.floor(z / bench_height) * bench_height + np.random.normal(0, 1, n_points)
    
    # Create attributes
    intensity = np.random.randint(0, 65535, n_points)  # 16-bit intensity
    return_number = np.random.randint(1, 5, n_points)
    num_returns = np.maximum(return_number, np.random.randint(1, 5, n_points))
    classification = np.random.choice([1, 2, 5], n_points, p=[0.6, 0.3, 0.1])  # Ground, low veg, high veg
    
    points = np.column_stack([x, y, z])
    attributes = {
        'intensity': intensity,
        'return_number': return_number,
        'number_of_returns': num_returns,
        'classification': classification
    }
    
    return points, attributes

def demonstrate_workflow():
    """Demonstrate complete workflow"""
    
    print("🏔️ Rockfall Risk Prediction System - Complete Workflow Demo")
    print("=" * 60)
    
    # Configuration
    config = {
        'resolution': 2.0,  # 2m resolution for faster processing
        'outlier_removal': True,
        'noise_threshold': 2.0,
        'ground_filter': 'smrf',
        'classify_points': True,
        'vegetation_threshold': 3.0,
        'compute_slope': True,
        'compute_aspect': True,
        'compute_curvature': True,
        'compute_roughness': True,
        'compute_tpi': True,
        'point_density_features': True,
        'intensity_features': True,
        'model_type': 'xgboost',
        'balance_classes': True,
        'test_size': 0.2,
        'cv_folds': 3  # Reduced for demo
    }
    
    # Create output directories
    output_dir = Path('outputs')
    for subdir in ['dem', '3d_models', 'features', 'predictions', 'models']:
        (output_dir / subdir).mkdir(parents=True, exist_ok=True)
    
    # Step 1: Create/Load LiDAR Data
    print("\n📊 Step 1: Processing LiDAR Data")
    print("-" * 30)
    
    points, attributes = create_synthetic_las_data()
    print(f"Generated {len(points):,} synthetic LiDAR points")
    
    # Initialize processor
    processor = LiDARProcessor(config)
    
    # Simulate point cloud processing
    print("Processing point cloud...")
    
    # Remove outliers
    if config.get('outlier_removal', True):
        points_clean, outlier_mask = processor.remove_outliers(points)
        # Update attributes
        for key, values in attributes.items():
            attributes[key] = values[outlier_mask]
    else:
        points_clean = points
    
    # Classify ground points
    ground_mask = processor.classify_ground_points(points_clean, config.get('ground_filter', 'smrf'))
    
    # Classify vegetation
    vegetation_mask = processor.classify_vegetation(points_clean, ground_mask)
    
    # Compute statistics
    stats = processor.compute_statistics(points_clean, ground_mask, vegetation_mask)
    
    print(f"Ground points: {stats.ground_points:,} ({stats.ground_points/stats.total_points*100:.1f}%)")
    print(f"Vegetation points: {stats.vegetation_points:,} ({stats.vegetation_points/stats.total_points*100:.1f}%)")
    print(f"Point density: {stats.point_density:.2f} points/m²")
    
    # Step 2: Generate 3D Models
    print("\n🏔️ Step 2: Generating 3D Models")
    print("-" * 30)
    
    generator = Model3DGenerator(config)
    
    # Create DEM
    print("Creating DEM...")
    dem, dem_info = generator.create_dem_from_points(points_clean, ground_mask, method="idw")
    print(f"Generated DEM with shape {dem.shape}")
    
    # Create DSM
    print("Creating DSM...")
    dsm, dsm_info = generator.create_dsm_from_points(points_clean)
    print(f"Generated DSM with shape {dsm.shape}")
    
    # Create TIN mesh
    print("Creating TIN mesh...")
    mesh = generator.create_tin_mesh(points_clean, ground_mask)
    print(f"Generated mesh with {len(mesh.vertices)} vertices and {len(mesh.triangles)} triangles")
    
    # Save 3D models
    generator.save_dem_geotiff(dem, dem_info, "outputs/dem/demo_dem.tif")
    generator.save_dem_geotiff(dsm, dsm_info, "outputs/dem/demo_dsm.tif")
    generator.save_mesh_ply(mesh, "outputs/3d_models/demo_mesh.ply")
    
    print("3D models saved successfully!")
    
    # Step 3: Extract Features
    print("\n🔍 Step 3: Extracting Geotechnical Features")
    print("-" * 40)
    
    extractor = FeatureExtractor(config)
    
    # Extract topographic features
    print("Extracting topographic features...")
    topo_features = extractor.extract_topographic_features(dem, dem_info)
    print(f"Extracted {len(topo_features)} topographic features")
    
    # Extract point cloud features
    print("Extracting point cloud features...")
    pc_features = extractor.extract_point_cloud_features(points_clean, attributes, ground_mask)
    print(f"Extracted {len(pc_features)} point cloud features")
    
    # Combine all features
    all_features = {**topo_features, **pc_features}
    feature_set = extractor.create_feature_dataframe(all_features)
    
    print(f"Total features: {len(feature_set.feature_names)}")
    print(f"Valid samples: {len(feature_set.features):,}")
    
    # Save features
    extractor.save_features(feature_set, "outputs/features/demo_features")
    
    # Display feature summary
    print("\nFeature Summary:")
    for i, name in enumerate(feature_set.feature_names[:10]):  # Show first 10
        values = feature_set.features[name]
        print(f"  {name}: mean={values.mean():.3f}, std={values.std():.3f}")
    if len(feature_set.feature_names) > 10:
        print(f"  ... and {len(feature_set.feature_names) - 10} more features")
    
    # Step 4: Train Machine Learning Model
    print("\n🤖 Step 4: Training Machine Learning Model")
    print("-" * 40)
    
    predictor = RockfallPredictor(config)
    
    # Prepare training data (creates synthetic labels)
    print("Preparing training data...")
    X, y = predictor.prepare_training_data(feature_set.features, coordinates=feature_set.coordinates)
    
    print(f"Training samples: {len(X):,}")
    print(f"Feature dimensions: {X.shape[1]}")
    print(f"Class distribution: {np.bincount(y)}")
    
    # Train model
    print("Training model...")
    results = predictor.train_model(X, y)
    
    print(f"Model trained successfully!")
    print(f"Test Accuracy: {results.metrics['accuracy']:.3f}")
    if 'roc_auc' in results.metrics:
        print(f"ROC-AUC: {results.metrics['roc_auc']:.3f}")
    print(f"CV Score: {np.mean(results.cv_scores):.3f} ± {np.std(results.cv_scores):.3f}")
    
    # Spatial cross-validation
    print("Performing spatial cross-validation...")
    spatial_cv_scores = predictor.spatial_cross_validation(X, y, feature_set.coordinates, n_splits=3)
    print(f"Spatial CV Score: {np.mean(spatial_cv_scores):.3f} ± {np.std(spatial_cv_scores):.3f}")
    
    # Save model
    predictor.save_model(results, "outputs/models/demo_model")
    
    # Step 5: Make Predictions and Generate Risk Maps
    print("\n🎯 Step 5: Generating Risk Predictions")
    print("-" * 35)
    
    # Make predictions
    predictions, probabilities = predictor.predict(results, X)
    
    # Reshape probabilities to match DEM grid
    prob_grid = np.full(dem.shape, np.nan)
    
    # Map probabilities back to grid
    for i, (coord, prob) in enumerate(zip(feature_set.coordinates, probabilities)):
        # Convert coordinate to grid index
        col = int((coord[0] - dem_info.bounds[0]) / dem_info.resolution)
        row = int((dem_info.bounds[3] - coord[1]) / dem_info.resolution)
        
        if 0 <= row < dem.shape[0] and 0 <= col < dem.shape[1]:
            prob_grid[row, col] = prob
    
    # Save risk map
    risk_info = dem_info  # Use same georeferencing
    generator.save_dem_geotiff(prob_grid, risk_info, "outputs/predictions/demo_risk_map.tif")
    
    # Calculate risk statistics
    valid_probs = probabilities[~np.isnan(probabilities)]
    high_risk_ratio = np.sum(valid_probs > 0.7) / len(valid_probs) * 100
    
    print(f"Risk map generated!")
    print(f"Mean risk probability: {np.mean(valid_probs):.3f}")
    print(f"High risk areas (>0.7): {high_risk_ratio:.1f}%")
    
    # Step 6: Visualization
    print("\n📊 Step 6: Creating Visualizations")
    print("-" * 30)
    
    # Create summary plots
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    fig.suptitle('Rockfall Risk Prediction Results', fontsize=16)
    
    # DEM
    im1 = axes[0,0].imshow(dem, cmap='terrain')
    axes[0,0].set_title('Digital Elevation Model')
    axes[0,0].set_xlabel('X (pixels)')
    axes[0,0].set_ylabel('Y (pixels)')
    plt.colorbar(im1, ax=axes[0,0], label='Elevation (m)')
    
    # Slope
    if 'slope' in topo_features:
        im2 = axes[0,1].imshow(topo_features['slope'], cmap='YlOrRd')
        axes[0,1].set_title('Slope')
        plt.colorbar(im2, ax=axes[0,1], label='Slope (degrees)')
    
    # Risk map
    im3 = axes[0,2].imshow(prob_grid, cmap='RdYlBu_r', vmin=0, vmax=1)
    axes[0,2].set_title('Risk Probability')
    plt.colorbar(im3, ax=axes[0,2], label='Probability')
    
    # Feature importance
    top_features = dict(list(results.feature_importance.items())[:10])
    axes[1,0].barh(range(len(top_features)), list(top_features.values()))
    axes[1,0].set_yticks(range(len(top_features)))
    axes[1,0].set_yticklabels(list(top_features.keys()))
    axes[1,0].set_title('Top 10 Feature Importance')
    axes[1,0].set_xlabel('Importance')
    
    # Risk distribution
    axes[1,1].hist(valid_probs, bins=30, alpha=0.7, color='orange')
    axes[1,1].axvline(0.7, color='red', linestyle='--', label='High Risk Threshold')
    axes[1,1].set_title('Risk Probability Distribution')
    axes[1,1].set_xlabel('Risk Probability')
    axes[1,1].set_ylabel('Frequency')
    axes[1,1].legend()
    
    # CV scores
    axes[1,2].boxplot([results.cv_scores, spatial_cv_scores], labels=['Standard CV', 'Spatial CV'])
    axes[1,2].set_title('Cross-Validation Scores')
    axes[1,2].set_ylabel('Score')
    
    plt.tight_layout()
    plt.savefig('outputs/predictions/demo_results_summary.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print("Visualizations saved!")
    
    # Step 7: Generate Report
    print("\n📄 Step 7: Generating Summary Report")
    print("-" * 32)
    
    report = f"""
# Rockfall Risk Prediction Report

## Data Summary
- **Total Points**: {stats.total_points:,}
- **Ground Points**: {stats.ground_points:,} ({stats.ground_points/stats.total_points*100:.1f}%)
- **Point Density**: {stats.point_density:.2f} points/m²
- **Area Covered**: {(dem_info.bounds[2]-dem_info.bounds[0]) * (dem_info.bounds[3]-dem_info.bounds[1])/1e6:.2f} km²

## Model Performance
- **Algorithm**: {config['model_type'].upper()}
- **Test Accuracy**: {results.metrics['accuracy']:.3f}
- **ROC-AUC**: {results.metrics.get('roc_auc', 'N/A')}
- **CV Score**: {np.mean(results.cv_scores):.3f} ± {np.std(results.cv_scores):.3f}
- **Spatial CV Score**: {np.mean(spatial_cv_scores):.3f} ± {np.std(spatial_cv_scores):.3f}

## Risk Assessment
- **Mean Risk Probability**: {np.mean(valid_probs):.3f}
- **High Risk Areas (>0.7)**: {high_risk_ratio:.1f}%
- **Critical Areas for Monitoring**: {np.sum(valid_probs > 0.8)}/{len(valid_probs)} locations

## Top Risk Factors
{chr(10).join([f"- {name}: {importance:.3f}" for name, importance in list(results.feature_importance.items())[:5]])}

## Recommendations
1. **Immediate**: Monitor {np.sum(valid_probs > 0.8)} locations with >0.8 risk probability
2. **Short-term**: Implement enhanced monitoring in high-risk zones
3. **Long-term**: Consider slope stabilization measures in critical areas
4. **Continuous**: Update model with new data as it becomes available

Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    with open('outputs/predictions/demo_report.md', 'w') as f:
        f.write(report)
    
    print("Summary report generated!")
    
    # Final Summary
    print("\n✅ Workflow Complete!")
    print("=" * 60)
    print("Generated files:")
    print("  📁 outputs/dem/demo_dem.tif - Digital Elevation Model")
    print("  📁 outputs/dem/demo_dsm.tif - Digital Surface Model")
    print("  📁 outputs/3d_models/demo_mesh.ply - 3D Mesh")
    print("  📁 outputs/features/demo_features_* - Extracted features")
    print("  📁 outputs/models/demo_model_* - Trained ML model")
    print("  📁 outputs/predictions/demo_risk_map.tif - Risk prediction map")
    print("  📁 outputs/predictions/demo_results_summary.png - Summary plots")
    print("  📁 outputs/predictions/demo_report.md - Summary report")
    print("\n🎯 Next Steps:")
    print("  1. Review the risk map and identify critical areas")
    print("  2. Run the dashboard: streamlit run src/dashboard.py")
    print("  3. Set up continuous monitoring: python -m src.pipeline --mode monitor")
    print("  4. Replace synthetic data with your actual LAS files")

if __name__ == "__main__":
    try:
        demonstrate_workflow()
    except Exception as e:
        print(f"\n❌ Error during workflow: {str(e)}")
        import traceback
        traceback.print_exc()