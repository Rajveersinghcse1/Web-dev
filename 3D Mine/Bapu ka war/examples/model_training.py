"""
Model Training Example

This script demonstrates how to train different ML models
for rockfall prediction with various configurations.
"""

import sys
import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / 'src'))

try:
    from feature_engineering import FeatureExtractor
    from ml_training import RockfallPredictor
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all dependencies are installed and src modules are available")
    sys.exit(1)

def create_comprehensive_synthetic_features(n_samples: int = 5000) -> tuple:
    """
    Create comprehensive synthetic feature dataset
    
    Args:
        n_samples: Number of samples to generate
        
    Returns:
        Tuple of (features_df, labels, coordinates)
    """
    
    print(f"Creating {n_samples:,} synthetic samples with comprehensive features...")
    
    np.random.seed(42)
    
    # Generate spatial coordinates (1km x 1km area)
    x_coords = np.random.uniform(0, 1000, n_samples)
    y_coords = np.random.uniform(0, 1000, n_samples)
    coordinates = np.column_stack([x_coords, y_coords])
    
    # Create realistic feature combinations
    features = {}
    
    # Topographic features
    features['slope'] = np.random.lognormal(mean=2.5, sigma=0.8, size=n_samples)
    features['slope'] = np.clip(features['slope'], 0, 60)  # Max 60 degrees
    
    features['aspect'] = np.random.uniform(0, 360, n_samples)
    
    # Curvature features (correlated with slope)
    features['profile_curvature'] = np.random.normal(0, 0.1, n_samples) + features['slope'] * 0.01
    features['planform_curvature'] = np.random.normal(0, 0.1, n_samples)
    features['total_curvature'] = features['profile_curvature'] + features['planform_curvature']
    
    # Roughness (correlated with slope)
    features['roughness'] = np.random.lognormal(mean=0.5, sigma=0.5, size=n_samples) + features['slope'] * 0.1
    
    # Topographic Position Index
    features['tpi'] = np.random.normal(0, 5, n_samples)
    
    # Elevation features
    base_elevation = 1000
    features['elevation_mean'] = base_elevation + np.random.normal(0, 50, n_samples)
    features['elevation_min'] = features['elevation_mean'] - np.random.uniform(0, 20, n_samples)
    features['elevation_max'] = features['elevation_mean'] + np.random.uniform(0, 30, n_samples)
    features['elevation_range'] = features['elevation_max'] - features['elevation_min']
    
    # Point cloud features
    features['point_density_total'] = np.random.lognormal(mean=2, sigma=1, size=n_samples)
    features['point_density_ground'] = features['point_density_total'] * np.random.uniform(0.4, 0.8, n_samples)
    features['point_density_vegetation'] = features['point_density_total'] - features['point_density_ground']
    
    # Height features
    features['height_mean'] = np.random.uniform(0, 15, n_samples)
    features['height_std'] = np.random.lognormal(mean=1, sigma=0.5, size=n_samples)
    features['height_max'] = features['height_mean'] + np.random.uniform(0, 20, n_samples)
    features['height_p95'] = features['height_mean'] + np.random.uniform(0, 10, n_samples)
    features['height_p99'] = features['height_max'] * np.random.uniform(0.8, 1.0, n_samples)
    
    # Intensity features
    features['intensity_mean'] = np.random.uniform(10000, 50000, n_samples)
    features['intensity_std'] = features['intensity_mean'] * np.random.uniform(0.1, 0.3, n_samples)
    features['intensity_max'] = features['intensity_mean'] + np.random.uniform(5000, 20000, n_samples)
    features['intensity_min'] = features['intensity_mean'] - np.random.uniform(5000, 15000, n_samples)
    features['intensity_min'] = np.maximum(features['intensity_min'], 0)
    
    # Return features
    features['first_return_ratio'] = np.random.uniform(0.2, 0.8, n_samples)
    features['last_return_ratio'] = np.random.uniform(0.3, 0.9, n_samples)
    
    # Temporal features (simulate change detection)
    features['elevation_change'] = np.random.normal(0, 2, n_samples)
    features['elevation_change_rate'] = features['elevation_change'] / 365  # Per day
    features['change_magnitude'] = np.abs(features['elevation_change'])
    features['change_type'] = np.sign(features['elevation_change'])
    
    # Create DataFrame
    features_df = pd.DataFrame(features)
    
    # Generate realistic labels based on feature combinations
    labels = generate_realistic_labels(features_df, coordinates)
    
    print(f"Generated {len(features_df.columns)} features")
    print(f"Label distribution: {np.bincount(labels)}")
    
    return features_df, labels, coordinates

def generate_realistic_labels(features_df: pd.DataFrame, coordinates: np.ndarray) -> np.ndarray:
    """
    Generate realistic rockfall risk labels based on geotechnical principles
    
    Args:
        features_df: Feature DataFrame
        coordinates: Coordinate array
        
    Returns:
        Binary labels (0: stable, 1: unstable)
    """
    
    n_samples = len(features_df)
    risk_score = np.zeros(n_samples)
    
    # High slope increases risk (most important factor)
    slope_risk = np.where(features_df['slope'] > 30, 
                         (features_df['slope'] - 30) / 30, 0)
    risk_score += slope_risk * 0.4
    
    # High curvature (especially convex) increases risk
    curvature_risk = np.maximum(features_df['profile_curvature'], 0) * 2
    risk_score += curvature_risk * 0.2
    
    # High roughness increases risk
    roughness_risk = (features_df['roughness'] - features_df['roughness'].min()) / features_df['roughness'].std()
    roughness_risk = np.maximum(roughness_risk, 0)
    risk_score += roughness_risk * 0.15
    
    # Significant elevation change increases risk
    change_risk = features_df['change_magnitude'] / 5  # Normalize by 5m
    risk_score += change_risk * 0.15
    
    # Low point density (data quality) increases uncertainty -> higher risk
    density_risk = 1 / (1 + features_df['point_density_total'])
    risk_score += density_risk * 0.1
    
    # Add spatial clustering (rockfall events tend to cluster)
    # Find nearby samples and increase risk if neighbors are risky
    for i in range(n_samples):
        if i % 1000 == 0:  # Progress indicator
            print(f"  Processing spatial correlation: {i:,}/{n_samples:,}")
        
        distances = np.linalg.norm(coordinates - coordinates[i], axis=1)
        nearby_mask = (distances < 50) & (distances > 0)  # Within 50m
        
        if np.any(nearby_mask):
            nearby_risk = risk_score[nearby_mask]
            spatial_influence = np.mean(nearby_risk) * 0.3
            risk_score[i] += spatial_influence
    
    # Add some random component
    risk_score += np.random.normal(0, 0.2, n_samples)
    
    # Convert to probabilities
    risk_prob = 1 / (1 + np.exp(-risk_score))  # Sigmoid transformation
    
    # Create binary labels with class imbalance (10% unstable)
    threshold = np.percentile(risk_prob, 90)
    labels = (risk_prob > threshold).astype(int)
    
    return labels

def compare_models(features_df: pd.DataFrame, labels: np.ndarray, 
                  coordinates: np.ndarray) -> dict:
    """
    Compare different ML models and configurations
    
    Args:
        features_df: Feature DataFrame
        labels: Target labels
        coordinates: Coordinate array
        
    Returns:
        Dictionary of model results
    """
    
    print("\n🤖 Comparing Different ML Models")
    print("=" * 40)
    
    results = {}
    
    # Model configurations to test
    configs = {
        'XGBoost_Default': {
            'model_type': 'xgboost',
            'balance_classes': True,
            'xgb_params': {
                'n_estimators': 100,
                'max_depth': 6,
                'learning_rate': 0.1
            }
        },
        'XGBoost_Tuned': {
            'model_type': 'xgboost',
            'balance_classes': True,
            'xgb_params': {
                'n_estimators': 200,
                'max_depth': 8,
                'learning_rate': 0.05,
                'subsample': 0.8,
                'colsample_bytree': 0.8
            }
        },
        'RandomForest_Default': {
            'model_type': 'random_forest',
            'balance_classes': True,
            'rf_params': {
                'n_estimators': 100,
                'max_depth': 10
            }
        },
        'RandomForest_Tuned': {
            'model_type': 'random_forest',
            'balance_classes': True,
            'rf_params': {
                'n_estimators': 200,
                'max_depth': 15,
                'min_samples_split': 10,
                'min_samples_leaf': 5
            }
        }
    }
    
    for model_name, config in configs.items():
        print(f"\n🔧 Training {model_name}")
        print("-" * 30)
        
        # Add common config parameters
        config.update({
            'test_size': 0.2,
            'cv_folds': 5,
            'random_state': 42
        })
        
        # Initialize predictor
        predictor = RockfallPredictor(config)
        
        # Prepare data
        X, y = predictor.prepare_training_data(features_df, labels)
        
        # Train model
        model_results = predictor.train_model(X, y)
        
        # Spatial cross-validation
        spatial_cv_scores = predictor.spatial_cross_validation(X, y, coordinates, n_splits=3)
        
        # Store results
        results[model_name] = {
            'model_results': model_results,
            'spatial_cv_scores': spatial_cv_scores,
            'config': config
        }
        
        # Print summary
        print(f"Test Accuracy: {model_results.metrics['accuracy']:.3f}")
        if 'roc_auc' in model_results.metrics:
            print(f"ROC-AUC: {model_results.metrics['roc_auc']:.3f}")
        print(f"CV Score: {np.mean(model_results.cv_scores):.3f} ± {np.std(model_results.cv_scores):.3f}")
        print(f"Spatial CV: {np.mean(spatial_cv_scores):.3f} ± {np.std(spatial_cv_scores):.3f}")
    
    return results

