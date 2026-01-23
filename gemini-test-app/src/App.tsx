import { useState, useEffect, useRef } from 'react';
import { ConvexProvider, ConvexReactClient, useMutation } from 'convex/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TestProvider, useTest } from './context/TestContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { TestInterface } from './components/TestInterface';
import { Result } from './components/Result';
import { Loading } from './components/Loading';
import { api } from '../convex/_generated/api';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

type AppView = 'landing' | 'dashboard' | 'test-setup' | 'test';

function AppContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { phase } = useTest();
  const [view, setView] = useState<AppView>('landing');

  // Handle auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (user && view === 'landing') {
        setView('dashboard');
      } else if (!user && view !== 'landing') {
        setView('landing');
      }
    }
  }, [user, authLoading, view]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 animate-pulse">
            <span className="text-white font-bold text-2xl">FP</span>
          </div>
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  if (view === 'landing' && !user) {
    return (
      <LandingPage 
        onGetStarted={() => {
          if (user) {
            setView('dashboard');
          }
        }} 
      />
    );
  }

  // Dashboard for authenticated users
  if (view === 'dashboard' && user) {
    return (
      <Dashboard 
        onStartTest={() => setView('test-setup')} 
      />
    );
  }

  // Test setup/chatbot view
  if (view === 'test-setup') {
    // Handle test phases
    switch (phase) {
      case 'chat':
        return <ChatBot onBack={() => setView('dashboard')} />;
      case 'loading':
        return <Loading />;
      case 'test':
        return <TestInterface />;
      case 'result':
        return <ResultWithSave onBackToDashboard={() => setView('dashboard')} />;
      default:
        return <ChatBot onBack={() => setView('dashboard')} />;
    }
  }

  // Default to landing
  return (
    <LandingPage 
      onGetStarted={() => {
        if (user) {
          setView('dashboard');
        }
      }} 
    />
  );
}

// Wrapper component to save results to Convex
function ResultWithSave({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const { result, subject, resetTest } = useTest();
  const { user } = useAuth();
  const saveResult = useMutation(api.testResults.saveTestResult);
  
  const hasSaved = useRef(false);

  useEffect(() => {
    const saveTestResult = async () => {
      // Prevent duplicate saves using ref
      if (result && user && !hasSaved.current) {
        hasSaved.current = true; // Set immediately to prevent race conditions
        
        try {
          const totalTime = result.questionAnalysis.reduce(
            (sum, q) => sum + (q.timeTaken || 0), 
            0
          );

          await saveResult({
            userId: user.id,
            subject,
            totalQuestions: result.totalQuestions,
            attempted: result.attempted,
            correct: result.correct,
            incorrect: result.incorrect,
            unanswered: result.unanswered,
            totalScore: result.totalScore,
            maxScore: result.maxScore,
            percentage: result.percentage,
            timeTaken: totalTime,
            questionAnalysis: result.questionAnalysis,
          });

          console.log('Test result saved successfully');
        } catch (error) {
          console.error('Failed to save result:', error);
          hasSaved.current = false; // Reset on error to allow retry
        }
      }
    };

    saveTestResult();
  }, [result, user, saveResult, subject]);

  const handleRetry = () => {
    resetTest();
  };

  const handleBackToDashboard = () => {
    resetTest();
    onBackToDashboard();
  };

  return (
    <div>
      <Result />
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-emerald-300 hover:shadow-lg transition-all"
          >
            Try Another Test
          </button>
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <TestProvider>
          <AppContent />
        </TestProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}

export default App;
