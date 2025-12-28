"use client";
import React, { Suspense, useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import AuthProvider from './AuthProvider';

function Provider({ children }) {
    const convexClient = useMemo(() => {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        
        if (!convexUrl) {
            console.error('❌ NEXT_PUBLIC_CONVEX_URL is not defined in environment variables');
            return null;
        }

        console.log('🔗 Initializing Convex client with URL:', convexUrl);
        
        try {
            const client = new ConvexReactClient(convexUrl);
            console.log('✅ Convex client initialized successfully');
            return client;
        } catch (err) {
            console.error('❌ Failed to initialize Convex client:', err);
            return null;
        }
    }, []);

    if (!convexClient) {
        return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
                <h2>Database Connection Error</h2>
                <p>NEXT_PUBLIC_CONVEX_URL is not configured</p>
                <p>Please check your .env.local file and ensure Convex is running.</p>
                <p><strong>Expected:</strong> NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ConvexProvider client={convexClient}>
                <AuthProvider>{children}</AuthProvider>
            </ConvexProvider>
        </Suspense>
    );
}

export default Provider;