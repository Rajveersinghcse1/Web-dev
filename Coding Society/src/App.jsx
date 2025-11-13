import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { NotificationProvider } from './context/NotificationContext';
import { NavigationProvider } from './context/NavigationContext';
import { GameProvider } from './context/GameContext';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import LandingLayout from './components/LandingLayout';
import ErrorBoundary from './components/ErrorBoundary';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import UserProtectedRoute from './components/auth/UserProtectedRoute';
import HomePage from './pages/HomePage';
import CompilerPageWrapper from './pages/CompilerPageWrapper';
// import AuthPage from './pages/AuthPage'; - Replaced with modal
import UltraAdvancedFeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import RoadmapPage from './pages/RoadmapPage';

import QuizPage from './pages/QuizPage';
import ResearchPage from './pages/ResearchPage';
import CareerPage from './pages/CareerPage_new';
import DashboardPage from './pages/DashboardPage';
import AIToolsPage from './pages/AIToolsPage';
import GamifiedPage from './pages/GamifiedPage';
import StudyPage from './pages/StudyPage';
import IdeasPage from './pages/IdeasPage';
import ATSResumeBuilder from './pages/ATSResumeBuilder';
import InternshipPage from './pages/InternshipPage_new';
import HackathonPage from './pages/HackathonPage';
import HelpSupportPage from './pages/HelpSupportPage';
import AdminRoutes from './pages/AdminRoutes';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Landing Layout Routes - Pages that use LandingNavigation */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Compiler Route - Can be accessed from both landing and authenticated areas */}
        <Route path="/compiler" element={
          <ErrorBoundary>
            <CompilerPageWrapper />
          </ErrorBoundary>
        } />

        {/* Regular App Routes - Each route individually defined */}
        <Route path="/roadmap" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <RoadmapPage />
            </main>
          </div>
        } />
        <Route path="/quiz" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <QuizPage />
            </main>
          </div>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <DashboardPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/library" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <StudyPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/ai-tools" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <AIToolsPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/ideas" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <IdeasPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/gamified" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <GamifiedPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/feed" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <ErrorBoundary>
                  <UltraAdvancedFeedPage />
                </ErrorBoundary>
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/internships" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <InternshipPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/hackathons" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <HackathonPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <ProfilePage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/research" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <ResearchPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/career" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <CareerPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/resume-builder" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <ATSResumeBuilder />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        <Route path="/help-support" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="pt-16">
              <UserProtectedRoute>
                <HelpSupportPage />
              </UserProtectedRoute>
            </main>
          </div>
        } />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        
        {/* Admin Routes */}
        {AdminRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <AdminProtectedRoute>
                {route.element}
              </AdminProtectedRoute>
            }
          />
        ))}
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ModeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <NavigationProvider>
              <GameProvider>
                <AppContent />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </GameProvider>
            </NavigationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ModeProvider>
  );
}

export default App;