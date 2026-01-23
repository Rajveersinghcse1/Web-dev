import { useEffect } from 'react';

export function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Stack Auth handles the callback automatically
        // Just redirect to home after processing
        window.location.href = '/';
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 animate-pulse">
          <span className="text-white font-bold text-2xl">FP</span>
        </div>
        <p className="text-gray-600">Signing you in...</p>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}
