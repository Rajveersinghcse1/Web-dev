"use client";
import React, { useEffect, useState, createContext, useCallback, useRef } from 'react';
import { useUser } from '@stackframe/stack';
import { api } from '../../convex/_generated/api';
import { useMutation } from 'convex/react';

export const UserContext = createContext(null);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5 seconds

function AuthProvider({ children }) {
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    // Use ref to track if we're currently creating a user to prevent duplicate calls
    const isCreatingUser = useRef(false);
    const userEmailRef = useRef(null);

    const retryWithBackoff = useCallback(async (fn, retries = MAX_RETRIES) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const result = await fn();
                return result;
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                
                if (attempt === retries - 1) {
                    throw error; // Last attempt failed
                }
                
                // Exponential backoff: 1.5s, 3s, 6s
                const delay = RETRY_DELAY * Math.pow(2, attempt);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }, []);

    const CreateNewUser = useCallback(async (forceRetry = false) => {
        // Prevent duplicate calls
        if (isCreatingUser.current && !forceRetry) {
            console.log('🔄 User creation already in progress, skipping...');
            return;
        }

        // Validate user data
        if (!user?.primaryEmail) {
            console.log('⚠️ No user email available, waiting...');
            setIsLoading(false);
            setIsReady(false);
            return;
        }

        // Check if we already have user data for this email
        if (userData && userEmailRef.current === user.primaryEmail && !forceRetry) {
            console.log('✓ User data already loaded for this email');
            setIsLoading(false);
            setIsReady(true);
            return;
        }

        isCreatingUser.current = true;
        setIsLoading(true);
        setError(null);

        console.log(`🔄 [AuthProvider] Creating/fetching user for: ${user.primaryEmail}`);

        try {
            const result = await retryWithBackoff(async () => {
                return await CreateUser({
                    name: user?.displayName || 'Unknown',
                    email: user?.primaryEmail || ''
                });
            });

            if (!result) {
                throw new Error('Empty result from CreateUser mutation');
            }

            console.log('✓ [AuthProvider] User data loaded successfully:', {
                email: result.email,
                credits: result.credits,
                level: result.level
            });

            setUserData(result);
            userEmailRef.current = user.primaryEmail;
            setIsReady(true);
            setIsLoading(false);
            setError(null);
            setRetryCount(0);
            
        } catch (error) {
            console.error('❌ [AuthProvider] Failed to create/fetch user:', error);
            
            setError(error.message || 'Failed to load user data');
            setIsLoading(false);
            setIsReady(false);
            setRetryCount(prev => prev + 1);
            
            // If we haven't exceeded max retries, automatically retry after a delay
            if (retryCount < MAX_RETRIES) {
                console.log(`🔄 Auto-retry scheduled (${retryCount + 1}/${MAX_RETRIES})...`);
                setTimeout(() => {
                    CreateNewUser(true);
                }, RETRY_DELAY * Math.pow(2, retryCount));
            }
        } finally {
            isCreatingUser.current = false;
        }
    }, [user, CreateUser, retryWithBackoff, userData, retryCount]);

    const retry = useCallback(() => {
        console.log('🔄 Manual retry triggered');
        setRetryCount(0);
        CreateNewUser(true);
    }, [CreateNewUser]);

    // Main effect to initialize user
    useEffect(() => {
        console.log('🔍 [AuthProvider] User state changed:', {
            hasUser: !!user,
            email: user?.primaryEmail,
            isLoading,
            isReady,
            hasUserData: !!userData
        });

        if (user && user.primaryEmail) {
            CreateNewUser();
        } else if (!user) {
            // User logged out or not authenticated
            console.log('⚠️ [AuthProvider] No user authenticated');
            setUserData(null);
            setIsLoading(false);
            setIsReady(false);
            setError(null);
            userEmailRef.current = null;
        }
    }, [user?.primaryEmail]); // Only depend on email to prevent unnecessary re-runs

    const contextValue = {
        userData,
        setUserData,
        isLoading,
        isReady,
        error,
        retry,
        retryCount
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export default AuthProvider;