"""
Advanced Risk Analytics System for Mining Operations

Sophisticated risk assessment with multi-factor analysis, weather integration,
automated alert systems, and real-time risk monitoring.
"""

import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import sqlite3

# Try to import optional dependencies
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False

try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

class RiskLevel(Enum):
    """Risk assessment levels"""
    MINIMAL = (0, "Minimal", "green")
    LOW = (1, "Low", "blue") 
    MODERATE = (2, "Moderate", "yellow")
    HIGH = (3, "High", "orange")
    CRITICAL = (4, "Critical", "red")
    EXTREME = (5, "Extreme", "darkred")

class AlertType(Enum):
    """Alert types for notifications"""
    EMAIL = "email"
    SMS = "sms"
    DASHBOARD = "dashboard"
    SYSTEM = "system"

@dataclass
class WeatherData:
    """Weather data structure"""
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float
    precipitation: float
    pressure: float
    visibility: float
    timestamp: datetime

@dataclass
class RiskFactor:
    """Individual risk factor"""
    name: str
    value: float
    weight: float
    description: str
    category: str

@dataclass
class RiskAssessment:
    """Complete risk assessment"""
    assessment_id: str
    site_location: str
    assessment_time: datetime
    geological_risk: float
    weather_risk: float
    equipment_risk: float
    human_risk: float
    overall_risk: float
    risk_level: RiskLevel
    confidence: float
    factors: List[RiskFactor]
    recommendations: List[str]
    alerts_triggered: List[str]
    valid_until: datetime

