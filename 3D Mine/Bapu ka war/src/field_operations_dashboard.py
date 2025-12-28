"""
Field Operations Dashboard for Mining Operations

Comprehensive dashboard for real-time monitoring, equipment status, 
team coordination, and field operations management.
"""

import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import sqlite3

# Try to import optional dependencies
try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

try:
    import folium
    from streamlit_folium import st_folium
    FOLIUM_AVAILABLE = True
except ImportError:
    FOLIUM_AVAILABLE = False

class EquipmentStatus(Enum):
    """Equipment operational status"""
    OPERATIONAL = ("operational", "green")
    MAINTENANCE = ("maintenance", "orange") 
    BREAKDOWN = ("breakdown", "red")
    IDLE = ("idle", "gray")

class TeamStatus(Enum):
    """Team operational status"""
    ON_DUTY = ("on_duty", "green")
    OFF_DUTY = ("off_duty", "gray")
    EMERGENCY = ("emergency", "red")
    BREAK = ("break", "orange")

@dataclass
class Equipment:
    """Equipment data structure"""
    equipment_id: str
    name: str
    type: str
    location: tuple  # (lat, lon)
    status: EquipmentStatus
    operator: str
    fuel_level: float
    operating_hours: float
    last_maintenance: datetime
    vibration_level: float
    temperature: float
    speed: float
    heading: float
    last_update: datetime

@dataclass
class TeamMember:
    """Team member data structure"""
    member_id: str
    name: str
    role: str
    location: tuple  # (lat, lon)
    status: TeamStatus
    shift_start: datetime
    last_check_in: datetime
    equipment_assigned: str
    safety_certification: str
    experience_years: int
    emergency_contact: str

@dataclass
class SafetyZone:
    """Safety zone definition"""
    zone_id: str
    name: str
    boundary: List[tuple]  # List of (lat, lon) coordinates
    risk_level: str
    restrictions: List[str]
    monitoring_required: bool
    access_control: bool

