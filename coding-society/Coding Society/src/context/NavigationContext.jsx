import React, { createContext, useContext, useState } from 'react';

// Navigation Source Types
export const NAVIGATION_SOURCES = {
  LANDING: 'landing',
  AUTHENTICATED: 'authenticated'
};

// Create Navigation Context
const NavigationContext = createContext();

// Navigation Provider Component
export const NavigationProvider = ({ children }) => {
  const [navigationSource, setNavigationSource] = useState(NAVIGATION_SOURCES.LANDING);

  const setLandingNavigation = () => {
    setNavigationSource(NAVIGATION_SOURCES.LANDING);
  };

  const setAuthenticatedNavigation = () => {
    setNavigationSource(NAVIGATION_SOURCES.AUTHENTICATED);
  };

  const value = {
    navigationSource,
    setNavigationSource,
    setLandingNavigation,
    setAuthenticatedNavigation,
    isLandingNavigation: navigationSource === NAVIGATION_SOURCES.LANDING,
    isAuthenticatedNavigation: navigationSource === NAVIGATION_SOURCES.AUTHENTICATED
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use Navigation Context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;