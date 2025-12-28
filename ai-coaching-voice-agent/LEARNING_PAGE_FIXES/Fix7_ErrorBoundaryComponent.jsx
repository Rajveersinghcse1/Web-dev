// ============================================================================
// FIX 7: Error Boundary Component
// ============================================================================
// Location: src/components/ErrorBoundary.jsx (NEW FILE)
// 
// React Error Boundary to catch and handle component errors gracefully
// ============================================================================

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error tracking service if available
    if (typeof window !== 'undefined' && window.errorTracker) {
      window.errorTracker.logError({
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Too many errors - suggest reload
      if (this.state.errorCount > 3) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4">
            <div className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-xl border border-red-200">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Multiple Errors Detected
                  </h1>
                  <p className="text-gray-600">
                    The application has encountered multiple errors. Please reload the page to restore functionality.
                  </p>
                </div>

                <button
                  onClick={this.handleReload}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Single error - show recovery options
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4">
          <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-xl border border-orange-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something Went Wrong
                </h1>
                <p className="text-gray-600">
                  Don't worry, we've logged the error and you can try recovering from it.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-auto">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If the problem persists, please try{' '}
                  <button 
                    onClick={this.handleReload}
                    className="text-purple-600 hover:text-purple-700 font-medium underline"
                  >
                    reloading the page
                  </button>
                  {' '}or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * HOC to wrap components with error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {Object} fallback - Optional custom fallback component
 * @returns {React.Component}
 */
export function withErrorBoundary(Component, fallback = null) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
