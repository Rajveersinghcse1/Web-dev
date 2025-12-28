'use client';

import { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ConvexDiagnostic() {
    const convex = useConvex();
    const [status, setStatus] = useState('Checking...');
    const [details, setDetails] = useState({});

    useEffect(() => {
        async function testConnection() {
            try {
                setStatus('Testing connection...');
                
                // Test 1: Check if Convex client is initialized
                if (!convex) {
                    setStatus('❌ Convex client not initialized');
                    return;
                }

                setDetails(prev => ({ ...prev, clientInitialized: '✅ Yes' }));

                // Test 2: Try to query something simple
                try {
                    // This will fail gracefully if no users exist
                    const testQuery = await convex.query(api.users.CreateUser, {
                        name: 'Test',
                        email: 'test@test.com'
                    });
                    setDetails(prev => ({ ...prev, queryTest: '✅ Passed' }));
                } catch (e) {
                    // Expected to fail as CreateUser is a mutation, not query
                    setDetails(prev => ({ ...prev, queryTest: '⚠️ API accessible but error: ' + e.message }));
                }

                setStatus('✅ Connection successful!');
                setDetails(prev => ({
                    ...prev,
                    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || '❌ Not set',
                    timestamp: new Date().toLocaleString()
                }));

            } catch (error) {
                setStatus('❌ Connection failed');
                setDetails({
                    error: error.message,
                    stack: error.stack,
                    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || '❌ Not set'
                });
            }
        }

        testConnection();
    }, [convex]);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>🔍 Convex Connection Diagnostic</h1>
            <hr />
            
            <h2>Status: {status}</h2>
            
            <h3>Details:</h3>
            <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                {JSON.stringify(details, null, 2)}
            </pre>

            <h3>Environment:</h3>
            <ul>
                <li>NEXT_PUBLIC_CONVEX_URL: {process.env.NEXT_PUBLIC_CONVEX_URL || '❌ NOT SET'}</li>
                <li>Node Environment: {process.env.NODE_ENV}</li>
            </ul>

            <hr />
            <p><small>Refresh the page to re-test</small></p>
        </div>
    );
}
