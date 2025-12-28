// ============================================================================
// FIX 1: Enhanced AuthProvider with State Machine
// ============================================================================
// Location: src/app/AuthProvider.jsx
// 
// This replaces the existing AuthProvider with a robust state machine that
// tracks loading, ready, and error states.
// ============================================================================

"use client";
import React, { useEffect, useState, createContext } from 'react';
import { useUser } from '@stackframe/stack';
import { api } from '../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const UserContext = createContext(null);

// Loading Screen Component
function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Loading your account...</h2>
                    <p className="text-sm text-gray-600 mt-2">Please wait while we set things up</p>
                </div>
            </div>
        </div>
    );
}

// Error Screen Component
function ErrorScreen({ error, onRetry }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <div className="max-w-md p-8 bg-white rounded-2xl shadow-lg border border-red-200">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Account Loading Failed</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            {error?.message || 'Unable to load your account. Please try again.'}
                        </p>
                    </div>
                    <button
                        onClick={onRetry}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                    <p className="text-xs text-gray-500">
                        If the problem persists, please contact support or try logging in again.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AuthProvider({ children }) {
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    
    // Enhanced state machine
    const [authState, setAuthState] = useState({
        userData: null,
        isLoading: false,
        isReady: false,
        error: null,
        retryCount: 0
    });

    // Track initialization
    const [initialized, setInitialized] = useState(false);

    // Load user data with retry logic
    const loadUserData = async (retryAttempt = 0) => {
        if (!user?.primaryEmail) {
            return;
        }

        setAuthState(prev => ({ 
            ...prev, 
            isLoading: true,
            error: null,
            retryCount: retryAttempt
        }));

        try {
            console.log(`[AuthProvider] Loading user data (attempt ${retryAttempt + 1})...`);
            
            // Add timeout to CreateUser call
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
            );

            const userPromise = CreateUser({
                name: user?.displayName || 'Unknown',
                email: user?.primaryEmail || ''
            });

            const result = await Promise.race([userPromise, timeoutPromise]);
            
            console.log('[AuthProvider] User data loaded successfully:', result);

            // Validate result has required fields
            if (!result || typeof result._id === 'undefined') {
                throw new Error('Invalid user data received from server');
            }

            if (typeof result.credits === 'undefined') {
                console.warn('[AuthProvider] Credits field missing, setting default');
                result.credits = 50000;
            }

            setAuthState({
                userData: result,
                isLoading: false,
                isReady: true,
                error: null,
                retryCount: retryAttempt
            });

            setInitialized(true);

        } catch (error) {
            console.error('[AuthProvider] Error loading user data:', error);

            // Retry logic for transient errors
            if (retryAttempt < 3 && isTransientError(error)) {
                console.log(`[AuthProvider] Transient error detected, retrying in ${(retryAttempt + 1) * 1000}ms...`);
                setTimeout(() => {
                    loadUserData(retryAttempt + 1);
                }, (retryAttempt + 1) * 1000); // Exponential backoff
            } else {
                // Permanent error or max retries reached
                setAuthState({
                    userData: null,
                    isLoading: false,
                    isReady: false,
                    error: error,
                    retryCount: retryAttempt
                });
                setInitialized(true);
            }
        }
    };

    // Helper to detect transient vs permanent errors
    const isTransientError = (error) => {
        const transientMessages = ['timeout', 'network', 'fetch', 'ECONNREFUSED', 'ETIMEDOUT'];
        const errorMessage = error?.message?.toLowerCase() || '';
        return transientMessages.some(msg => errorMessage.includes(msg));
    };

    // Update user data helper
    const setUserData = (updater) => {
        setAuthState(prev => {
            const newUserData = typeof updater === 'function' ? updater(prev.userData) : updater;
            return {
                ...prev,
                userData: newUserData
            };
        });
    };

    // Initial load
    useEffect(() => {
        console.log('[AuthProvider] User changed:', user?.primaryEmail);
        if (user && user.primaryEmail) {
            loadUserData(0);
        } else if (user === null) {
            // User is explicitly not logged in
            setAuthState({
                userData: null,
                isLoading: false,
                isReady: false,
                error: new Error('Not logged in'),
                retryCount: 0
            });
            setInitialized(true);
        }
    }, [user?.primaryEmail]); // Only re-run if email changes

    // Show loading screen while initializing
    if (!initialized) {
        return <LoadingScreen />;
    }

    // Show error screen if initialization failed
    if (authState.error && !authState.isLoading) {
        return (
            <ErrorScreen 
                error={authState.error} 
                onRetry={() => loadUserData(0)} 
            />
        );
    }

    // Show loading screen during retry attempts
    if (authState.isLoading) {
        return <LoadingScreen />;
    }

    // Provide enhanced context with all state
    const contextValue = {
        userData: authState.userData,
        setUserData: setUserData,
        isLoading: authState.isLoading,
        isReady: authState.isReady,
        error: authState.error,
        retry: () => loadUserData(0)
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export default AuthProvider;
