import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * UserProtectedRoute Component
 * 
 * Protects user routes by checking authentication status
 * Both USER and ADMIN roles can access user routes
 */
const UserProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Render protected component if user is authenticated
  return children;
};

export default UserProtectedRoute;