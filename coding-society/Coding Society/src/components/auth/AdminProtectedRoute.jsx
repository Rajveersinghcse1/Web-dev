import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * AdminProtectedRoute Component
 * 
 * Protects admin routes by checking:
 * 1. User authentication status
 * 2. User role (must be ADMIN)
 * 
 * Redirects non-admin users to appropriate pages
 */
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
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
          message: 'Please log in to access admin panel'
        }} 
        replace 
      />
    );
  }

  // Redirect to dashboard if authenticated but not admin
  if (!isAdmin) {
    return (
      <Navigate 
        to="/dashboard" 
        state={{ 
          message: 'Access denied. Admin credentials required.'
        }} 
        replace 
      />
    );
  }

  // Render protected component if user is admin
  return children;
};

export default AdminProtectedRoute;