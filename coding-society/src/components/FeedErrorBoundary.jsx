import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

class FeedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console or error reporting service
    console.error('Feed Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('Failed to fetch') || 
                            this.state.error?.message?.includes('Network Error');
      
      const isChunkError = this.state.error?.message?.includes('ChunkLoadError') ||
                          this.state.error?.message?.includes('Loading chunk');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {isNetworkError ? 'Connection Problem' : 
                 isChunkError ? 'Loading Problem' : 
                 'Something went wrong'}
              </h1>
              
              <p className="text-gray-600 mb-6">
                {isNetworkError ? 
                  'We\'re having trouble connecting to our servers. Please check your internet connection and try again.' :
                 isChunkError ?
                  'There was a problem loading the application. This usually happens after an update.' :
                  'An unexpected error occurred while loading the feed. Our team has been notified.'}
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                  <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.state.retryCount < 3 && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </Button>
                )}
                
                {(isChunkError || this.state.retryCount >= 3) && (
                  <Button 
                    onClick={this.handleReload}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reload Page</span>
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </Button>

                <Button 
                  onClick={() => window.open('mailto:support@codingsociety.com?subject=Feed Error Report', '_blank')}
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Report Issue</span>
                </Button>
              </div>

              {/* Retry Counter */}
              {this.state.retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Retry attempts: {this.state.retryCount}/3
                </p>
              )}

              {/* Additional Help */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Fixes:</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Check your internet connection</p>
                  <p>• Try refreshing the page</p>
                  <p>• Clear your browser cache</p>
                  <p>• Try using an incognito/private window</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeedErrorBoundary;