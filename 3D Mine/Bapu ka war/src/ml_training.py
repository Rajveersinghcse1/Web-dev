"""
Machine Learning Training Module

This module handles training and evaluation of machine learning models
for rockfall risk prediction.
"""

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (classification_report, confusion_matrix, roc_auc_score,
                           precision_recall_curve, roc_curve, average_precision_score)
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb

# Optional imports with fallback
try:
    from imblearn.over_sampling import SMOTE, RandomOverSampler
    from imblearn.under_sampling import RandomUnderSampler
    from imblearn.combine import SMOTETomek
    HAS_IMBLEARN = True
except ImportError:
    HAS_IMBLEARN = False
    print("Warning: imbalanced-learn not available. Class imbalance handling will use class weights only.")
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Tuple, Optional, Dict, Any, Union
from pathlib import Path
import logging
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelResults:
    """Container for model training results"""
    model: Any
    scaler: StandardScaler
    feature_names: List[str]
    metrics: Dict[str, float]
    predictions: np.ndarray
    probabilities: np.ndarray
    feature_importance: Dict[str, float]
    cv_scores: np.ndarray

class RockfallPredictor:
    """Main class for rockfall risk prediction modeling"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize predictor
        
        Args:
            config: Configuration dictionary (optional)
        """
        self.config = config or {}
        self.model_type = self.config.get('model_type', 'xgboost')
        self.random_state = self.config.get('random_state', 42)
        
    def prepare_training_data(self, features: pd.DataFrame, labels: np.ndarray = None,
                            coordinates: np.ndarray = None) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Prepare data for training
        
        Args:
            features: Feature DataFrame
            labels: Target labels (if None, creates synthetic labels)
            coordinates: Coordinate array
            
        Returns:
            Tuple of (prepared features, labels)
        """
        logger.info("Preparing training data")
        
        # Handle missing values
        features_clean = features.fillna(features.median())
        
        # Remove constant features
        constant_features = features_clean.columns[features_clean.nunique() <= 1]
        if len(constant_features) > 0:
            logger.info(f"Removing {len(constant_features)} constant features")
            features_clean = features_clean.drop(columns=constant_features)
            
        # Create synthetic labels if not provided
        if labels is None:
            logger.info("Creating synthetic labels for demonstration")
            labels = self._create_synthetic_labels(features_clean, coordinates)
            
        logger.info(f"Training data prepared: {len(features_clean)} samples, {len(features_clean.columns)} features")
        logger.info(f"Label distribution: {np.bincount(labels)}")
        
        return features_clean, labels
        
    def _create_synthetic_labels(self, features: pd.DataFrame, 
                               coordinates: np.ndarray = None) -> np.ndarray:
        """
        Create synthetic rockfall labels for demonstration
        
        Args:
            features: Feature DataFrame
            coordinates: Coordinate array
            
        Returns:
            Synthetic binary labels
        """
        n_samples = len(features)
        labels = np.zeros(n_samples, dtype=int)
        
        # Create high-risk areas based on feature combinations
        high_risk_mask = np.zeros(n_samples, dtype=bool)
        
        # High slope areas
        if 'slope' in features.columns:
            slope_threshold = features['slope'].quantile(0.8)
            high_risk_mask |= (features['slope'] > slope_threshold)
            
        # High curvature areas (convex areas more prone to rockfall)
        if 'profile_curvature' in features.columns:
            curvature_threshold = features['profile_curvature'].quantile(0.85)
            high_risk_mask |= (features['profile_curvature'] > curvature_threshold)
            
        # High roughness areas
        if 'roughness' in features.columns:
            roughness_threshold = features['roughness'].quantile(0.8)
            high_risk_mask |= (features['roughness'] > roughness_threshold)
            
        # Areas with significant elevation change
        if 'elevation_change' in features.columns:
            change_threshold = np.abs(features['elevation_change']).quantile(0.9)
            high_risk_mask |= (np.abs(features['elevation_change']) > change_threshold)
            
        # Add some randomness
        np.random.seed(self.random_state)
        random_risk = np.random.random(n_samples) < 0.05  # 5% random risk
        high_risk_mask |= random_risk
        
        labels[high_risk_mask] = 1
        
        # Balance classes to reasonable ratio (e.g., 10% high risk)
        high_risk_ratio = 0.1
        n_high_risk = int(n_samples * high_risk_ratio)
        current_high_risk = np.sum(labels)
        
        if current_high_risk > n_high_risk:
            # Randomly remove some high-risk labels
            high_risk_indices = np.where(labels == 1)[0]
            remove_indices = np.random.choice(
                high_risk_indices, 
                current_high_risk - n_high_risk, 
                replace=False
            )
            labels[remove_indices] = 0
        elif current_high_risk < n_high_risk:
            # Add more high-risk labels
            low_risk_indices = np.where(labels == 0)[0]
            add_indices = np.random.choice(
                low_risk_indices,
                n_high_risk - current_high_risk,
                replace=False
            )
            labels[add_indices] = 1
            
        return labels
        
    def handle_class_imbalance(self, X: pd.DataFrame, y: np.ndarray,
                              method: str = "smote") -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Handle class imbalance in training data
        
        Args:
            X: Feature DataFrame
            y: Target labels
            method: Resampling method ("smote", "random_over", "random_under", "smote_tomek")
            
        Returns:
            Tuple of (resampled features, resampled labels)
        """
        if not self.config.get('balance_classes', True):
            return X, y
        
        if not HAS_IMBLEARN:
            logger.warning("imbalanced-learn not available, skipping resampling")
            return X, y
            
        logger.info(f"Handling class imbalance using {method}")
        logger.info(f"Original class distribution: {np.bincount(y)}")
        
        if method == "smote":
            sampler = SMOTE(
                sampling_strategy=self.config.get('sampling_strategy', 'auto'),
                random_state=self.random_state
            )
        elif method == "random_over":
            sampler = RandomOverSampler(
                sampling_strategy=self.config.get('sampling_strategy', 'auto'),
                random_state=self.random_state
            )
        elif method == "random_under":
            sampler = RandomUnderSampler(
                sampling_strategy=self.config.get('sampling_strategy', 'auto'),
                random_state=self.random_state
            )
        elif method == "smote_tomek":
            sampler = SMOTETomek(
                sampling_strategy=self.config.get('sampling_strategy', 'auto'),
                random_state=self.random_state
            )
        else:
            raise ValueError(f"Unknown resampling method: {method}")
            
        X_resampled, y_resampled = sampler.fit_resample(X, y)
        
        logger.info(f"Resampled class distribution: {np.bincount(y_resampled)}")
        
        # Convert back to DataFrame
        X_resampled = pd.DataFrame(X_resampled, columns=X.columns)
        
        return X_resampled, y_resampled
        
    def train_model(self, X: pd.DataFrame, y: np.ndarray) -> ModelResults:
        """
        Train machine learning model
        
        Args:
            X: Feature DataFrame
            y: Target labels
            
        Returns:
            ModelResults object
        """
        logger.info(f"Training {self.model_type} model")
        
        # Split data
        test_size = self.config.get('test_size', 0.2)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state, stratify=y
        )
        
        # Handle class imbalance on training data only
        X_train_balanced, y_train_balanced = self.handle_class_imbalance(X_train, y_train)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train_balanced)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        if self.model_type == "random_forest":
            model = self._train_random_forest(X_train_scaled, y_train_balanced)
        elif self.model_type == "xgboost":
            model = self._train_xgboost(X_train_scaled, y_train_balanced)
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
            
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Evaluate model
        metrics = self._evaluate_model(y_test, y_pred, y_prob)
        
        # Cross-validation
        cv_folds = self.config.get('cv_folds', 5)
        cv_scores = cross_val_score(
            model, X_train_scaled, y_train_balanced, 
            cv=StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=self.random_state),
            scoring='roc_auc' if y_prob is not None else 'accuracy'
        )
        
        # Feature importance
        feature_names = X.columns if hasattr(X, 'columns') else [f'feature_{i}' for i in range(X.shape[1])]
        feature_importance = self._get_feature_importance(model, feature_names)
        
        results = ModelResults(
            model=model,
            scaler=scaler,
            feature_names=feature_names,
            metrics=metrics,
            predictions=y_pred,
            probabilities=y_prob,
            feature_importance=feature_importance,
            cv_scores=cv_scores
        )
        
        logger.info(f"Training complete. Test accuracy: {metrics.get('accuracy', 'N/A'):.3f}")
        if 'roc_auc' in metrics:
            logger.info(f"Test ROC-AUC: {metrics['roc_auc']:.3f}")
            
        return results
        
    def _train_random_forest(self, X_train: np.ndarray, y_train: np.ndarray) -> RandomForestClassifier:
        """Train Random Forest model"""
        
        # Get parameters from config
        rf_params = self.config.get('rf_params', {})
        default_params = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': self.random_state,
            'n_jobs': -1
        }
        params = {**default_params, **rf_params}
        
        # Compute class weights
        class_weights = compute_class_weight(
            'balanced', classes=np.unique(y_train), y=y_train
        )
        class_weight_dict = dict(zip(np.unique(y_train), class_weights))
        params['class_weight'] = class_weight_dict
        
        model = RandomForestClassifier(**params)
        model.fit(X_train, y_train)
        
        return model
        
    def _train_xgboost(self, X_train: np.ndarray, y_train: np.ndarray) -> xgb.XGBClassifier:
        """Train XGBoost model"""
        
        # Get parameters from config
        xgb_params = self.config.get('xgb_params', {})
        default_params = {
            'n_estimators': 100,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': self.random_state,
            'n_jobs': -1
        }
        params = {**default_params, **xgb_params}
        
        # Compute scale_pos_weight for class imbalance
        n_pos = np.sum(y_train == 1)
        n_neg = np.sum(y_train == 0)
        if n_pos > 0:
            params['scale_pos_weight'] = n_neg / n_pos
            
        model = xgb.XGBClassifier(**params)
        model.fit(X_train, y_train)
        
        return model
        
    def _evaluate_model(self, y_true: np.ndarray, y_pred: np.ndarray, 
                       y_prob: np.ndarray = None) -> Dict[str, float]:
        """Evaluate model performance"""
        
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted'),
            'recall': recall_score(y_true, y_pred, average='weighted'),
            'f1': f1_score(y_true, y_pred, average='weighted')
        }
        
        if y_prob is not None:
            metrics['roc_auc'] = roc_auc_score(y_true, y_prob)
            metrics['avg_precision'] = average_precision_score(y_true, y_prob)
            
        return metrics
        
    def _get_feature_importance(self, model: Any, feature_names: List[str]) -> Dict[str, float]:
        """Get feature importance from trained model"""
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
        else:
            return {}
            
        # Sort by importance
        importance_dict = dict(zip(feature_names, importances))
        sorted_importance = dict(sorted(importance_dict.items(), 
                                      key=lambda x: x[1], reverse=True))
        
        return sorted_importance
        
    def predict(self, model_results: ModelResults, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions with trained model
        
        Args:
            model_results: Trained model results
            X: Feature DataFrame
            
        Returns:
            Tuple of (predictions, probabilities)
        """
        # Ensure feature order matches training
        X_ordered = X[model_results.feature_names]
        
        # Scale features
        X_scaled = model_results.scaler.transform(X_ordered)
        
        # Make predictions
        predictions = model_results.model.predict(X_scaled)
        
        probabilities = None
        if hasattr(model_results.model, 'predict_proba'):
            probabilities = model_results.model.predict_proba(X_scaled)[:, 1]
            
        return predictions, probabilities
        
    def spatial_cross_validation(self, X: pd.DataFrame, y: np.ndarray, 
                                coordinates: np.ndarray, n_splits: int = 5) -> np.ndarray:
        """
        Perform spatial cross-validation to account for spatial autocorrelation
        
        Args:
            X: Feature DataFrame
            y: Target labels
            coordinates: Coordinate array (N, 2)
            n_splits: Number of CV splits
            
        Returns:
            Array of CV scores
        """
        logger.info("Performing spatial cross-validation")
        
        from sklearn.cluster import KMeans
        
        # Cluster coordinates to create spatial folds
        kmeans = KMeans(n_clusters=n_splits, random_state=self.random_state)
        spatial_folds = kmeans.fit_predict(coordinates)
        
        cv_scores = []
        
        for fold in range(n_splits):
            # Create train/test split based on spatial clusters
            test_mask = spatial_folds == fold
            train_mask = ~test_mask
            
            if np.sum(train_mask) < 10 or np.sum(test_mask) < 10:
                logger.warning(f"Fold {fold} has too few samples, skipping")
                continue
                
            X_train_fold = X[train_mask]
            X_test_fold = X[test_mask]
            y_train_fold = y[train_mask]
            y_test_fold = y[test_mask]
            
            # Check if both classes are present
            if len(np.unique(y_train_fold)) < 2 or len(np.unique(y_test_fold)) < 2:
                logger.warning(f"Fold {fold} doesn't have both classes, skipping")
                continue
                
            # Handle class imbalance
            X_train_balanced, y_train_balanced = self.handle_class_imbalance(
                X_train_fold, y_train_fold
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train_balanced)
            X_test_scaled = scaler.transform(X_test_fold)
            
            # Train model
            if self.model_type == "random_forest":
                model = self._train_random_forest(X_train_scaled, y_train_balanced)
            elif self.model_type == "xgboost":
                model = self._train_xgboost(X_train_scaled, y_train_balanced)
                
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            
            if hasattr(model, 'predict_proba'):
                y_prob = model.predict_proba(X_test_scaled)[:, 1]
                score = roc_auc_score(y_test_fold, y_prob)
            else:
                from sklearn.metrics import accuracy_score
                score = accuracy_score(y_test_fold, y_pred)
                
            cv_scores.append(score)
            logger.info(f"Fold {fold} score: {score:.3f}")
            
        cv_scores = np.array(cv_scores)
        logger.info(f"Spatial CV mean score: {np.mean(cv_scores):.3f} (+/- {np.std(cv_scores)*2:.3f})")
        
        return cv_scores
        
    def plot_results(self, model_results: ModelResults, output_dir: str = None):
        """
        Create visualization plots for model results
        
        Args:
            model_results: Model results object
            output_dir: Output directory for plots
        """
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
        # Feature importance plot
        plt.figure(figsize=(10, 8))
        top_features = dict(list(model_results.feature_importance.items())[:15])
        plt.barh(range(len(top_features)), list(top_features.values()))
        plt.yticks(range(len(top_features)), list(top_features.keys()))
        plt.xlabel('Feature Importance')
        plt.title('Top 15 Feature Importances')
        plt.tight_layout()
        
        if output_dir:
            plt.savefig(output_dir / "feature_importance.png", dpi=300, bbox_inches='tight')
        plt.show()
        
        # ROC curve
        if model_results.probabilities is not None:
            # Note: This assumes we have access to test labels
            # In practice, you'd need to store these in ModelResults
            plt.figure(figsize=(8, 6))
            plt.plot([0, 1], [0, 1], 'k--', label='Random')
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('ROC Curve')
            plt.legend()
            
            if output_dir:
                plt.savefig(output_dir / "roc_curve.png", dpi=300, bbox_inches='tight')
            plt.show()
            
        # Cross-validation scores
        plt.figure(figsize=(8, 6))
        plt.boxplot(model_results.cv_scores)
        plt.ylabel('CV Score')
        plt.title('Cross-Validation Scores')
        
        if output_dir:
            plt.savefig(output_dir / "cv_scores.png", dpi=300, bbox_inches='tight')
        plt.show()
        
    def save_model(self, model_results: ModelResults, output_path: str):
        """
        Save trained model and metadata
        
        Args:
            model_results: Model results object
            output_path: Output file path (without extension)
        """
        output_path = Path(output_path)
        
        # Save model
        joblib.dump(model_results.model, f"{output_path}_model.pkl")
        
        # Save scaler
        joblib.dump(model_results.scaler, f"{output_path}_scaler.pkl")
        
        # Save metadata
        metadata = {
            'feature_names': model_results.feature_names,
            'metrics': model_results.metrics,
            'feature_importance': model_results.feature_importance,
            'cv_scores': model_results.cv_scores.tolist()
        }
        
        import json
        with open(f"{output_path}_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
            
        logger.info(f"Saved model to {output_path}")
        
    def load_model(self, model_path: str) -> ModelResults:
        """
        Load trained model
        
        Args:
            model_path: Path to model file (without extension)
            
        Returns:
            ModelResults object
        """
        model_path = Path(model_path)
        
        # Load model and scaler
        model = joblib.load(f"{model_path}_model.pkl")
        scaler = joblib.load(f"{model_path}_scaler.pkl")
        
        # Load metadata
        import json
        with open(f"{model_path}_metadata.json", 'r') as f:
            metadata = json.load(f)
            
        results = ModelResults(
            model=model,
            scaler=scaler,
            feature_names=metadata['feature_names'],
            metrics=metadata['metrics'],
            predictions=np.array([]),  # Not stored
            probabilities=np.array([]),  # Not stored
            feature_importance=metadata['feature_importance'],
            cv_scores=np.array(metadata['cv_scores'])
        )
        
        logger.info(f"Loaded model from {model_path}")
        return results

def main():
    """Example usage"""
    # Configuration
    config = {
        'model_type': 'xgboost',
        'test_size': 0.2,
        'cv_folds': 5,
        'random_state': 42,
        'balance_classes': True,
        'sampling_strategy': 'auto',
        'xgb_params': {
            'n_estimators': 100,
            'max_depth': 6,
            'learning_rate': 0.1
        }
    }
    
    # Initialize predictor
    predictor = RockfallPredictor(config)
    
    # Create synthetic data for testing
    np.random.seed(42)
    n_samples = 1000
    n_features = 10
    
    # Generate synthetic features
    feature_names = [f'feature_{i}' for i in range(n_features)]
    X = pd.DataFrame(
        np.random.randn(n_samples, n_features),
        columns=feature_names
    )
    
    # Generate synthetic coordinates
    coordinates = np.random.uniform(0, 100, (n_samples, 2))
    
    # Prepare data
    X_prepared, y = predictor.prepare_training_data(X, coordinates=coordinates)
    
    # Train model
    results = predictor.train_model(X_prepared, y)
    
    # Spatial cross-validation
    spatial_cv_scores = predictor.spatial_cross_validation(X_prepared, y, coordinates)
    
    # Create plots
    output_dir = Path("outputs/models")
    output_dir.mkdir(parents=True, exist_ok=True)
    predictor.plot_results(results, output_dir)
    
    # Save model
    predictor.save_model(results, output_dir / "rockfall_model")
    
    print("Model training complete!")
    print(f"Test accuracy: {results.metrics['accuracy']:.3f}")
    if 'roc_auc' in results.metrics:
        print(f"Test ROC-AUC: {results.metrics['roc_auc']:.3f}")
    print(f"CV mean score: {np.mean(results.cv_scores):.3f}")
    print(f"Spatial CV mean score: {np.mean(spatial_cv_scores):.3f}")

if __name__ == "__main__":
    main()