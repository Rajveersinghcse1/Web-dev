import React from 'react';
import { useMode } from '../context/ModeContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, resetError }) => {
  const { mode } = useMode();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg border ${
        mode === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            mode === 'dark' ? 'bg-red-900' : 'bg-red-100'
          }`}>
            <AlertTriangle className={`h-8 w-8 ${
              mode === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
          </div>
          
          <h2 className={`text-xl font-bold mb-2 ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Something went wrong
          </h2>
          
          <p className={`text-sm mb-4 ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            The compiler page encountered an error. Please try refreshing the page.
          </p>
          
          <button
            onClick={resetError}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          {error && (
            <details className={`mt-4 text-left text-xs ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <summary className="cursor-pointer mb-2">Error Details</summary>
              <pre className={`p-2 rounded border overflow-auto ${
                mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'
              }`}>
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;