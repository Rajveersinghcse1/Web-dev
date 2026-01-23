import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export interface User {
  id: Id<"users">;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_ID_KEY = 'freeprep_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem(USER_ID_KEY);
    return stored as Id<"users"> | null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const userData = useQuery(api.auth.getUser, userId ? { userId } : "skip");

  const user: User | null = userData ? {
    id: userData.id,
    email: userData.email,
    name: userData.name ?? null,
    avatarUrl: userData.avatarUrl ?? null,
    totalTests: userData.totalTests,
    totalQuestions: userData.totalQuestions,
    correctAnswers: userData.correctAnswers,
  } : null;

  useEffect(() => {
    // Check if we have a stored user ID and validate it
    if (userId && userData === null && !isLoading) {
      // User not found, clear storage
      localStorage.removeItem(USER_ID_KEY);
      setUserId(null);
    }
    setIsLoading(false);
  }, [userId, userData, isLoading]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await signInMutation({ email, password });
      if (result.success) {
        localStorage.setItem(USER_ID_KEY, result.userId);
        setUserId(result.userId as Id<"users">);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      return false;
    }
  }, [signInMutation]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await signUpMutation({ email, password, name });
      if (result.success) {
        localStorage.setItem(USER_ID_KEY, result.userId);
        setUserId(result.userId as Id<"users">);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      return false;
    }
  }, [signUpMutation]);

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_ID_KEY);
    setUserId(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
