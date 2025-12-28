"""
Simple test dashboard to identify issues
"""

import streamlit as st
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def main():
    st.title("🔧 System Diagnostic Test")
    
    st.write("Testing basic functionality...")
    
    # Test 1: Basic streamlit functionality
    st.success("✅ Streamlit basic functionality working")
    
    # Test 2: Try importing modules one by one
    st.subheader("Module Import Tests")
    
    modules_to_test = [
        'file_upload_system',
        'historical_data_system', 
        'realtime_pipeline',
        'advanced_risk_analytics',
        'field_operations_dashboard'
    ]
    
    for module_name in modules_to_test:
        try:
            __import__(module_name)
            st.success(f"✅ {module_name} imported successfully")
        except Exception as e:
            st.error(f"❌ {module_name} failed to import: {str(e)}")
    
    # Test 3: Try importing core modules
    st.subheader("Core Module Tests")
    
    core_modules = [
        'data_ingestion',
        'model_3d_generation',
        'feature_engineering',
        'ml_training',
        'pipeline'
    ]
    
    for module_name in core_modules:
        try:
            __import__(module_name)
            st.success(f"✅ {module_name} imported successfully")
        except Exception as e:
            st.error(f"❌ {module_name} failed to import: {str(e)}")

if __name__ == "__main__":
    main()