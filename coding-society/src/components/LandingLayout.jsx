import React from 'react';
import { Outlet } from 'react-router-dom';
import LandingNavigation from './LandingNavigation';

/**
 * Landing Layout Component
 * Provides persistent LandingNavigation for pages that need it
 * Uses Outlet to render child routes
 */
const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default LandingLayout;