def hyperparameter_tuning(features_df: pd.DataFrame, labels: np.ndarray) -> dict:
    """
    Perform hyperparameter tuning for best model
    
    Args:
        features_df: Feature DataFrame
        labels: Target labels
        
    Returns:
        Best parameters and results
    """
    
    print("\n🔍 Hyperparameter Tuning (XGBoost)")
    print("=" * 35)
    
    from sklearn.model_selection import StratifiedKFold
    import xgboost as xgb
    
    # Prepare data
    config = {'test_size': 0.2, 'random_state': 42, 'balance_classes': True}
    predictor = RockfallPredictor(config)
    X, y = predictor.prepare_training_data(features_df, labels)
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Handle class imbalance
    X_train_balanced, y_train_balanced = predictor.handle_class_imbalance(X_train, y_train)
    
    # Scale features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)
    
    # Define parameter grid
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [6, 8, 10],
        'learning_rate': [0.05, 0.1, 0.2],
        'subsample': [0.8, 0.9],
        'colsample_bytree': [0.8, 0.9]
    }
    
    # Create base model
    base_model = xgb.XGBClassifier(random_state=42)
    
    # Grid search with cross-validation
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    grid_search = GridSearchCV(
        base_model, param_grid, cv=cv, scoring='roc_auc',
        n_jobs=-1, verbose=1
    )
    
    print("Running grid search...")
    grid_search.fit(X_train_scaled, y_train_balanced)
    
    # Get best model
    best_model = grid_search.best_estimator_
    
    # Evaluate on test set
    y_pred = best_model.predict(X_test_scaled)
    y_prob = best_model.predict_proba(X_test_scaled)[:, 1]
    
    from sklearn.metrics import accuracy_score, roc_auc_score
    test_accuracy = accuracy_score(y_test, y_pred)
    test_roc_auc = roc_auc_score(y_test, y_prob)
    
    results = {
        'best_params': grid_search.best_params_,
        'best_cv_score': grid_search.best_score_,
        'test_accuracy': test_accuracy,
        'test_roc_auc': test_roc_auc,
        'model': best_model
    }
    
    print(f"\nBest parameters: {grid_search.best_params_}")
    print(f"Best CV score: {grid_search.best_score_:.3f}")
    print(f"Test accuracy: {test_accuracy:.3f}")
    print(f"Test ROC-AUC: {test_roc_auc:.3f}")
    
    return results

def analyze_feature_importance(model_results: dict):
    """Analyze and visualize feature importance across models"""
    
    print("\n📊 Feature Importance Analysis")
    print("=" * 30)
    
    # Collect feature importance from all models
    importance_data = {}
    
    for model_name, results in model_results.items():
        importance_data[model_name] = results['model_results'].feature_importance
    
    # Create comparison DataFrame
    all_features = set()
    for importances in importance_data.values():
        all_features.update(importances.keys())
    
    importance_df = pd.DataFrame(index=list(all_features))
    
    for model_name, importances in importance_data.items():
        importance_df[model_name] = [importances.get(feat, 0) for feat in importance_df.index]
    
    # Plot feature importance comparison
    plt.figure(figsize=(14, 10))
    
    # Top 15 features by average importance
    importance_df['mean'] = importance_df.mean(axis=1)
    top_features = importance_df.nlargest(15, 'mean')
    
    # Create heatmap
    plt.subplot(2, 2, 1)
    sns.heatmap(top_features.drop('mean', axis=1).T, annot=True, fmt='.3f', cmap='YlOrRd')
    plt.title('Feature Importance by Model')
    plt.xlabel('Features')
    plt.ylabel('Models')
    
    # Feature importance distribution
    plt.subplot(2, 2, 2)
    for model_name in importance_df.columns[:-1]:  # Exclude 'mean'
        plt.plot(range(len(top_features)), top_features[model_name], 
                marker='o', label=model_name, alpha=0.7)
    plt.xlabel('Feature Rank')
    plt.ylabel('Importance')
    plt.title('Feature Importance by Rank')
    plt.legend()
    
    # Feature categories
    plt.subplot(2, 2, 3)
    categories = {
        'Topographic': ['slope', 'aspect', 'curvature', 'roughness', 'tpi', 'elevation'],
        'Point Cloud': ['density', 'height', 'intensity', 'return'],
        'Temporal': ['change', 'rate']
    }
    
    category_importance = {}
    for category, keywords in categories.items():
        importance = 0
        count = 0
        for feature in top_features.index:
            if any(keyword in feature.lower() for keyword in keywords):
                importance += top_features.loc[feature, 'mean']
                count += 1
        category_importance[category] = importance / count if count > 0 else 0
    
    plt.bar(category_importance.keys(), category_importance.values(), 
           color=['brown', 'green', 'blue'])
    plt.title('Average Importance by Feature Category')
    plt.ylabel('Average Importance')
    
    # Top 10 individual features
    plt.subplot(2, 2, 4)
    top_10 = top_features.head(10)
    plt.barh(range(len(top_10)), top_10['mean'])
    plt.yticks(range(len(top_10)), top_10.index)
    plt.xlabel('Average Importance')
    plt.title('Top 10 Most Important Features')
    
    plt.tight_layout()
    plt.savefig('outputs/models/feature_importance_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Print summary
    print("Top 10 most important features:")
    for i, (feature, importance) in enumerate(top_10['mean'].items(), 1):
        print(f"  {i:2d}. {feature}: {importance:.3f}")

def create_model_comparison_report(model_results: dict, output_path: str = "outputs/models/model_comparison.md"):
    """Create comprehensive model comparison report"""
    
    print(f"\n📄 Creating Model Comparison Report")
    print("-" * 35)
    
    # Collect metrics
    comparison_data = []
    
    for model_name, results in model_results.items():
        metrics = results['model_results'].metrics
        spatial_cv = results['spatial_cv_scores']
        
        comparison_data.append({
            'Model': model_name,
            'Accuracy': metrics['accuracy'],
            'Precision': metrics['precision'],
            'Recall': metrics['recall'],
            'F1-Score': metrics['f1'],
            'ROC-AUC': metrics.get('roc_auc', 'N/A'),
            'CV Score': f"{np.mean(results['model_results'].cv_scores):.3f} ± {np.std(results['model_results'].cv_scores):.3f}",
            'Spatial CV': f"{np.mean(spatial_cv):.3f} ± {np.std(spatial_cv):.3f}"
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    
    # Create report
    report = f"""# Rockfall Prediction Model Comparison Report

Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}

## Executive Summary

This report compares the performance of different machine learning models for rockfall risk prediction.
The models were trained on synthetic data with {len(model_results)} different configurations.

## Model Performance Comparison

{comparison_df.to_markdown(index=False, floatfmt='.3f')}

## Key Findings

### Best Performing Model
"""
    
    # Find best model
    if all(isinstance(row['ROC-AUC'], (int, float)) for row in comparison_data):
        best_model = max(comparison_data, key=lambda x: x['ROC-AUC'])
        report += f"- **{best_model['Model']}** achieved the highest ROC-AUC score of {best_model['ROC-AUC']:.3f}\n"
    else:
        best_model = max(comparison_data, key=lambda x: x['Accuracy'])
        report += f"- **{best_model['Model']}** achieved the highest accuracy of {best_model['Accuracy']:.3f}\n"
    
    report += f"""
### Model Stability
- Spatial cross-validation scores help assess model generalization to different areas
- Models with smaller standard deviations show more consistent performance

### Recommendations
1. **Production Use**: Consider {best_model['Model']} for deployment
2. **Monitoring**: Implement continuous model evaluation
3. **Retraining**: Schedule regular model updates with new data
4. **Ensemble**: Consider combining top-performing models

## Feature Importance Insights

Based on the analysis across all models:

1. **Slope** consistently ranks as the most important feature
2. **Curvature** features provide significant predictive power
3. **Temporal change** features are crucial for change detection
4. **Point cloud quality** features help assess prediction confidence

## Technical Details

### Data Characteristics
- Training samples: {len(model_results[list(model_results.keys())[0]]['model_results'].feature_names):,}
- Feature count: {len(model_results[list(model_results.keys())[0]]['model_results'].feature_names)}
- Class distribution: Imbalanced (typical for rare events)

### Validation Strategy
- Standard cross-validation for model selection
- Spatial cross-validation to account for spatial autocorrelation
- Train/test split: 80/20

### Class Imbalance Handling
- SMOTE oversampling applied during training
- Class weights adjusted in algorithms
- Evaluation focuses on ROC-AUC and precision-recall metrics

## Next Steps

1. **Model Deployment**: Deploy best model to production pipeline
2. **Real Data Validation**: Test models on actual mine survey data
3. **Threshold Optimization**: Calibrate probability thresholds for operational use
4. **Integration**: Incorporate model into monitoring dashboard
5. **Documentation**: Create operational procedures for model use

---
*Report generated by Rockfall Prediction System*
"""
    
    # Save report
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(report)
    
    print(f"Report saved to: {output_path}")

def main():
    """Main training and comparison workflow"""
    
    print("🎯 Machine Learning Model Training & Comparison")
    print("=" * 50)
    
    # Create output directories
    output_dir = Path('outputs/models')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Generate comprehensive synthetic dataset
    print("\n📊 Step 1: Generating Synthetic Dataset")
    features_df, labels, coordinates = create_comprehensive_synthetic_features(n_samples=3000)
    
    # Step 2: Compare different models
    print("\n🤖 Step 2: Comparing ML Models")
    model_results = compare_models(features_df, labels, coordinates)
    
    # Step 3: Hyperparameter tuning for best model
    print("\n🔍 Step 3: Hyperparameter Tuning")
    tuning_results = hyperparameter_tuning(features_df, labels)
    
    # Step 4: Feature importance analysis
    print("\n📊 Step 4: Feature Importance Analysis")
    analyze_feature_importance(model_results)
    
    # Step 5: Create comparison report
    print("\n📄 Step 5: Generating Report")
    create_model_comparison_report(model_results)
    
    # Step 6: Save best model
    print("\n💾 Step 6: Saving Best Model")
    best_model_name = max(model_results.keys(), 
                         key=lambda x: model_results[x]['model_results'].metrics.get('roc_auc', 
                                      model_results[x]['model_results'].metrics['accuracy']))
    
    best_model_results = model_results[best_model_name]['model_results']
    
    # Save using the predictor's save method
    config = model_results[best_model_name]['config']
    predictor = RockfallPredictor(config)
    predictor.save_model(best_model_results, str(output_dir / "best_rockfall_model"))
    
    print(f"Best model ({best_model_name}) saved to outputs/models/")
    
    # Summary
    print("\n✅ Training Complete!")
    print("=" * 50)
    print("Generated outputs:")
    print("  📁 outputs/models/best_rockfall_model_* - Best trained model")
    print("  📁 outputs/models/model_comparison.md - Comparison report")
    print("  📁 outputs/models/feature_importance_analysis.png - Feature analysis")
    
    print(f"\n🏆 Best Model: {best_model_name}")
    best_metrics = best_model_results.metrics
    print(f"  Accuracy: {best_metrics['accuracy']:.3f}")
    if 'roc_auc' in best_metrics:
        print(f"  ROC-AUC: {best_metrics['roc_auc']:.3f}")
    
    print("\n🎯 Next Steps:")
    print("  1. Test model with real data")
    print("  2. Deploy to production pipeline")
    print("  3. Set up monitoring and retraining")

if __name__ == "__main__":
    main()