class FieldOperationsManager:
    """Manages field operations data and coordination"""
    
    def __init__(self, db_path: str = "data/field_operations.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
        
        # Initialize with mock data
        self.equipment_list = self.load_mock_equipment()
        self.team_members = self.load_mock_team()
        self.safety_zones = self.load_mock_safety_zones()
        
    def init_database(self):
        """Initialize field operations database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Equipment tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS equipment_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipment_id TEXT,
                timestamp TEXT,
                location_lat REAL,
                location_lon REAL,
                status TEXT,
                fuel_level REAL,
                operating_hours REAL,
                vibration_level REAL,
                temperature REAL,
                speed REAL,
                heading REAL
            )
        ''')
        
        # Personnel tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS personnel_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id TEXT,
                timestamp TEXT,
                location_lat REAL,
                location_lon REAL,
                status TEXT,
                check_in_type TEXT,
                notes TEXT
            )
        ''')
        
        # Incidents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id TEXT,
                timestamp TEXT,
                location_lat REAL,
                location_lon REAL,
                incident_type TEXT,
                severity TEXT,
                description TEXT,
                personnel_involved TEXT,
                equipment_involved TEXT,
                status TEXT,
                resolved_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def load_mock_equipment(self) -> List[Equipment]:
        """Load mock equipment data"""
        equipment_types = ["Excavator", "Drill Rig", "Haul Truck", "Loader", "Dozer"]
        base_lat, base_lon = 40.7128, -74.0060
        
        equipment = []
        for i in range(8):
            lat_offset = np.random.uniform(-0.01, 0.01)
            lon_offset = np.random.uniform(-0.01, 0.01)
            
            equipment.append(Equipment(
                equipment_id=f"EQ{i+1:03d}",
                name=f"{np.random.choice(equipment_types)} {i+1}",
                type=np.random.choice(equipment_types),
                location=(base_lat + lat_offset, base_lon + lon_offset),
                status=np.random.choice(list(EquipmentStatus)),
                operator=f"Operator {chr(65+i)}",
                fuel_level=np.random.uniform(20, 100),
                operating_hours=np.random.uniform(1000, 5000),
                last_maintenance=datetime.now() - timedelta(days=np.random.randint(1, 30)),
                vibration_level=np.random.uniform(0.1, 0.8),
                temperature=np.random.uniform(60, 90),
                speed=np.random.uniform(0, 15),
                heading=np.random.uniform(0, 360),
                last_update=datetime.now() - timedelta(minutes=np.random.randint(1, 60))
            ))
            
        return equipment
        
    def load_mock_team(self) -> List[TeamMember]:
        """Load mock team member data"""
        roles = ["Operator", "Supervisor", "Safety Officer", "Maintenance", "Surveyor"]
        base_lat, base_lon = 40.7128, -74.0060
        
        team = []
        for i in range(12):
            lat_offset = np.random.uniform(-0.01, 0.01)
            lon_offset = np.random.uniform(-0.01, 0.01)
            
            team.append(TeamMember(
                member_id=f"TM{i+1:03d}",
                name=f"{np.random.choice(['John', 'Sarah', 'Mike', 'Lisa', 'David', 'Emma'])} {chr(65+i)}",
                role=np.random.choice(roles),
                location=(base_lat + lat_offset, base_lon + lon_offset),
                status=np.random.choice(list(TeamStatus)),
                shift_start=datetime.now() - timedelta(hours=np.random.randint(1, 8)),
                last_check_in=datetime.now() - timedelta(minutes=np.random.randint(5, 60)),
                equipment_assigned=f"EQ{np.random.randint(1, 8):03d}" if np.random.random() > 0.3 else "",
                safety_certification="Level 2",
                experience_years=np.random.randint(1, 15),
                emergency_contact=f"+1-555-{np.random.randint(1000, 9999)}"
            ))
            
        return team
        
    def load_mock_safety_zones(self) -> List[SafetyZone]:
        """Load mock safety zones"""
        base_lat, base_lon = 40.7128, -74.0060
        
        zones = []
        zone_configs = [
            ("High Risk Zone A", "high", ["Hard hat required", "Safety escort needed"], True, True),
            ("Restricted Area B", "critical", ["Supervisor approval required", "Emergency equipment"], True, True),
            ("Work Zone C", "medium", ["PPE required"], False, False),
            ("Safe Zone D", "low", ["Standard safety protocols"], False, False)
        ]
        
        for i, (name, risk, restrictions, monitoring, access) in enumerate(zone_configs):
            # Create rectangular boundary
            lat_offset = i * 0.005
            lon_offset = i * 0.005
            
            boundary = [
                (base_lat + lat_offset, base_lon + lon_offset),
                (base_lat + lat_offset + 0.003, base_lon + lon_offset),
                (base_lat + lat_offset + 0.003, base_lon + lon_offset + 0.003),
                (base_lat + lat_offset, base_lon + lon_offset + 0.003)
            ]
            
            zones.append(SafetyZone(
                zone_id=f"ZONE{i+1}",
                name=name,
                boundary=boundary,
                risk_level=risk,
                restrictions=restrictions,
                monitoring_required=monitoring,
                access_control=access
            ))
            
        return zones
        
    def update_equipment_status(self, equipment_id: str, status: EquipmentStatus, location: tuple = None):
        """Update equipment status and location"""
        for equipment in self.equipment_list:
            if equipment.equipment_id == equipment_id:
                equipment.status = status
                if location:
                    equipment.location = location
                equipment.last_update = datetime.now()
                break
                
    def update_team_status(self, member_id: str, status: TeamStatus, location: tuple = None):
        """Update team member status and location"""
        for member in self.team_members:
            if member.member_id == member_id:
                member.status = status
                if location:
                    member.location = location
                member.last_check_in = datetime.now()
                break
                
    def get_operational_summary(self) -> Dict[str, Any]:
        """Get operational summary statistics"""
        # Equipment summary
        equipment_by_status = {}
        for status in EquipmentStatus:
            count = sum(1 for eq in self.equipment_list if eq.status == status)
            equipment_by_status[status.value[0]] = count
            
        # Team summary
        team_by_status = {}
        for status in TeamStatus:
            count = sum(1 for member in self.team_members if member.status == status)
            team_by_status[status.value[0]] = count
            
        # Calculate operational metrics
        operational_equipment = sum(1 for eq in self.equipment_list if eq.status == EquipmentStatus.OPERATIONAL)
        total_equipment = len(self.equipment_list)
        equipment_efficiency = operational_equipment / total_equipment if total_equipment > 0 else 0
        
        active_personnel = sum(1 for member in self.team_members if member.status == TeamStatus.ON_DUTY)
        total_personnel = len(self.team_members)
        
        return {
            'equipment_by_status': equipment_by_status,
            'team_by_status': team_by_status,
            'equipment_efficiency': equipment_efficiency,
            'active_personnel': active_personnel,
            'total_personnel': total_personnel,
            'total_equipment': total_equipment
        }

def create_field_operations_dashboard():
    """Create the comprehensive field operations dashboard"""
    st.title("🏗️ Field Operations Dashboard")
    st.markdown("*Real-time monitoring and coordination for mining operations*")
    
    # Initialize field operations manager
    if 'field_ops_manager' not in st.session_state:
        st.session_state.field_ops_manager = FieldOperationsManager()
    
    field_ops = st.session_state.field_ops_manager
    
    # Get operational summary
    summary = field_ops.get_operational_summary()
    
    # Top-level metrics
    st.subheader("📊 Operational Overview")
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric(
            "Equipment Efficiency", 
            f"{summary['equipment_efficiency']:.1%}",
            delta=f"{summary['equipment_by_status']['operational']} operational"
        )
    
    with col2:
        st.metric(
            "Active Personnel",
            summary['active_personnel'],
            delta=f"of {summary['total_personnel']} total"
        )
    
    with col3:
        st.metric(
            "Safety Incidents",
            np.random.randint(0, 3),
            delta=-1 if np.random.random() > 0.5 else 0
        )
    
    with col4:
        st.metric(
            "Production Target",
            f"{np.random.randint(75, 95)}%",
            delta=np.random.randint(-5, 10)
        )
    
    with col5:
        current_shift = "Day" if 6 <= datetime.now().hour < 18 else "Night"
        st.metric(
            "Current Shift",
            current_shift,
            delta=f"{datetime.now().strftime('%H:%M')}"
        )
    
    # Main dashboard tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🗺️ Live Map", 
        "🚜 Equipment", 
        "👥 Personnel", 
        "🛡️ Safety Zones",
        "📱 Communications",
        "📈 Analytics"
    ])
    
    with tab1:
        st.subheader("Live Operations Map")
        
        if FOLIUM_AVAILABLE:
            # Create folium map
            base_lat, base_lon = 40.7128, -74.0060
            m = folium.Map(location=[base_lat, base_lon], zoom_start=15)
            
            # Add equipment markers
            for equipment in field_ops.equipment_list:
                color = equipment.status.value[1]
                popup_text = f"""
                <b>{equipment.name}</b><br>
                Status: {equipment.status.value[0].title()}<br>
                Operator: {equipment.operator}<br>
                Fuel: {equipment.fuel_level:.1f}%<br>
                Last Update: {equipment.last_update.strftime('%H:%M:%S')}
                """
                
                folium.Marker(
                    equipment.location,
                    popup=popup_text,
                    tooltip=equipment.name,
                    icon=folium.Icon(color=color, icon='cogs', prefix='fa')
                ).add_to(m)
            
            # Add personnel markers
            for member in field_ops.team_members:
                color = member.status.value[1]
                popup_text = f"""
                <b>{member.name}</b><br>
                Role: {member.role}<br>
                Status: {member.status.value[0].title()}<br>
                Equipment: {member.equipment_assigned or 'None'}<br>
                Last Check-in: {member.last_check_in.strftime('%H:%M:%S')}
                """
                
                folium.Marker(
                    member.location,
                    popup=popup_text,
                    tooltip=member.name,
                    icon=folium.Icon(color=color, icon='user', prefix='fa')
                ).add_to(m)
            
            # Add safety zones
            for zone in field_ops.safety_zones:
                zone_color = {
                    'low': 'green',
                    'medium': 'orange', 
                    'high': 'red',
                    'critical': 'darkred'
                }.get(zone.risk_level, 'blue')
                
                folium.Polygon(
                    zone.boundary,
                    popup=f"<b>{zone.name}</b><br>Risk: {zone.risk_level.title()}",
                    tooltip=zone.name,
                    color=zone_color,
                    fillColor=zone_color,
                    fillOpacity=0.2
                ).add_to(m)
            
            # Display map
            map_data = st_folium(m, width=700, height=500)
        else:
            # Fallback map display
            st.info("🗺️ Interactive map not available - Folium not installed")
            
            # Show equipment and personnel locations in tables
            st.subheader("📍 Equipment Locations")
            equipment_locations = pd.DataFrame([
                {
                    'Name': eq.name,
                    'Status': eq.status.value[0].title(),
                    'Operator': eq.operator,
                    'Lat': eq.location[0],
                    'Lon': eq.location[1],
                    'Fuel': f"{eq.fuel_level:.1f}%"
                } for eq in field_ops.equipment_list
            ])
            st.dataframe(equipment_locations, use_container_width=True)
            
            st.subheader("👥 Personnel Locations")  
            personnel_locations = pd.DataFrame([
                {
                    'Name': member.name,
                    'Role': member.role,
                    'Status': member.status.value[0].title(),
                    'Lat': member.location[0],
                    'Lon': member.location[1]
                } for member in field_ops.team_members
            ])
            st.dataframe(personnel_locations, use_container_width=True)
        
        # Map controls
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("📍 Center on Equipment"):
                st.rerun()
        
        with col2:
            if st.button("👥 Center on Personnel"):
                st.rerun()
        
        with col3:
            auto_refresh_map = st.toggle("🔄 Auto-refresh map (30s)", value=False)
            
        if auto_refresh_map:
            import time
            time.sleep(30)
            st.rerun()
    
    with tab2:
        st.subheader("Equipment Status & Management")
        
        # Equipment status overview
        col1, col2, col3, col4 = st.columns(4)
        
        status_counts = summary['equipment_by_status']
        
        with col1:
            st.metric("Operational", status_counts.get('operational', 0), delta_color="normal")
        with col2:
            st.metric("Maintenance", status_counts.get('maintenance', 0), delta_color="off")
        with col3:
            st.metric("Breakdown", status_counts.get('breakdown', 0), delta_color="inverse")
        with col4:
            st.metric("Idle", status_counts.get('idle', 0), delta_color="off")
        
        # Equipment details table
        st.subheader("📋 Equipment Details")
        
        equipment_data = []
        for eq in field_ops.equipment_list:
            equipment_data.append({
                'ID': eq.equipment_id,
                'Name': eq.name,
                'Type': eq.type,
                'Status': eq.status.value[0].title(),
                'Operator': eq.operator,
                'Fuel %': f"{eq.fuel_level:.1f}",
                'Hours': f"{eq.operating_hours:.0f}",
                'Vibration': f"{eq.vibration_level:.2f}",
                'Temp °C': f"{eq.temperature:.1f}",
                'Speed km/h': f"{eq.speed:.1f}",
                'Last Update': eq.last_update.strftime('%H:%M:%S')
            })
        
        equipment_df = pd.DataFrame(equipment_data)
        
        # Color code by status
        def highlight_status(row):
            if row['Status'] == 'Operational':
                return ['background-color: #d4edda'] * len(row)
            elif row['Status'] == 'Breakdown':
                return ['background-color: #f8d7da'] * len(row)
            elif row['Status'] == 'Maintenance':
                return ['background-color: #fff3cd'] * len(row)
            else:
                return ['background-color: #e2e3e5'] * len(row)
        
        styled_equipment_df = equipment_df.style.apply(highlight_status, axis=1)
        st.dataframe(styled_equipment_df, use_container_width=True)
        
        # Equipment performance charts
        st.subheader("📊 Equipment Performance")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Fuel levels chart
            fuel_data = pd.DataFrame([
                {'Equipment': eq.name, 'Fuel Level': eq.fuel_level} 
                for eq in field_ops.equipment_list
            ])
            
            if PLOTLY_AVAILABLE:
                fig = px.bar(
                    fuel_data,
                    x='Equipment',
                    y='Fuel Level',
                    title="Fuel Levels",
                    color='Fuel Level',
                    color_continuous_scale=['red', 'yellow', 'green']
                )
                fig.update_xaxes(title_text="Equipment")
                fig.update_yaxes(title_text="Fuel Level (%)")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.bar_chart(fuel_data.set_index('Equipment')['Fuel Level'])
        
        with col2:
            # Operating hours chart
            hours_data = pd.DataFrame([
                {'Equipment': eq.name, 'Operating Hours': eq.operating_hours} 
                for eq in field_ops.equipment_list
            ])
            
            if PLOTLY_AVAILABLE:
                fig = px.bar(
                    hours_data,
                    x='Equipment',
                    y='Operating Hours',
                    title="Operating Hours",
                    color='Operating Hours',
                    color_continuous_scale='Blues'
                )
                fig.update_xaxes(title_text="Equipment")
                fig.update_yaxes(title_text="Operating Hours")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.bar_chart(hours_data.set_index('Equipment')['Operating Hours'])
        
        # Equipment alerts
        st.subheader("⚠️ Equipment Alerts")
        
        alerts = []
        for eq in field_ops.equipment_list:
            if eq.fuel_level < 25:
                alerts.append(f"🔴 {eq.name}: Low fuel ({eq.fuel_level:.1f}%)")
            if eq.vibration_level > 0.6:
                alerts.append(f"🟡 {eq.name}: High vibration ({eq.vibration_level:.2f})")
            if eq.temperature > 85:
                alerts.append(f"🟠 {eq.name}: High temperature ({eq.temperature:.1f}°C)")
            if eq.status == EquipmentStatus.BREAKDOWN:
                alerts.append(f"🔴 {eq.name}: Equipment breakdown")
        
        if alerts:
            for alert in alerts:
                if "🔴" in alert:
                    st.error(alert)
                elif "🟡" in alert or "🟠" in alert:
                    st.warning(alert)
                else:
                    st.info(alert)
        else:
            st.success("✅ All equipment operating within normal parameters")
    
    with tab3:
        st.subheader("Personnel Management & Safety")
        
        # Personnel status overview
        col1, col2, col3, col4 = st.columns(4)
        
        team_counts = summary['team_by_status']
        
        with col1:
            st.metric("On Duty", team_counts.get('on_duty', 0), delta_color="normal")
        with col2:
            st.metric("Off Duty", team_counts.get('off_duty', 0), delta_color="off")
        with col3:
            st.metric("On Break", team_counts.get('break', 0), delta_color="off")
        with col4:
            st.metric("Emergency", team_counts.get('emergency', 0), delta_color="inverse")
        
        # Personnel details table
        st.subheader("👥 Team Status")
        
        personnel_data = []
        for member in field_ops.team_members:
            personnel_data.append({
                'ID': member.member_id,
                'Name': member.name,
                'Role': member.role,
                'Status': member.status.value[0].replace('_', ' ').title(),
                'Equipment': member.equipment_assigned or 'None',
                'Experience': f"{member.experience_years} years",
                'Shift Start': member.shift_start.strftime('%H:%M'),
                'Last Check-in': member.last_check_in.strftime('%H:%M:%S'),
                'Location': f"{member.location[0]:.4f}, {member.location[1]:.4f}"
            })
        
        personnel_df = pd.DataFrame(personnel_data)
        
        # Color code by status
        def highlight_personnel_status(row):
            if row['Status'] == 'On Duty':
                return ['background-color: #d4edda'] * len(row)
            elif row['Status'] == 'Emergency':
                return ['background-color: #f8d7da'] * len(row)
            elif row['Status'] == 'Break':
                return ['background-color: #fff3cd'] * len(row)
            else:
                return ['background-color: #e2e3e5'] * len(row)
        
        styled_personnel_df = personnel_df.style.apply(highlight_personnel_status, axis=1)
        st.dataframe(styled_personnel_df, use_container_width=True)
        
        # Personnel analytics
        st.subheader("📊 Personnel Analytics")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Role distribution
            role_counts = pd.DataFrame([
                {'Role': member.role, 'Count': 1} 
                for member in field_ops.team_members
            ]).groupby('Role').sum().reset_index()
            
            if PLOTLY_AVAILABLE:
                fig = px.pie(
                    role_counts,
                    values='Count',
                    names='Role',
                    title="Team Composition by Role"
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.write("**Team Composition by Role:**")
                st.write(role_counts)
        
        with col2:
            # Experience distribution
            experience_data = pd.DataFrame([
                {'Name': member.name, 'Experience': member.experience_years} 
                for member in field_ops.team_members
            ])
            
            if PLOTLY_AVAILABLE:
                fig = px.histogram(
                    experience_data,
                    x='Experience',
                    nbins=10,
                    title="Experience Distribution",
                    labels={'Experience': 'Years of Experience', 'count': 'Number of Personnel'}
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.write("**Experience Statistics:**")
                st.write(experience_data['Experience'].describe())
        
        # Check-in system
        st.subheader("📱 Personnel Check-in System")
        
        col1, col2 = st.columns(2)
        
        with col1:
            selected_member = st.selectbox(
                "Select Team Member",
                [f"{member.name} ({member.member_id})" for member in field_ops.team_members]
            )
            
            new_status = st.selectbox(
                "Update Status",
                ["on_duty", "off_duty", "break", "emergency"]
            )
        
        with col2:
            check_in_notes = st.text_area("Check-in Notes", height=100)
            
            if st.button("✅ Update Status", type="primary"):
                # Update the member status
                member_id = selected_member.split('(')[1].split(')')[0]
                field_ops.update_team_status(member_id, TeamStatus(new_status))
                st.success(f"Status updated for {selected_member.split('(')[0].strip()}")
                st.rerun()
    
    with tab4:
        st.subheader("Safety Zones & Risk Management")
        
        # Safety zone overview
        zone_summary = {}
        for zone in field_ops.safety_zones:
            zone_summary[zone.risk_level] = zone_summary.get(zone.risk_level, 0) + 1
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Low Risk Zones", zone_summary.get('low', 0))
        with col2:
            st.metric("Medium Risk Zones", zone_summary.get('medium', 0))
        with col3:
            st.metric("High Risk Zones", zone_summary.get('high', 0))
        with col4:
            st.metric("Critical Zones", zone_summary.get('critical', 0))
        
        # Safety zones details
        st.subheader("🛡️ Safety Zone Details")
        
        for zone in field_ops.safety_zones:
            with st.expander(f"{zone.name} - {zone.risk_level.title()} Risk"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Zone ID:** {zone.zone_id}")
                    st.write(f"**Risk Level:** {zone.risk_level.title()}")
                    st.write(f"**Monitoring Required:** {'Yes' if zone.monitoring_required else 'No'}")
                    st.write(f"**Access Control:** {'Yes' if zone.access_control else 'No'}")
                
                with col2:
                    st.write("**Restrictions:**")
                    for restriction in zone.restrictions:
                        st.write(f"• {restriction}")
                
                # Check personnel and equipment in zone
                personnel_in_zone = []
                equipment_in_zone = []
                
                # Simple point-in-polygon check (simplified for demo)
                for member in field_ops.team_members:
                    # Check if member is roughly in zone area
                    if (zone.boundary[0][0] <= member.location[0] <= zone.boundary[2][0] and
                        zone.boundary[0][1] <= member.location[1] <= zone.boundary[2][1]):
                        personnel_in_zone.append(member.name)
                
                for equipment in field_ops.equipment_list:
                    if (zone.boundary[0][0] <= equipment.location[0] <= zone.boundary[2][0] and
                        zone.boundary[0][1] <= equipment.location[1] <= zone.boundary[2][1]):
                        equipment_in_zone.append(equipment.name)
                
                if personnel_in_zone or equipment_in_zone:
                    st.write("**Currently in Zone:**")
                    if personnel_in_zone:
                        st.write(f"Personnel: {', '.join(personnel_in_zone)}")
                    if equipment_in_zone:
                        st.write(f"Equipment: {', '.join(equipment_in_zone)}")
                else:
                    st.write("**Zone Status:** Clear")
        
        # Safety incidents
        st.subheader("⚠️ Recent Safety Events")
        
        # Mock incident data
        incidents = [
            {
                'Time': '14:23',
                'Zone': 'High Risk Zone A',
                'Type': 'Equipment Alarm',
                'Severity': 'Medium',
                'Status': 'Resolved',
                'Description': 'High vibration detected on Excavator 3'
            },
            {
                'Time': '13:45',
                'Zone': 'Work Zone C',
                'Type': 'Personnel Alert',
                'Severity': 'Low',
                'Status': 'Acknowledged',
                'Description': 'Worker entered zone without check-in'
            },
            {
                'Time': '12:30',
                'Zone': 'Restricted Area B',
                'Type': 'Access Violation',
                'Severity': 'High',
                'Status': 'Investigating',
                'Description': 'Unauthorized equipment detected'
            }
        ]
        
        incidents_df = pd.DataFrame(incidents)
        
        def highlight_incidents(row):
            if row['Severity'] == 'High':
                return ['background-color: #f8d7da'] * len(row)
            elif row['Severity'] == 'Medium':
                return ['background-color: #fff3cd'] * len(row)
            else:
                return ['background-color: #d1ecf1'] * len(row)
        
        styled_incidents_df = incidents_df.style.apply(highlight_incidents, axis=1)
        st.dataframe(styled_incidents_df, use_container_width=True)
    
    with tab5:
        st.subheader("Communications & Coordination")
        
        # Communication channels
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📻 Radio Channels")
            
            channels = [
                {"Channel": "Main Operations", "Frequency": "462.675 MHz", "Status": "Active", "Users": 8},
                {"Channel": "Safety & Emergency", "Frequency": "462.700 MHz", "Status": "Standby", "Users": 3},
                {"Channel": "Equipment Ops", "Frequency": "462.725 MHz", "Status": "Active", "Users": 5},
                {"Channel": "Maintenance", "Frequency": "462.750 MHz", "Status": "Active", "Users": 2}
            ]
            
            channels_df = pd.DataFrame(channels)
            st.dataframe(channels_df, use_container_width=True)
        
        with col2:
            st.subheader("📱 Digital Communication")
            
            # Message center
            st.write("**Recent Messages:**")
            
            messages = [
                {"Time": "15:34", "From": "Control Tower", "Message": "Shift change in 30 minutes"},
                {"Time": "15:20", "From": "Safety Officer", "Message": "Weather update: Light rain expected"},
                {"Time": "15:05", "From": "Maintenance", "Message": "EQ003 maintenance completed"},
                {"Time": "14:50", "From": "Supervisor A", "Message": "Section B cleared for operations"}
            ]
            
            for msg in messages:
                st.text(f"{msg['Time']} - {msg['From']}: {msg['Message']}")
        
        # Broadcast system
        st.subheader("📢 Broadcast Message")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            message_type = st.selectbox("Message Type", [
                "General Announcement",
                "Safety Alert",
                "Emergency Notice",
                "Shift Change",
                "Weather Update"
            ])
        
        with col2:
            recipients = st.multiselect("Recipients", [
                "All Personnel",
                "Equipment Operators",
                "Safety Team",
                "Supervisors",
                "Maintenance Team"
            ])
        
        with col3:
            priority = st.selectbox("Priority", ["Low", "Normal", "High", "Critical"])
        
        message_content = st.text_area("Message Content", height=100)
        
        if st.button("📤 Send Broadcast", type="primary"):
            st.success(f"Message sent to {', '.join(recipients) if recipients else 'All Personnel'}")
            st.info(f"Message: {message_content}")
        
        # Emergency procedures
        st.subheader("🚨 Emergency Procedures")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("🚨 EMERGENCY ALERT", type="primary"):
                st.error("EMERGENCY ALERT ACTIVATED")
                st.error("All personnel report to designated safety areas immediately")
        
        with col2:
            if st.button("⚠️ Safety Incident", type="secondary"):
                st.warning("Safety incident reported - initiating response protocol")
        
        with col3:
            if st.button("🏥 Medical Emergency", type="secondary"):
                st.warning("Medical emergency reported - emergency services contacted")
    
    with tab6:
        st.subheader("Operations Analytics & Reporting")
        
        # Generate analytics for the current shift
        current_time = datetime.now()
        shift_start = current_time.replace(hour=6 if current_time.hour >= 6 else 18, minute=0, second=0)
        
        # Productivity metrics
        st.subheader("📈 Shift Performance")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            shift_duration = (current_time - shift_start).total_seconds() / 3600
            st.metric("Shift Duration", f"{shift_duration:.1f}h")
        
        with col2:
            # Mock productivity data
            target_production = 1000  # tons
            actual_production = np.random.randint(800, 1200)
            st.metric("Production", f"{actual_production}t", delta=f"{actual_production - target_production}t")
        
        with col3:
            efficiency = (actual_production / target_production) * 100
            st.metric("Efficiency", f"{efficiency:.1f}%", delta=f"{efficiency - 100:.1f}%")
        
        with col4:
            downtime_hours = np.random.uniform(0.5, 2.0)
            st.metric("Downtime", f"{downtime_hours:.1f}h", delta_color="inverse")
        
        # Equipment utilization
        st.subheader("🚜 Equipment Utilization")
        
        utilization_data = []
        for equipment in field_ops.equipment_list:
            utilization = np.random.uniform(60, 95) if equipment.status == EquipmentStatus.OPERATIONAL else 0
            utilization_data.append({
                'Equipment': equipment.name,
                'Utilization %': utilization,
                'Status': equipment.status.value[0].title()
            })
        
        utilization_df = pd.DataFrame(utilization_data)
        
        fig = px.bar(
            utilization_df,
            x='Equipment',
            y='Utilization %',
            color='Status',
            title="Equipment Utilization Rate",
            color_discrete_map={
                'Operational': 'green',
                'Maintenance': 'orange',
                'Breakdown': 'red',
                'Idle': 'gray'
            }
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Performance trends
        st.subheader("📊 Performance Trends")
        
        # Generate mock trend data for the last 7 days
        dates = pd.date_range(end=datetime.now().date(), periods=7, freq='D')
        trend_data = []
        
        for date in dates:
            trend_data.append({
                'Date': date,
                'Production (tons)': np.random.randint(900, 1100),
                'Equipment Efficiency %': np.random.uniform(85, 95),
                'Safety Score': np.random.uniform(8.5, 9.8),
                'Personnel Attendance %': np.random.uniform(92, 98)
            })
        
        trends_df = pd.DataFrame(trend_data)
        
        col1, col2 = st.columns(2)
        
        with col1:
            fig = px.line(
                trends_df,
                x='Date',
                y='Production (tons)',
                title="Daily Production Trend",
                markers=True
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            fig = px.line(
                trends_df,
                x='Date',
                y='Equipment Efficiency %',
                title="Equipment Efficiency Trend",
                markers=True
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # Export report
        st.subheader("📄 Generate Reports")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            report_type = st.selectbox("Report Type", [
                "Daily Operations Summary",
                "Equipment Performance",
                "Safety Incident Report",
                "Personnel Attendance",
                "Production Analysis"
            ])
        
        with col2:
            report_format = st.selectbox("Format", ["PDF", "Excel", "CSV"])
        
        with col3:
            if st.button("📊 Generate Report", type="primary"):
                st.success(f"Generating {report_type} in {report_format} format...")
                st.info("Report will be available in the downloads section.")

if __name__ == "__main__":
    create_field_operations_dashboard()