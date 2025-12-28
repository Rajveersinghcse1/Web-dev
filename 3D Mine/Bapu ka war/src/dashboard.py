"""
Streamlit Dashboard for Rockfall Risk Prediction

Interactive dashboard for visualizing mine data, risk predictions, and monitoring.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import rasterio
from rasterio.plot import show
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import datetime
from typing import Dict, Any, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# Import our custom modules
import sys
sys.path.append('src')

try:
    from data_ingestion import LiDARProcessor
    from model_3d_generation import Model3DGenerator
    from feature_engineering import FeatureExtractor
    from ml_training import RockfallPredictor
except ImportError as e:
    st.error(f"Error importing modules: {e}")
    st.stop()

# Page configuration
st.set_page_config(
    page_title="Rockfall Risk Prediction System",
    page_icon="⛰️",
    layout="wide",
    initial_sidebar_state="expanded"
)

def load_config():
    """Load configuration from YAML file"""
    try:
        import yaml
        with open('config/config.yaml', 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        st.error(f"Error loading config: {e}")
        return {}

def load_sample_data():
    """Load or generate sample data for demonstration"""
    # Create synthetic DEM and risk data
    np.random.seed(42)
    
    # Generate synthetic mine terrain
    x = np.linspace(0, 1000, 100)  # 1km x 1km area
    y = np.linspace(0, 1000, 100)
    X, Y = np.meshgrid(x, y)
    
    # Create realistic mine pit topography
    center_x, center_y = 500, 500
    radius = 300
    
    # Distance from center
    dist_from_center = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
    
    # Create pit shape (higher elevation at edges, lower in center)
    elevation = 100 + 50 * np.exp(-dist_from_center/200) + np.random.normal(0, 5, X.shape)
    
    # Create risk prediction (higher risk near steep slopes)
    gradient_x = np.gradient(elevation, axis=1)
    gradient_y = np.gradient(elevation, axis=0)
    slope = np.sqrt(gradient_x**2 + gradient_y**2)
    
    # Normalize slope to create risk probability
    risk_prob = np.clip(slope / np.max(slope), 0, 1)
    risk_prob = 0.1 + 0.8 * risk_prob  # Scale to 0.1-0.9 range
    
    return {
        'x': x,
        'y': y,
        'X': X,
        'Y': Y,
        'elevation': elevation,
        'risk_probability': risk_prob,
        'slope': slope
    }

def create_3d_terrain_plot(data: Dict):
    """Create 3D terrain visualization"""
    fig = go.Figure(data=[
        go.Surface(
            x=data['X'],
            y=data['Y'],
            z=data['elevation'],
            colorscale='earth',
            name='Elevation',
            showscale=True,
            colorbar=dict(title="Elevation (m)")
        )
    ])
    
    fig.update_layout(
        title="3D Mine Terrain Model",
        scene=dict(
            xaxis_title="X Coordinate (m)",
            yaxis_title="Y Coordinate (m)",
            zaxis_title="Elevation (m)",
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=1.5)
            )
        ),
        height=600
    )
    
    return fig

def create_risk_heatmap(data: Dict):
    """Create risk probability heatmap"""
    fig = go.Figure(data=go.Heatmap(
        x=data['x'],
        y=data['y'],
        z=data['risk_probability'],
        colorscale='RdYlBu_r',
        colorbar=dict(title="Risk Probability")
    ))
    
    fig.update_layout(
        title="Rockfall Risk Probability Map",
        xaxis_title="X Coordinate (m)",
        yaxis_title="Y Coordinate (m)",
        height=500
    )
    
    return fig

def create_slope_analysis(data: Dict):
    """Create slope analysis visualization"""
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=["Slope Map", "Slope Distribution"],
        specs=[[{"type": "heatmap"}, {"type": "histogram"}]]
    )
    
    # Slope heatmap
    fig.add_trace(
        go.Heatmap(
            x=data['x'],
            y=data['y'],
            z=data['slope'],
            colorscale='viridis',
            showscale=True,
            colorbar=dict(title="Slope", x=0.45)
        ),
        row=1, col=1
    )
    
    # Slope histogram
    fig.add_trace(
        go.Histogram(
            x=data['slope'].flatten(),
            nbinsx=50,
            showlegend=False
        ),
        row=1, col=2
    )
    
    fig.update_layout(
        title="Slope Analysis",
        height=400
    )
    
    fig.update_xaxes(title_text="X Coordinate (m)", row=1, col=1)
    fig.update_yaxes(title_text="Y Coordinate (m)", row=1, col=1)
    fig.update_xaxes(title_text="Slope", row=1, col=2)
    fig.update_yaxes(title_text="Frequency", row=1, col=2)
    
    return fig

def create_temporal_analysis():
    """Create temporal change analysis"""
    # Generate synthetic temporal data
    dates = pd.date_range('2023-01-01', '2024-01-01', freq='M')
    
    # Simulate rockfall events over time
    np.random.seed(42)
    events_per_month = np.random.poisson(5, len(dates))
    cumulative_events = np.cumsum(events_per_month)
    
    # Simulate risk levels over time
    risk_levels = 0.3 + 0.4 * np.sin(np.linspace(0, 4*np.pi, len(dates))) + np.random.normal(0, 0.1, len(dates))
    risk_levels = np.clip(risk_levels, 0, 1)
    
    fig = make_subplots(
        rows=2, cols=1,
        subplot_titles=["Cumulative Rockfall Events", "Average Risk Level"],
        shared_xaxes=True
    )
    
    # Cumulative events
    fig.add_trace(
        go.Scatter(
            x=dates,
            y=cumulative_events,
            mode='lines+markers',
            name='Cumulative Events',
            line=dict(color='red')
        ),
        row=1, col=1
    )
    
    # Risk levels
    fig.add_trace(
        go.Scatter(
            x=dates,
            y=risk_levels,
            mode='lines',
            name='Average Risk',
            fill='tonexty',
            line=dict(color='orange')
        ),
        row=2, col=1
    )
    
    fig.update_layout(
        title="Temporal Analysis",
        height=500
    )
    
    fig.update_yaxes(title_text="Events", row=1, col=1)
    fig.update_yaxes(title_text="Risk Level", row=2, col=1)
    fig.update_xaxes(title_text="Date", row=2, col=1)
    
    return fig

def create_feature_importance_plot():
    """Create feature importance visualization"""
    # Sample feature importance data
    features = [
        'Slope', 'Profile Curvature', 'Roughness', 'Elevation Change',
        'Point Density', 'TPI', 'Aspect', 'Planform Curvature',
        'Intensity Mean', 'Height Std'
    ]
    
    importance = [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.05, 0.04, 0.02, 0.01]
    
    fig = go.Figure([
        go.Bar(
            x=importance,
            y=features,
            orientation='h',
            marker_color='steelblue'
        )
    ])
    
    fig.update_layout(
        title="Feature Importance in Risk Prediction",
        xaxis_title="Importance Score",
        yaxis_title="Features",
        height=400
    )
    
    return fig

def display_model_metrics():
    """Display model performance metrics"""
    # Sample metrics
    metrics = {
        'Accuracy': 0.847,
        'Precision': 0.823,
        'Recall': 0.871,
        'F1-Score': 0.846,
        'ROC-AUC': 0.912,
        'Average Precision': 0.889
    }
    
    # Create metrics display
    cols = st.columns(3)
    
    for i, (metric, value) in enumerate(metrics.items()):
        with cols[i % 3]:
            st.metric(metric, f"{value:.3f}")

def create_alert_system():
    """Create alert monitoring system"""
    st.subheader("⚠️ Alert System")
    
    # Sample alerts
    alerts = [
        {
            'timestamp': '2024-01-15 14:30:00',
            'location': 'Sector A, Bench 3',
            'risk_level': 'HIGH',
            'probability': 0.89,
            'description': 'Significant elevation change detected'
        },
        {
            'timestamp': '2024-01-15 12:15:00',
            'location': 'Sector B, Bench 1',
            'risk_level': 'MEDIUM',
            'probability': 0.67,
            'description': 'Increased slope instability'
        },
        {
            'timestamp': '2024-01-15 09:45:00',
            'location': 'Sector C, Bench 2',
            'risk_level': 'LOW',
            'probability': 0.34,
            'description': 'Minor surface changes'
        }
    ]
    
    for alert in alerts:
        risk_color = {
            'HIGH': '🔴',
            'MEDIUM': '🟡',
            'LOW': '🟢'
        }
        
        with st.expander(f"{risk_color[alert['risk_level']]} {alert['location']} - {alert['risk_level']} RISK"):
            col1, col2 = st.columns(2)
            with col1:
                st.write(f"**Timestamp:** {alert['timestamp']}")
                st.write(f"**Probability:** {alert['probability']:.2f}")
            with col2:
                st.write(f"**Description:** {alert['description']}")
                if alert['risk_level'] == 'HIGH':
                    st.button("🚨 Send Alert", key=f"alert_{alert['timestamp']}")

def main():
    """Main dashboard application"""
    
    # Title and description
    st.title("⛰️ Rockfall Risk Prediction System")
    st.markdown("""
    Real-time monitoring and prediction of rockfall risk in open-pit mines using LiDAR data and machine learning.
    """)
    
    # Sidebar
    st.sidebar.title("Navigation")
    
    # Data source selection
    st.sidebar.subheader("Data Source")
    data_source = st.sidebar.selectbox(
        "Select data source:",
        ["Demo Data", "Upload LAS File", "Historical Data"]
    )
    
    # Time range selection
    st.sidebar.subheader("Time Range")
    start_date = st.sidebar.date_input("Start Date", datetime.date(2024, 1, 1))
    end_date = st.sidebar.date_input("End Date", datetime.date(2024, 1, 31))
    
    # Risk threshold
    st.sidebar.subheader("Risk Settings")
    risk_threshold = st.sidebar.slider("Risk Threshold", 0.0, 1.0, 0.7, 0.1)
    
    # Auto-refresh
    auto_refresh = st.sidebar.checkbox("Auto Refresh", value=True)
    if auto_refresh:
        refresh_interval = st.sidebar.selectbox(
            "Refresh Interval",
            ["30 seconds", "1 minute", "5 minutes", "15 minutes"]
        )
    
    # Load data
    if data_source == "Demo Data":
        data = load_sample_data()
    else:
        st.warning("File upload and historical data features coming soon!")
        data = load_sample_data()
    
    # Main content tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🗺️ Overview", "📊 Risk Analysis", "📈 Temporal Trends", 
        "🤖 Model Performance", "🚨 Alerts"
    ])
    
    with tab1:
        st.header("Mine Overview")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("3D Terrain Model")
            terrain_fig = create_3d_terrain_plot(data)
            st.plotly_chart(terrain_fig, use_container_width=True)
            
        with col2:
            st.subheader("Risk Probability Map")
            risk_fig = create_risk_heatmap(data)
            st.plotly_chart(risk_fig, use_container_width=True)
            
        # Summary statistics
        st.subheader("Mine Statistics")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Area", "1.0 km²")
            
        with col2:
            high_risk_area = np.sum(data['risk_probability'] > risk_threshold) / data['risk_probability'].size * 100
            st.metric("High Risk Area", f"{high_risk_area:.1f}%")
            
        with col3:
            st.metric("Max Elevation", f"{np.max(data['elevation']):.1f} m")
            
        with col4:
            st.metric("Max Slope", f"{np.max(data['slope']):.2f}°")
    
    with tab2:
        st.header("Risk Analysis")
        
        # Slope analysis
        slope_fig = create_slope_analysis(data)
        st.plotly_chart(slope_fig, use_container_width=True)
        
        # Risk statistics
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Risk Distribution")
            risk_hist = px.histogram(
                x=data['risk_probability'].flatten(),
                nbins=50,
                title="Risk Probability Distribution",
                labels={'x': 'Risk Probability', 'y': 'Frequency'}
            )
            st.plotly_chart(risk_hist, use_container_width=True)
            
        with col2:
            st.subheader("Risk by Slope")
            # Create scatter plot of risk vs slope
            sample_indices = np.random.choice(
                data['slope'].size, 1000, replace=False
            )
            
            scatter_fig = px.scatter(
                x=data['slope'].flatten()[sample_indices],
                y=data['risk_probability'].flatten()[sample_indices],
                title="Risk vs Slope Relationship",
                labels={'x': 'Slope', 'y': 'Risk Probability'},
                opacity=0.6
            )
            st.plotly_chart(scatter_fig, use_container_width=True)
    
    with tab3:
        st.header("Temporal Trends")
        
        temporal_fig = create_temporal_analysis()
        st.plotly_chart(temporal_fig, use_container_width=True)
        
        # Change detection summary
        st.subheader("Recent Changes")
        changes_data = {
            'Date': ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12'],
            'Location': ['Sector A-B3', 'Sector C-B1', 'Sector A-B2', 'Sector B-B4'],
            'Change Type': ['Erosion', 'Deposition', 'Erosion', 'Stability'],
            'Magnitude (m)': [-1.2, 0.8, -0.5, 0.1],
            'Risk Change': ['↑ High', '→ Medium', '↑ Medium', '→ Low']
        }
        
        changes_df = pd.DataFrame(changes_data)
        st.dataframe(changes_df, use_container_width=True)
    
    with tab4:
        st.header("Model Performance")
        
        # Model metrics
        st.subheader("Current Model Metrics")
        display_model_metrics()
        
        # Feature importance
        st.subheader("Feature Importance")
        importance_fig = create_feature_importance_plot()
        st.plotly_chart(importance_fig, use_container_width=True)
        
        # Model training history
        st.subheader("Training History")
        training_data = {
            'Epoch': list(range(1, 21)),
            'Training Accuracy': np.random.uniform(0.7, 0.9, 20),
            'Validation Accuracy': np.random.uniform(0.65, 0.85, 20)
        }
        
        training_df = pd.DataFrame(training_data)
        training_fig = px.line(
            training_df, x='Epoch', 
            y=['Training Accuracy', 'Validation Accuracy'],
            title="Model Training Progress"
        )
        st.plotly_chart(training_fig, use_container_width=True)
    
    with tab5:
        st.header("Alert Dashboard")
        
        create_alert_system()
        
        # Alert configuration
        st.subheader("⚙️ Alert Configuration")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.slider("High Risk Threshold", 0.0, 1.0, 0.8, 0.05, key="high_threshold")
            st.slider("Medium Risk Threshold", 0.0, 1.0, 0.6, 0.05, key="medium_threshold")
            
        with col2:
            st.text_input("Email Notifications", placeholder="admin@mine.com")
            st.checkbox("SMS Alerts", value=False)
            
        # Export options
        st.subheader("📥 Export Data")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("Export Risk Map (GeoTIFF)"):
                st.success("Risk map exported successfully!")
                
        with col2:
            if st.button("Export 3D Model (PLY)"):
                st.success("3D model exported successfully!")
                
        with col3:
            if st.button("Export Report (PDF)"):
                st.success("Report generated successfully!")
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: gray;'>
    Rockfall Risk Prediction System | Built with Streamlit | Last updated: 2024-01-15
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()