class WeatherService:
    """Weather data integration service"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_current_weather(self, lat: float, lon: float) -> Optional[WeatherData]:
        """Get current weather data for location"""
        if not self.api_key or not REQUESTS_AVAILABLE:
            # Return mock weather data for demo
            return self._get_mock_weather()
            
        try:
            url = f"{self.base_url}/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return WeatherData(
                temperature=data['main']['temp'],
                humidity=data['main']['humidity'],
                wind_speed=data['wind']['speed'],
                wind_direction=data['wind'].get('deg', 0),
                precipitation=data.get('rain', {}).get('1h', 0),
                pressure=data['main']['pressure'],
                visibility=data.get('visibility', 10000) / 1000,  # Convert to km
                timestamp=datetime.now()
            )
            
        except Exception as e:
            st.warning(f"Weather service error: {str(e)}. Using mock data.")
            return self._get_mock_weather()
            
    def _get_mock_weather(self) -> WeatherData:
        """Generate mock weather data for demonstration"""
        np.random.seed(int(datetime.now().timestamp()) % 1000)
        
        return WeatherData(
            temperature=np.random.uniform(15, 35),
            humidity=np.random.uniform(30, 90),
            wind_speed=np.random.uniform(0, 25),
            wind_direction=np.random.uniform(0, 360),
            precipitation=np.random.exponential(0.5),
            pressure=np.random.uniform(980, 1030),
            visibility=np.random.uniform(5, 20),
            timestamp=datetime.now()
        )
        
    def get_weather_forecast(self, lat: float, lon: float, days: int = 5) -> List[WeatherData]:
        """Get weather forecast for location"""
        # For demo, generate mock forecast
        forecast = []
        for i in range(days):
            weather = self._get_mock_weather()
            weather.timestamp = datetime.now() + timedelta(days=i)
            forecast.append(weather)
        return forecast

class AdvancedRiskAnalyzer:
    """Advanced risk analysis with multi-factor assessment"""
    
    def __init__(self, db_path: str = "data/risk_analytics.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.weather_service = WeatherService()
        self.init_database()
        
        # Risk factor weights (can be customized)
        self.factor_weights = {
            'geological': {
                'slope_angle': 0.25,
                'rock_quality': 0.30,
                'discontinuity_density': 0.20,
                'weathering_degree': 0.15,
                'water_presence': 0.10
            },
            'weather': {
                'precipitation': 0.35,
                'temperature_change': 0.15,
                'wind_speed': 0.20,
                'humidity': 0.10,
                'pressure_change': 0.20
            },
            'equipment': {
                'vibration_level': 0.40,
                'proximity_to_slope': 0.30,
                'equipment_weight': 0.20,
                'operation_duration': 0.10
            },
            'human': {
                'personnel_exposure': 0.50,
                'safety_compliance': 0.30,
                'experience_level': 0.20
            }
        }
        
    def init_database(self):
        """Initialize risk analytics database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_assessments (
                assessment_id TEXT PRIMARY KEY,
                site_location TEXT NOT NULL,
                assessment_time TEXT NOT NULL,
                geological_risk REAL,
                weather_risk REAL,
                equipment_risk REAL,
                human_risk REAL,
                overall_risk REAL,
                risk_level TEXT,
                confidence REAL,
                factors TEXT,
                recommendations TEXT,
                alerts_triggered TEXT,
                valid_until TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT,
                timestamp TEXT,
                temperature REAL,
                humidity REAL,
                wind_speed REAL,
                wind_direction REAL,
                precipitation REAL,
                pressure REAL,
                visibility REAL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alert_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assessment_id TEXT,
                alert_type TEXT,
                alert_level TEXT,
                message TEXT,
                timestamp TEXT,
                acknowledged BOOLEAN DEFAULT FALSE
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def assess_geological_risk(self, lidar_features: Dict[str, Any]) -> Tuple[float, List[RiskFactor]]:
        """Assess geological risk factors"""
        factors = []
        
        # Slope angle analysis
        slope_angle = lidar_features.get('slope_stability', 0.5) * 90  # Convert to degrees
        slope_risk = min(1.0, slope_angle / 60.0)  # Normalize to 60 degrees max
        factors.append(RiskFactor(
            name="Slope Angle",
            value=slope_risk,
            weight=self.factor_weights['geological']['slope_angle'],
            description=f"Slope angle: {slope_angle:.1f}°",
            category="geological"
        ))
        
        # Rock quality
        rock_quality = lidar_features.get('surface_roughness', 0.5)
        rock_risk = 1.0 - rock_quality  # Higher roughness = better quality = lower risk
        factors.append(RiskFactor(
            name="Rock Quality",
            value=rock_risk,
            weight=self.factor_weights['geological']['rock_quality'],
            description=f"Rock quality index: {rock_quality:.2f}",
            category="geological"
        ))
        
        # Discontinuity density (estimated from feature variation)
        discontinuity = lidar_features.get('local_variance', 0.3)
        factors.append(RiskFactor(
            name="Discontinuity Density",
            value=discontinuity,
            weight=self.factor_weights['geological']['discontinuity_density'],
            description=f"Discontinuity index: {discontinuity:.2f}",
            category="geological"
        ))
        
        # Weathering degree (estimated from elevation variance)
        weathering = min(1.0, lidar_features.get('elevation_variance', 0.2) * 2)
        factors.append(RiskFactor(
            name="Weathering Degree",
            value=weathering,
            weight=self.factor_weights['geological']['weathering_degree'],
            description=f"Weathering index: {weathering:.2f}",
            category="geological"
        ))
        
        # Water presence (mock data - would need additional sensors)
        water_presence = np.random.uniform(0.1, 0.4)
        factors.append(RiskFactor(
            name="Water Presence",
            value=water_presence,
            weight=self.factor_weights['geological']['water_presence'],
            description=f"Water presence index: {water_presence:.2f}",
            category="geological"
        ))
        
        # Calculate weighted geological risk
        geological_risk = sum(f.value * f.weight for f in factors)
        
        return geological_risk, factors
        
    def assess_weather_risk(self, weather: WeatherData, historical_weather: List[WeatherData] = None) -> Tuple[float, List[RiskFactor]]:
        """Assess weather-related risk factors"""
        factors = []
        
        # Precipitation risk
        precip_risk = min(1.0, weather.precipitation / 10.0)  # Normalize to 10mm/h
        factors.append(RiskFactor(
            name="Precipitation",
            value=precip_risk,
            weight=self.factor_weights['weather']['precipitation'],
            description=f"Current precipitation: {weather.precipitation:.1f} mm/h",
            category="weather"
        ))
        
        # Temperature change risk (if historical data available)
        if historical_weather and len(historical_weather) > 0:
            temp_change = abs(weather.temperature - historical_weather[-1].temperature)
            temp_risk = min(1.0, temp_change / 20.0)  # Normalize to 20°C change
        else:
            temp_risk = 0.1  # Default low risk
            
        factors.append(RiskFactor(
            name="Temperature Change",
            value=temp_risk,
            weight=self.factor_weights['weather']['temperature_change'],
            description=f"Temperature: {weather.temperature:.1f}°C",
            category="weather"
        ))
        
        # Wind speed risk
        wind_risk = min(1.0, weather.wind_speed / 30.0)  # Normalize to 30 m/s
        factors.append(RiskFactor(
            name="Wind Speed",
            value=wind_risk,
            weight=self.factor_weights['weather']['wind_speed'],
            description=f"Wind speed: {weather.wind_speed:.1f} m/s",
            category="weather"
        ))
        
        # Humidity risk (very high or very low humidity)
        humidity_optimal = 50.0
        humidity_risk = abs(weather.humidity - humidity_optimal) / 50.0
        factors.append(RiskFactor(
            name="Humidity",
            value=humidity_risk,
            weight=self.factor_weights['weather']['humidity'],
            description=f"Humidity: {weather.humidity:.1f}%",
            category="weather"
        ))
        
        # Pressure change risk
        pressure_normal = 1013.25
        pressure_risk = abs(weather.pressure - pressure_normal) / 50.0
        factors.append(RiskFactor(
            name="Pressure Change",
            value=min(1.0, pressure_risk),
            weight=self.factor_weights['weather']['pressure_change'],
            description=f"Pressure: {weather.pressure:.1f} hPa",
            category="weather"
        ))
        
        # Calculate weighted weather risk
        weather_risk = sum(f.value * f.weight for f in factors)
        
        return weather_risk, factors
        
    def assess_equipment_risk(self, equipment_data: Dict[str, Any] = None) -> Tuple[float, List[RiskFactor]]:
        """Assess equipment-related risk factors"""
        factors = []
        
        # Mock equipment data if not provided
        if equipment_data is None:
            equipment_data = {
                'vibration_level': np.random.uniform(0.1, 0.8),
                'proximity_to_slope': np.random.uniform(0.2, 0.9),
                'equipment_weight': np.random.uniform(0.3, 0.7),
                'operation_duration': np.random.uniform(0.1, 0.6)
            }
        
        for factor_name, weight_key in [
            ('Vibration Level', 'vibration_level'),
            ('Proximity to Slope', 'proximity_to_slope'),
            ('Equipment Weight', 'equipment_weight'),
            ('Operation Duration', 'operation_duration')
        ]:
            value = equipment_data.get(weight_key, 0.3)
            factors.append(RiskFactor(
                name=factor_name,
                value=value,
                weight=self.factor_weights['equipment'][weight_key],
                description=f"{factor_name}: {value:.2f}",
                category="equipment"
            ))
        
        equipment_risk = sum(f.value * f.weight for f in factors)
        return equipment_risk, factors
        
    def assess_human_risk(self, personnel_data: Dict[str, Any] = None) -> Tuple[float, List[RiskFactor]]:
        """Assess human factors risk"""
        factors = []
        
        # Mock personnel data if not provided
        if personnel_data is None:
            personnel_data = {
                'personnel_exposure': np.random.uniform(0.2, 0.8),
                'safety_compliance': np.random.uniform(0.7, 0.95),
                'experience_level': np.random.uniform(0.6, 0.9)
            }
        
        # Personnel exposure
        exposure = personnel_data.get('personnel_exposure', 0.5)
        factors.append(RiskFactor(
            name="Personnel Exposure",
            value=exposure,
            weight=self.factor_weights['human']['personnel_exposure'],
            description=f"Personnel exposure level: {exposure:.2f}",
            category="human"
        ))
        
        # Safety compliance (inverse risk - higher compliance = lower risk)
        compliance = personnel_data.get('safety_compliance', 0.8)
        compliance_risk = 1.0 - compliance
        factors.append(RiskFactor(
            name="Safety Compliance",
            value=compliance_risk,
            weight=self.factor_weights['human']['safety_compliance'],
            description=f"Safety compliance: {compliance:.1%}",
            category="human"
        ))
        
        # Experience level (inverse risk)
        experience = personnel_data.get('experience_level', 0.7)
        experience_risk = 1.0 - experience
        factors.append(RiskFactor(
            name="Experience Level",
            value=experience_risk,
            weight=self.factor_weights['human']['experience_level'],
            description=f"Team experience: {experience:.1%}",
            category="human"
        ))
        
        human_risk = sum(f.value * f.weight for f in factors)
        return human_risk, factors
        
    def calculate_overall_risk(self, geological_risk: float, weather_risk: float, 
                              equipment_risk: float, human_risk: float) -> Tuple[float, RiskLevel]:
        """Calculate overall risk score and level"""
        # Weighted combination of all risk factors
        weights = {
            'geological': 0.35,
            'weather': 0.25,
            'equipment': 0.25,
            'human': 0.15
        }
        
        overall_risk = (
            geological_risk * weights['geological'] +
            weather_risk * weights['weather'] +
            equipment_risk * weights['equipment'] +
            human_risk * weights['human']
        )
        
        # Determine risk level
        if overall_risk >= 0.9:
            risk_level = RiskLevel.EXTREME
        elif overall_risk >= 0.75:
            risk_level = RiskLevel.CRITICAL
        elif overall_risk >= 0.6:
            risk_level = RiskLevel.HIGH
        elif overall_risk >= 0.4:
            risk_level = RiskLevel.MODERATE
        elif overall_risk >= 0.2:
            risk_level = RiskLevel.LOW
        else:
            risk_level = RiskLevel.MINIMAL
            
        return overall_risk, risk_level
        
    def generate_recommendations(self, assessment: RiskAssessment) -> List[str]:
        """Generate risk-specific recommendations"""
        recommendations = []
        
        # Overall risk recommendations
        if assessment.risk_level in [RiskLevel.EXTREME, RiskLevel.CRITICAL]:
            recommendations.append("IMMEDIATE: Stop all operations and evacuate personnel")
            recommendations.append("Implement emergency response procedures")
            recommendations.append("Conduct detailed stability analysis")
        elif assessment.risk_level == RiskLevel.HIGH:
            recommendations.append("Restrict access to high-risk areas")
            recommendations.append("Increase monitoring frequency to continuous")
            recommendations.append("Deploy additional safety measures")
        elif assessment.risk_level == RiskLevel.MODERATE:
            recommendations.append("Enhanced monitoring required")
            recommendations.append("Review safety protocols")
            recommendations.append("Consider operational modifications")
        
        # Factor-specific recommendations
        high_risk_factors = [f for f in assessment.factors if f.value > 0.7]
        
        for factor in high_risk_factors:
            if factor.category == "geological":
                if factor.name == "Slope Angle":
                    recommendations.append("Consider slope stabilization measures")
                elif factor.name == "Rock Quality":
                    recommendations.append("Implement rock reinforcement")
                elif factor.name == "Water Presence":
                    recommendations.append("Install drainage systems")
                    
            elif factor.category == "weather":
                if factor.name == "Precipitation":
                    recommendations.append("Suspend operations during heavy rainfall")
                elif factor.name == "Wind Speed":
                    recommendations.append("Secure equipment and materials")
                    
            elif factor.category == "equipment":
                if factor.name == "Vibration Level":
                    recommendations.append("Reduce equipment vibration or relocate")
                elif factor.name == "Proximity to Slope":
                    recommendations.append("Maintain safe distance from unstable slopes")
                    
            elif factor.category == "human":
                if factor.name == "Personnel Exposure":
                    recommendations.append("Minimize personnel in risk areas")
                elif factor.name == "Safety Compliance":
                    recommendations.append("Enhance safety training and protocols")
        
        return recommendations
        
    def perform_comprehensive_assessment(self, site_location: str, lat: float, lon: float,
                                       lidar_features: Dict[str, Any],
                                       equipment_data: Dict[str, Any] = None,
                                       personnel_data: Dict[str, Any] = None) -> RiskAssessment:
        """Perform comprehensive risk assessment"""
        
        assessment_id = f"RISK_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Get current weather
        weather = self.weather_service.get_current_weather(lat, lon)
        
        # Assess individual risk categories
        geological_risk, geo_factors = self.assess_geological_risk(lidar_features)
        weather_risk, weather_factors = self.assess_weather_risk(weather)
        equipment_risk, equip_factors = self.assess_equipment_risk(equipment_data)
        human_risk, human_factors = self.assess_human_risk(personnel_data)
        
        # Calculate overall risk
        overall_risk, risk_level = self.calculate_overall_risk(
            geological_risk, weather_risk, equipment_risk, human_risk
        )
        
        # Combine all factors
        all_factors = geo_factors + weather_factors + equip_factors + human_factors
        
        # Create assessment
        assessment = RiskAssessment(
            assessment_id=assessment_id,
            site_location=site_location,
            assessment_time=datetime.now(),
            geological_risk=geological_risk,
            weather_risk=weather_risk,
            equipment_risk=equipment_risk,
            human_risk=human_risk,
            overall_risk=overall_risk,
            risk_level=risk_level,
            confidence=0.85,  # Mock confidence score
            factors=all_factors,
            recommendations=[],
            alerts_triggered=[],
            valid_until=datetime.now() + timedelta(hours=4)  # Valid for 4 hours
        )
        
        # Generate recommendations
        assessment.recommendations = self.generate_recommendations(assessment)
        
        # Check for alerts
        assessment.alerts_triggered = self.check_alerts(assessment)
        
        # Save assessment
        self.save_assessment(assessment)
        
        return assessment
        
    def check_alerts(self, assessment: RiskAssessment) -> List[str]:
        """Check for alert conditions and trigger notifications"""
        alerts = []
        
        if assessment.risk_level in [RiskLevel.EXTREME, RiskLevel.CRITICAL]:
            alerts.append(f"CRITICAL ALERT: {assessment.risk_level.value[1]} risk level detected")
            
        if assessment.overall_risk > 0.8:
            alerts.append(f"HIGH RISK: Overall risk score {assessment.overall_risk:.2f}")
            
        # Factor-specific alerts
        for factor in assessment.factors:
            if factor.value > 0.8:
                alerts.append(f"HIGH {factor.category.upper()}: {factor.name} at {factor.value:.2f}")
        
        # Log alerts
        for alert in alerts:
            self.log_alert(assessment.assessment_id, AlertType.SYSTEM, assessment.risk_level.value[1], alert)
            
        return alerts
        
    def log_alert(self, assessment_id: str, alert_type: AlertType, alert_level: str, message: str):
        """Log alert to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO alert_logs (assessment_id, alert_type, alert_level, message, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (assessment_id, alert_type.value, alert_level, message, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
    def save_assessment(self, assessment: RiskAssessment):
        """Save risk assessment to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO risk_assessments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            assessment.assessment_id,
            assessment.site_location,
            assessment.assessment_time.isoformat(),
            assessment.geological_risk,
            assessment.weather_risk,
            assessment.equipment_risk,
            assessment.human_risk,
            assessment.overall_risk,
            assessment.risk_level.value[1],
            assessment.confidence,
            json.dumps([asdict(f) for f in assessment.factors]),
            json.dumps(assessment.recommendations),
            json.dumps(assessment.alerts_triggered),
            assessment.valid_until.isoformat()
        ))
        
        conn.commit()
        conn.close()

