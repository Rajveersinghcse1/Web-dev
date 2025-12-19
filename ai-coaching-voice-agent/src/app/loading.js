export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-linear-to-r from-purple-600 to-pink-600 animate-pulse mx-auto flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-black" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2a9 9 0 0 0-9 9c0 3.1 1.6 5.9 4 7.5V22l4-2 4 2v-3.5c2.4-1.6 4-4.4 4-7.5a9 9 0 0 0-9-9zm-2 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm2-5H8a4 4 0 0 1 8 0z"/>
            </svg>
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto"></div>
        </div>
        
        {/* Brand Name */}
        <h2 className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Brane Storm
        </h2>
        <p className="text-sm text-gray-500">Loading your experience...</p>
      </div>
    </div>
  );
}

