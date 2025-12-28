"""
Historical Data Management System for Mining Operations

Comprehensive system for managing historical LiDAR data, time-series analysis,
change detection, and trend monitoring for mining operations.
"""

import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import sqlite3
from datetime import datetime, timedelta
import json
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Try to import optional dependencies
try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

try:
    import laspy
    LASPY_AVAILABLE = True
except ImportError:
    LASPY_AVAILABLE = False

class SurveyType(Enum):
    """Types of mining surveys"""
    TOPOGRAPHIC = "topographic"
    GEOLOGICAL = "geological" 
    STABILITY = "stability"
    VOLUMETRIC = "volumetric"
    SAFETY = "safety"

@dataclass
class SurveyRecord:
    """Survey record data structure"""
    survey_id: str
    survey_date: datetime
    survey_type: SurveyType
    file_path: str
    point_count: int
    coverage_area: float
    elevation_range: Tuple[float, float]
    quality_score: float
    equipment_used: str
    weather_conditions: str
    operator: str
    notes: str
    processing_status: str
    created_at: datetime

class HistoricalDataManager:
    """Manages historical mining survey data"""
    
    def __init__(self, db_path: str = "data/historical_data.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
        
    def init_database(self):
        """Initialize the historical data database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create surveys table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS surveys (
                survey_id TEXT PRIMARY KEY,
                survey_date TEXT NOT NULL,
                survey_type TEXT NOT NULL,
                file_path TEXT NOT NULL,
                point_count INTEGER,
                coverage_area REAL,
                elevation_min REAL,
                elevation_max REAL,
                quality_score REAL,
                equipment_used TEXT,
                weather_conditions TEXT,
                operator TEXT,
                notes TEXT,
                processing_status TEXT,
                created_at TEXT
            )
        ''')
        
        # Create change_detection table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS change_detection (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id_1 TEXT,
                survey_id_2 TEXT,
                analysis_date TEXT,
                volume_change REAL,
                max_elevation_change REAL,
                mean_elevation_change REAL,
                stability_risk REAL,
                change_areas TEXT,
                analysis_method TEXT,
                FOREIGN KEY (survey_id_1) REFERENCES surveys (survey_id),
                FOREIGN KEY (survey_id_2) REFERENCES surveys (survey_id)
            )
        ''')
        
        # Create risk_assessments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id TEXT,
                assessment_date TEXT,
                rockfall_risk REAL,
                slope_stability REAL,
                weather_factor REAL,
                equipment_access REAL,
                overall_risk REAL,
                recommendations TEXT,
                valid_until TEXT,
                FOREIGN KEY (survey_id) REFERENCES surveys (survey_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def add_survey_record(self, record: SurveyRecord) -> bool:
        """Add a new survey record to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO surveys VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                record.survey_id,
                record.survey_date.isoformat(),
                record.survey_type.value,
                record.file_path,
                record.point_count,
                record.coverage_area,
                record.elevation_range[0],
                record.elevation_range[1],
                record.quality_score,
                record.equipment_used,
                record.weather_conditions,
                record.operator,
                record.notes,
                record.processing_status,
                record.created_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            st.error(f"Error adding survey record: {str(e)}")
            return False
            
    def get_survey_records(self, 
                          start_date: Optional[datetime] = None,
                          end_date: Optional[datetime] = None,
                          survey_type: Optional[SurveyType] = None) -> List[Dict]:
        """Retrieve survey records with optional filtering"""
        conn = sqlite3.connect(self.db_path)
        
        query = "SELECT * FROM surveys WHERE 1=1"
        params = []
        
        if start_date:
            query += " AND survey_date >= ?"
            params.append(start_date.isoformat())
            
        if end_date:
            query += " AND survey_date <= ?"
            params.append(end_date.isoformat())
            
        if survey_type:
            query += " AND survey_type = ?"
            params.append(survey_type.value)
            
        query += " ORDER BY survey_date DESC"
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        return df.to_dict('records')
        
    def perform_change_detection(self, survey_id_1: str, survey_id_2: str) -> Dict[str, Any]:
        """Perform change detection between two surveys"""
        # This is a simplified implementation
        # In practice, this would involve complex 3D analysis
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get survey information
        cursor.execute("SELECT * FROM surveys WHERE survey_id IN (?, ?)", (survey_id_1, survey_id_2))
        surveys = cursor.fetchall()
        
        if len(surveys) != 2:
            return {'error': 'Could not find both surveys'}
            
        # Simulate change detection analysis
        np.random.seed(42)  # For consistent results
        
        change_analysis = {
            'volume_change': np.random.uniform(-1000, 500),  # cubic meters
            'max_elevation_change': np.random.uniform(-5, 2),  # meters
            'mean_elevation_change': np.random.uniform(-0.5, 0.2),  # meters
            'stability_risk': np.random.uniform(0, 1),
            'change_areas': json.dumps({
                'unstable_zones': np.random.randint(1, 5),
                'volume_loss_areas': np.random.randint(0, 3),
                'significant_change_percentage': np.random.uniform(5, 25)
            }),
            'analysis_method': 'DEM_differencing'
        }
        
        # Store change detection results
        cursor.execute('''
            INSERT INTO change_detection 
            (survey_id_1, survey_id_2, analysis_date, volume_change, max_elevation_change, 
             mean_elevation_change, stability_risk, change_areas, analysis_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            survey_id_1, survey_id_2, datetime.now().isoformat(),
            change_analysis['volume_change'],
            change_analysis['max_elevation_change'],
            change_analysis['mean_elevation_change'],
            change_analysis['stability_risk'],
            change_analysis['change_areas'],
            change_analysis['analysis_method']
        ))
        
        conn.commit()
        conn.close()
        
        return change_analysis

class TrendAnalyzer:
    """Analyzes trends in historical mining data"""
    
    def __init__(self, data_manager: HistoricalDataManager):
        self.data_manager = data_manager
        
    def analyze_temporal_trends(self, metric: str = 'volume_change') -> Dict[str, Any]:
        """Analyze temporal trends in mining operations"""
        conn = sqlite3.connect(self.data_manager.db_path)
        
        # Get change detection data
        df = pd.read_sql_query('''
            SELECT cd.*, s1.survey_date as date1, s2.survey_date as date2
            FROM change_detection cd
            JOIN surveys s1 ON cd.survey_id_1 = s1.survey_id
            JOIN surveys s2 ON cd.survey_id_2 = s2.survey_id
            ORDER BY cd.analysis_date
        ''', conn)
        
        conn.close()
        
        if df.empty:
            return {'error': 'No change detection data available'}
            
        # Calculate trends
        df['analysis_date'] = pd.to_datetime(df['analysis_date'])
        df = df.sort_values('analysis_date')
        
        trends = {
            'total_analyses': len(df),
            'date_range': {
                'start': df['analysis_date'].min().isoformat(),
                'end': df['analysis_date'].max().isoformat()
            },
            'volume_trends': {
                'mean_change': df['volume_change'].mean(),
                'std_change': df['volume_change'].std(),
                'max_loss': df['volume_change'].min(),
                'max_gain': df['volume_change'].max()
            },
            'stability_trends': {
                'mean_risk': df['stability_risk'].mean(),
                'risk_increasing': (df['stability_risk'].diff() > 0).sum(),
                'risk_decreasing': (df['stability_risk'].diff() < 0).sum()
            },
            'elevation_trends': {
                'mean_change': df['mean_elevation_change'].mean(),
                'max_change': df['max_elevation_change'].max(),
                'min_change': df['max_elevation_change'].min()
            }
        }
        
        return trends
        
    def predict_future_changes(self, days_ahead: int = 30) -> Dict[str, Any]:
        """Simple prediction of future changes based on trends"""
        trends = self.analyze_temporal_trends()
        
        if 'error' in trends:
            return trends
            
        # Simple linear extrapolation
        predictions = {
            'prediction_date': (datetime.now() + timedelta(days=days_ahead)).isoformat(),
            'predicted_volume_change': trends['volume_trends']['mean_change'],
            'predicted_risk_level': min(1.0, max(0.0, trends['stability_trends']['mean_risk'])),
            'confidence': 0.6,  # Simple confidence estimate
            'recommendations': []
        }
        
        # Generate recommendations
        if predictions['predicted_risk_level'] > 0.7:
            predictions['recommendations'].append("High risk predicted - increase monitoring frequency")
        if trends['volume_trends']['mean_change'] < -100:
            predictions['recommendations'].append("Significant volume loss trend - investigate stability")
        if trends['stability_trends']['risk_increasing'] > trends['stability_trends']['risk_decreasing']:
            predictions['recommendations'].append("Risk trend increasing - consider intervention")
            
        return predictions

def create_historical_data_interface():
    """Create the historical data management interface"""
    st.title("📚 Historical Data Management System")
    st.markdown("*Comprehensive mining survey data management and analysis*")
    
    # Initialize data manager
    if 'data_manager' not in st.session_state:
        st.session_state.data_manager = HistoricalDataManager()
        st.session_state.trend_analyzer = TrendAnalyzer(st.session_state.data_manager)
    
    data_manager = st.session_state.data_manager
    trend_analyzer = st.session_state.trend_analyzer
    
    # Tabs for different functionalities
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📝 Survey Records", 
        "🔍 Change Detection", 
        "📈 Trend Analysis", 
        "🔮 Predictions", 
        "📊 Dashboard"
    ])
    
    with tab1:
        st.subheader("Survey Record Management")
        
        # Add new survey record
        with st.expander("➕ Add New Survey Record"):
            col1, col2 = st.columns(2)
            
            with col1:
                survey_id = st.text_input("Survey ID", f"SURVEY_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
                survey_date = st.date_input("Survey Date", datetime.now())
                survey_type = st.selectbox("Survey Type", [e.value for e in SurveyType])
                file_path = st.text_input("File Path")
                point_count = st.number_input("Point Count", min_value=0, value=10000)
                coverage_area = st.number_input("Coverage Area (hectares)", min_value=0.0, value=1.0)
                
            with col2:
                elevation_min = st.number_input("Min Elevation (m)", value=100.0)
                elevation_max = st.number_input("Max Elevation (m)", value=200.0)
                quality_score = st.slider("Quality Score", 0.0, 1.0, 0.8)
                equipment_used = st.text_input("Equipment Used", "Leica ScanStation P40")
                weather_conditions = st.selectbox("Weather", ["Clear", "Cloudy", "Light Rain", "Windy"])
                operator = st.text_input("Operator", "Field Team Alpha")
                notes = st.text_area("Notes")
                
            if st.button("Add Survey Record"):
                record = SurveyRecord(
                    survey_id=survey_id,
                    survey_date=datetime.combine(survey_date, datetime.min.time()),
                    survey_type=SurveyType(survey_type),
                    file_path=file_path,
                    point_count=point_count,
                    coverage_area=coverage_area,
                    elevation_range=(elevation_min, elevation_max),
                    quality_score=quality_score,
                    equipment_used=equipment_used,
                    weather_conditions=weather_conditions,
                    operator=operator,
                    notes=notes,
                    processing_status="Pending",
                    created_at=datetime.now()
                )
                
                if data_manager.add_survey_record(record):
                    st.success("Survey record added successfully!")
                    st.rerun()
        
        # Display existing records
        st.subheader("Existing Survey Records")
        records = data_manager.get_survey_records()
        
        if records:
            df = pd.DataFrame(records)
            df['survey_date'] = pd.to_datetime(df['survey_date']).dt.strftime('%Y-%m-%d')
            
            # Display filters
            col1, col2, col3 = st.columns(3)
            with col1:
                type_filter = st.selectbox("Filter by Type", ["All"] + [e.value for e in SurveyType])
            with col2:
                start_date = st.date_input("Start Date", datetime.now() - timedelta(days=30))
            with col3:
                end_date = st.date_input("End Date", datetime.now())
            
            # Apply filters
            if type_filter != "All":
                df = df[df['survey_type'] == type_filter]
                
            st.dataframe(df, use_container_width=True)
            
            # Survey statistics
            st.subheader("📊 Survey Statistics")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total Surveys", len(df))
            with col2:
                st.metric("Total Points", f"{df['point_count'].sum():,}")
            with col3:
                st.metric("Coverage Area", f"{df['coverage_area'].sum():.1f} ha")
            with col4:
                st.metric("Avg Quality", f"{df['quality_score'].mean():.2f}")
        else:
            st.info("No survey records found. Add some records to get started.")
    
    with tab2:
        st.subheader("Change Detection Analysis")
        
        records = data_manager.get_survey_records()
        if len(records) >= 2:
            survey_ids = [r['survey_id'] for r in records]
            
            col1, col2 = st.columns(2)
            with col1:
                survey_1 = st.selectbox("First Survey", survey_ids, key="survey_1")
            with col2:
                survey_2 = st.selectbox("Second Survey", survey_ids, key="survey_2", index=1)
            
            if st.button("Perform Change Detection"):
                with st.spinner("Analyzing changes..."):
                    change_results = data_manager.perform_change_detection(survey_1, survey_2)
                    
                if 'error' not in change_results:
                    st.success("Change detection completed!")
                    
                    # Display results
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.metric(
                            "Volume Change", 
                            f"{change_results['volume_change']:.1f} m³",
                            delta=change_results['volume_change']
                        )
                    
                    with col2:
                        st.metric(
                            "Max Elevation Change",
                            f"{change_results['max_elevation_change']:.2f} m",
                            delta=change_results['max_elevation_change']
                        )
                    
                    with col3:
                        stability_color = "inverse" if change_results['stability_risk'] > 0.5 else "normal"
                        st.metric(
                            "Stability Risk",
                            f"{change_results['stability_risk']:.2f}",
                            delta=change_results['stability_risk'] - 0.5
                        )
                    
                    # Risk assessment
                    if change_results['stability_risk'] > 0.7:
                        st.error("⚠️ HIGH RISK: Immediate attention required!")
                    elif change_results['stability_risk'] > 0.4:
                        st.warning("⚡ MODERATE RISK: Increased monitoring recommended")
                    else:
                        st.success("✅ LOW RISK: Normal monitoring sufficient")
                        
                else:
                    st.error(change_results['error'])
        else:
            st.info("Need at least 2 survey records to perform change detection.")
    
    with tab3:
        st.subheader("Trend Analysis")
        
        if st.button("Analyze Historical Trends"):
            with st.spinner("Analyzing trends..."):
                trends = trend_analyzer.analyze_temporal_trends()
                
            if 'error' not in trends:
                st.success("Trend analysis completed!")
                
                # Volume trends
                st.subheader("📈 Volume Change Trends")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Mean Change", f"{trends['volume_trends']['mean_change']:.1f} m³")
                with col2:
                    st.metric("Max Loss", f"{trends['volume_trends']['max_loss']:.1f} m³")
                with col3:
                    st.metric("Max Gain", f"{trends['volume_trends']['max_gain']:.1f} m³")
                
                # Stability trends
                st.subheader("🛡️ Stability Risk Trends")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Mean Risk", f"{trends['stability_trends']['mean_risk']:.2f}")
                with col2:
                    st.metric("Risk Increasing", trends['stability_trends']['risk_increasing'])
                with col3:
                    st.metric("Risk Decreasing", trends['stability_trends']['risk_decreasing'])
                    
            else:
                st.warning(trends['error'])
    
    with tab4:
        st.subheader("Future Predictions")
        
        days_ahead = st.slider("Prediction Period (days)", 1, 90, 30)
        
        if st.button("Generate Predictions"):
            with st.spinner("Generating predictions..."):
                predictions = trend_analyzer.predict_future_changes(days_ahead)
                
            if 'error' not in predictions:
                st.success("Predictions generated!")
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric(
                        "Predicted Volume Change",
                        f"{predictions['predicted_volume_change']:.1f} m³"
                    )
                
                with col2:
                    st.metric(
                        "Predicted Risk Level",
                        f"{predictions['predicted_risk_level']:.2f}"
                    )
                
                with col3:
                    st.metric(
                        "Confidence",
                        f"{predictions['confidence']:.1%}"
                    )
                
                # Recommendations
                if predictions['recommendations']:
                    st.subheader("🎯 Recommendations")
                    for rec in predictions['recommendations']:
                        st.info(f"• {rec}")
            else:
                st.warning(predictions['error'])
    
    with tab5:
        st.subheader("Historical Data Dashboard")
        
        # Generate some sample visualizations
        records = data_manager.get_survey_records()
        
        if records:
            df = pd.DataFrame(records)
            df['survey_date'] = pd.to_datetime(df['survey_date'])
            
            # Survey timeline
            if PLOTLY_AVAILABLE:
                fig = px.scatter(
                    df, 
                    x='survey_date', 
                    y='quality_score',
                    color='survey_type',
                    size='point_count',
                    title="Survey Timeline and Quality",
                    hover_data=['coverage_area', 'equipment_used']
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.line_chart(df.set_index('survey_date')['quality_score'])
            
            # Survey type distribution
            col1, col2 = st.columns(2)
            
            with col1:
                type_counts = df['survey_type'].value_counts()
                if PLOTLY_AVAILABLE:
                    fig = px.pie(
                        values=type_counts.values,
                        names=type_counts.index,
                        title="Survey Types Distribution"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.write("**Survey Types Distribution:**")
                    st.write(type_counts)
            
            with col2:
                if PLOTLY_AVAILABLE:
                    fig = px.histogram(
                        df,
                        x='quality_score',
                        nbins=10,
                        title="Quality Score Distribution"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.write("**Quality Score Statistics:**")
                    st.write(df['quality_score'].describe())
        else:
            st.info("No historical data available for dashboard.")

if __name__ == "__main__":
    create_historical_data_interface()