def create_risk_analytics_interface():
    """Create the advanced risk analytics interface"""
    st.title("🎯 Advanced Risk Analytics System")
    st.markdown("*Sophisticated multi-factor risk assessment for mining operations*")
    
    # Initialize risk analyzer
    if 'risk_analyzer' not in st.session_state:
        st.session_state.risk_analyzer = AdvancedRiskAnalyzer()
    
    risk_analyzer = st.session_state.risk_analyzer
    
    # Main tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🔍 Risk Assessment", 
        "📊 Real-time Monitoring", 
        "🌤️ Weather Integration",
        "⚠️ Alert Management",
        "📈 Risk Analytics"
    ])
    
    with tab1:
        st.subheader("Comprehensive Risk Assessment")
        
        # Site information
        col1, col2 = st.columns(2)
        
        with col1:
            site_location = st.text_input("Site Location", "Open Pit Mine - Section A")
            latitude = st.number_input("Latitude", -90.0, 90.0, 40.7128)
            longitude = st.number_input("Longitude", -180.0, 180.0, -74.0060)
            
        with col2:
            # Mock LiDAR features (in real system, these would come from actual analysis)
            st.subheader("LiDAR Analysis Results")
            slope_stability = st.slider("Slope Stability", 0.0, 1.0, 0.6)
            surface_roughness = st.slider("Surface Roughness", 0.0, 1.0, 0.4)
            local_variance = st.slider("Local Variance", 0.0, 1.0, 0.3)
            elevation_variance = st.slider("Elevation Variance", 0.0, 1.0, 0.25)
        
        # Equipment and personnel data
        st.subheader("Operational Parameters")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**Equipment Status**")
            vibration_level = st.slider("Vibration Level", 0.0, 1.0, 0.3)
            proximity_to_slope = st.slider("Proximity to Slope", 0.0, 1.0, 0.4)
            
        with col2:
            st.markdown("**Personnel Factors**")
            personnel_exposure = st.slider("Personnel Exposure", 0.0, 1.0, 0.5)
            safety_compliance = st.slider("Safety Compliance", 0.0, 1.0, 0.85)
        
        if st.button("🎯 Perform Risk Assessment", type="primary"):
            with st.spinner("Analyzing risk factors..."):
                # Prepare data
                lidar_features = {
                    'slope_stability': slope_stability,
                    'surface_roughness': surface_roughness,
                    'local_variance': local_variance,
                    'elevation_variance': elevation_variance
                }
                
                equipment_data = {
                    'vibration_level': vibration_level,
                    'proximity_to_slope': proximity_to_slope,
                    'equipment_weight': 0.5,
                    'operation_duration': 0.4
                }
                
                personnel_data = {
                    'personnel_exposure': personnel_exposure,
                    'safety_compliance': safety_compliance,
                    'experience_level': 0.8
                }
                
                # Perform assessment
                assessment = risk_analyzer.perform_comprehensive_assessment(
                    site_location, latitude, longitude, lidar_features, equipment_data, personnel_data
                )
                
                # Store in session state
                st.session_state.current_assessment = assessment
            
            st.success("Risk assessment completed!")
            
        # Display results if available
        if hasattr(st.session_state, 'current_assessment'):
            assessment = st.session_state.current_assessment
            
            # Overall risk display
            st.subheader("🎯 Risk Assessment Results")
            
            risk_color = assessment.risk_level.value[2]
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric(
                    "Overall Risk", 
                    f"{assessment.overall_risk:.2f}",
                    help="Combined risk score from all factors"
                )
            
            with col2:
                st.markdown(f"**Risk Level:** <span style='color: {risk_color}'>{assessment.risk_level.value[1]}</span>", 
                           unsafe_allow_html=True)
            
            with col3:
                st.metric("Confidence", f"{assessment.confidence:.1%}")
            
            with col4:
                hours_valid = (assessment.valid_until - datetime.now()).total_seconds() / 3600
                st.metric("Valid For", f"{hours_valid:.1f}h")
            
            # Risk breakdown
            st.subheader("📊 Risk Factor Breakdown")
            
            risk_data = {
                'Category': ['Geological', 'Weather', 'Equipment', 'Human'],
                'Risk Score': [
                    assessment.geological_risk,
                    assessment.weather_risk,
                    assessment.equipment_risk,
                    assessment.human_risk
                ],
                'Color': ['red' if r > 0.7 else 'orange' if r > 0.4 else 'green' for r in [
                    assessment.geological_risk, assessment.weather_risk,
                    assessment.equipment_risk, assessment.human_risk
                ]]
            }
            
            fig = px.bar(
                x=risk_data['Category'],
                y=risk_data['Risk Score'],
                color=risk_data['Color'],
                title="Risk Factor Breakdown",
                color_discrete_map={'red': 'red', 'orange': 'orange', 'green': 'green'}
            )
            fig.update_layout(showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
            
            # Detailed factors
            st.subheader("🔍 Detailed Risk Factors")
            
            factor_df = pd.DataFrame([{
                'Factor': f.name,
                'Category': f.category.title(),
                'Value': f.value,
                'Weight': f.weight,
                'Weighted Score': f.value * f.weight,
                'Description': f.description
            } for f in assessment.factors])
            
            st.dataframe(factor_df, use_container_width=True)
            
            # Recommendations
            if assessment.recommendations:
                st.subheader("💡 Recommendations")
                for i, rec in enumerate(assessment.recommendations):
                    if "IMMEDIATE" in rec:
                        st.error(f"{i+1}. {rec}")
                    elif "Enhanced" in rec or "Increase" in rec:
                        st.warning(f"{i+1}. {rec}")
                    else:
                        st.info(f"{i+1}. {rec}")
            
            # Alerts
            if assessment.alerts_triggered:
                st.subheader("⚠️ Active Alerts")
                for alert in assessment.alerts_triggered:
                    if "CRITICAL" in alert:
                        st.error(f"🚨 {alert}")
                    else:
                        st.warning(f"⚠️ {alert}")
    
    with tab2:
        st.subheader("Real-time Risk Monitoring")
        
        # Auto-refresh toggle
        auto_refresh = st.toggle("🔄 Auto-refresh monitoring (10s)", value=False)
        
        if auto_refresh:
            # Auto-refresh every 10 seconds
            time.sleep(10)
            st.rerun()
        
        # Current status display
        if hasattr(st.session_state, 'current_assessment'):
            assessment = st.session_state.current_assessment
            
            # Status indicators
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if assessment.risk_level.value[0] >= 4:
                    st.error("🔴 CRITICAL STATUS")
                elif assessment.risk_level.value[0] >= 3:
                    st.warning("🟡 HIGH RISK")
                else:
                    st.success("🟢 OPERATIONAL")
            
            with col2:
                st.metric("Active Personnel", np.random.randint(5, 15))
            
            with col3:
                st.metric("Equipment Units", np.random.randint(3, 8))
            
            # Real-time risk trend (mock data)
            st.subheader("📈 Risk Trend (Last 24h)")
            
            # Generate mock historical data
            times = pd.date_range(end=datetime.now(), periods=24, freq='H')
            base_risk = assessment.overall_risk
            
            risk_trend = []
            for i, time in enumerate(times):
                # Add some random variation
                variation = np.random.normal(0, 0.05)
                risk_value = max(0, min(1, base_risk + variation))
                risk_trend.append({'Time': time, 'Risk Score': risk_value})
            
            trend_df = pd.DataFrame(risk_trend)
            
            fig = px.line(
                trend_df, 
                x='Time', 
                y='Risk Score',
                title="24-Hour Risk Trend",
                range_y=[0, 1]
            )
            
            # Add risk level thresholds
            fig.add_hline(y=0.2, line_dash="dash", line_color="green", annotation_text="Low Risk")
            fig.add_hline(y=0.4, line_dash="dash", line_color="yellow", annotation_text="Moderate Risk")
            fig.add_hline(y=0.6, line_dash="dash", line_color="orange", annotation_text="High Risk")
            fig.add_hline(y=0.75, line_dash="dash", line_color="red", annotation_text="Critical Risk")
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No active risk assessment. Perform an assessment in the Risk Assessment tab.")
    
    with tab3:
        st.subheader("Weather Integration")
        
        # Current weather display
        if st.button("🌤️ Get Current Weather"):
            with st.spinner("Fetching weather data..."):
                weather = risk_analyzer.weather_service.get_current_weather(40.7128, -74.0060)
                st.session_state.current_weather = weather
        
        if hasattr(st.session_state, 'current_weather'):
            weather = st.session_state.current_weather
            
            st.subheader("Current Weather Conditions")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Temperature", f"{weather.temperature:.1f}°C")
                st.metric("Humidity", f"{weather.humidity:.1f}%")
            
            with col2:
                st.metric("Wind Speed", f"{weather.wind_speed:.1f} m/s")
                st.metric("Wind Direction", f"{weather.wind_direction:.0f}°")
            
            with col3:
                st.metric("Precipitation", f"{weather.precipitation:.1f} mm/h")
                st.metric("Pressure", f"{weather.pressure:.1f} hPa")
            
            with col4:
                st.metric("Visibility", f"{weather.visibility:.1f} km")
                st.metric("Last Update", weather.timestamp.strftime("%H:%M:%S"))
            
            # Weather risk assessment
            weather_risk, weather_factors = risk_analyzer.assess_weather_risk(weather)
            
            st.subheader("Weather Risk Analysis")
            st.metric("Weather Risk Score", f"{weather_risk:.2f}")
            
            # Weather factor breakdown
            weather_df = pd.DataFrame([{
                'Factor': f.name,
                'Risk Value': f.value,
                'Weight': f.weight,
                'Description': f.description
            } for f in weather_factors])
            
            st.dataframe(weather_df, use_container_width=True)
    
    with tab4:
        st.subheader("Alert Management System")
        
        # Alert settings
        st.subheader("⚙️ Alert Configuration")
        
        col1, col2 = st.columns(2)
        
        with col1:
            email_alerts = st.checkbox("📧 Email Alerts", value=True)
            sms_alerts = st.checkbox("📱 SMS Alerts", value=False)
            
        with col2:
            critical_threshold = st.slider("Critical Alert Threshold", 0.0, 1.0, 0.75)
            high_threshold = st.slider("High Risk Threshold", 0.0, 1.0, 0.6)
        
        # Recent alerts
        st.subheader("📋 Recent Alerts")
        
        # Mock alert data
        alerts_data = []
        for i in range(5):
            alert_time = datetime.now() - timedelta(hours=i*2)
            alerts_data.append({
                'Time': alert_time.strftime("%Y-%m-%d %H:%M"),
                'Level': np.random.choice(['CRITICAL', 'HIGH', 'MODERATE']),
                'Message': np.random.choice([
                    'High geological risk detected in Section A',
                    'Weather conditions deteriorating',
                    'Equipment vibration levels elevated',
                    'Personnel exposure limits approached'
                ]),
                'Status': np.random.choice(['Active', 'Acknowledged', 'Resolved'])
            })
        
        alerts_df = pd.DataFrame(alerts_data)
        
        # Style the dataframe based on alert level
        def style_alerts(row):
            if row['Level'] == 'CRITICAL':
                return ['background-color: #ffcccc'] * len(row)
            elif row['Level'] == 'HIGH':
                return ['background-color: #ffe6cc'] * len(row)
            else:
                return ['background-color: #ffffcc'] * len(row)
        
        styled_df = alerts_df.style.apply(style_alerts, axis=1)
        st.dataframe(styled_df, use_container_width=True)
    
    with tab5:
        st.subheader("Risk Analytics Dashboard")
        
        # Generate mock historical assessments for analytics
        if st.button("📊 Generate Analytics Report"):
            
            # Mock data for last 30 days
            dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
            analytics_data = []
            
            for date in dates:
                analytics_data.append({
                    'Date': date,
                    'Overall Risk': np.random.uniform(0.2, 0.8),
                    'Geological Risk': np.random.uniform(0.1, 0.7),
                    'Weather Risk': np.random.uniform(0.0, 0.6),
                    'Equipment Risk': np.random.uniform(0.1, 0.5),
                    'Human Risk': np.random.uniform(0.1, 0.4),
                    'Incidents': np.random.poisson(0.1)
                })
            
            analytics_df = pd.DataFrame(analytics_data)
            
            # Risk trends over time
            st.subheader("📈 30-Day Risk Trends")
            
            fig = px.line(
                analytics_df,
                x='Date',
                y=['Overall Risk', 'Geological Risk', 'Weather Risk', 'Equipment Risk', 'Human Risk'],
                title="Risk Trends Over Time"
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Risk distribution
            col1, col2 = st.columns(2)
            
            with col1:
                fig = px.histogram(
                    analytics_df,
                    x='Overall Risk',
                    nbins=10,
                    title="Overall Risk Distribution"
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                correlation_data = analytics_df[['Geological Risk', 'Weather Risk', 'Equipment Risk', 'Human Risk']].corr()
                fig = px.imshow(
                    correlation_data,
                    title="Risk Factor Correlations",
                    color_continuous_scale='RdBu'
                )
                st.plotly_chart(fig, use_container_width=True)
            
            # Summary statistics
            st.subheader("📊 Summary Statistics")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Avg Risk", f"{analytics_df['Overall Risk'].mean():.2f}")
            with col2:
                st.metric("Max Risk", f"{analytics_df['Overall Risk'].max():.2f}")
            with col3:
                st.metric("High Risk Days", len(analytics_df[analytics_df['Overall Risk'] > 0.6]))
            with col4:
                st.metric("Total Incidents", analytics_df['Incidents'].sum())

if __name__ == "__main__":
    create_risk_analytics_interface()