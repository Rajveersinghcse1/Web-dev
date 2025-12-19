import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import LandingNavigation from '../components/LandingNavigation';
import Navigation from '../components/Navigation';
import CompilerPage from './CompilerPage';

/**
 * CompilerPageWrapper - Renders CompilerPage with appropriate navigation
 * This component determines which navbar to show based on navigation source
 */
const CompilerPageWrapper = () => {
  const { isLandingNavigation, isAuthenticatedNavigation } = useNavigation();

  return (
    <div className="min-h-screen bg-white">
      {/* Conditionally render the appropriate navigation */}
      {isLandingNavigation && <LandingNavigation />}
      {isAuthenticatedNavigation && <Navigation />}
      
      {/* Main content area with appropriate top padding */}
      <main className={isAuthenticatedNavigation ? "pt-16" : ""}>
        <CompilerPage />
      </main>
    </div>
  );
};

export default CompilerPageWrapper;