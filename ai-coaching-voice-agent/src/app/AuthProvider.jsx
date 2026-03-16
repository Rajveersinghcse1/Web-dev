"use client";
import React, { useEffect, useState, createContext, useCallback } from 'react';
import { api } from '../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

export const UserContext = createContext(null);

function AuthProvider({ children }) {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    // Get current user data from Convex
    const currentUser = useQuery(
        api.auth.getCurrentUser,
        userId ? { userId } : "skip"
    );

    const signInMutation = useMutation(api.auth.signIn);
    const signUpMutation = useMutation(api.auth.signUp);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            setIsLoading(false);
            setIsReady(false);
        }
    }, []);

    // Update userData when currentUser changes
    useEffect(() => {
        if (currentUser !== undefined) {
            if (currentUser) {
                setUserData(currentUser);
                setIsReady(true);
                setIsLoading(false);
                setError(null);
            } else if (userId) {
                // User ID exists but user not found - clear auth
                localStorage.removeItem('userId');
                setUserId(null);
                setUserData(null);
                setIsReady(false);
                setError(null);
            }
        }
    }, [currentUser, userId]);

    const signIn = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const user = await signInMutation({ email, password });
            localStorage.setItem('userId', user._id);
            setUserId(user._id);
            setUserData(user);
            setIsReady(true);
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.message || 'Failed to sign in';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [signInMutation]);

    const signUp = useCallback(async (name, email, password) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const user = await signUpMutation({ name, email, password });
            localStorage.setItem('userId', user._id);
            setUserId(user._id);
            setUserData(user);
            setIsReady(true);
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.message || 'Failed to sign up';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [signUpMutation]);

    const signOut = useCallback(() => {
        localStorage.removeItem('userId');
        setUserId(null);
        setUserData(null);
        setIsReady(false);
        setError(null);
        router.push('/');
    }, [router]);

    const contextValue = {
        userData,
        isLoading,
        isReady,
        error,
        signIn,
        signUp,
        signOut,
        user: userData, // For compatibility with existing code
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export default AuthProvider;