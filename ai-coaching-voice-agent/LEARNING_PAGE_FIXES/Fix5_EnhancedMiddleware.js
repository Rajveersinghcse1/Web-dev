// ============================================================================
// FIX 5: Enhanced Middleware with Timeout
// ============================================================================
// Location: src/middleware.js
// 
// Adds timeout handling and better error responses
// ============================================================================

import { stackServerApp } from "@/stack";
import { NextResponse } from "next/server";

// Configuration
const AUTH_TIMEOUT_MS = 8000; // 8 seconds
const MAX_RETRIES = 2;

/**
 * Fetches user with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<User|null>}
 */
async function getUserWithTimeout(timeoutMs = AUTH_TIMEOUT_MS) {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout')), timeoutMs)
    );

    const userPromise = stackServerApp.getUser();

    try {
        const user = await Promise.race([userPromise, timeoutPromise]);
        return user;
    } catch (error) {
        console.error('[Middleware] User fetch error:', error);
        throw error;
    }
}

/**
 * Attempts to get user with retry logic
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<User|null>}
 */
async function getUserWithRetry(maxRetries = MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Middleware] Fetching user (attempt ${attempt + 1}/${maxRetries + 1})...`);
            const user = await getUserWithTimeout();
            
            if (user) {
                console.log(`[Middleware] User authenticated: ${user.primaryEmail}`);
                return user;
            }
            
            console.log('[Middleware] No user found');
            return null;
            
        } catch (error) {
            lastError = error;
            console.error(`[Middleware] Attempt ${attempt + 1} failed:`, error.message);
            
            // Don't retry on final attempt
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
            }
        }
    }
    
    // All retries failed
    throw lastError;
}

/**
 * Middleware function
 * @param {Request} request - Next.js request object
 * @returns {NextResponse}
 */
export async function middleware(request) {
    const startTime = Date.now();
    const pathname = request.nextUrl.pathname;
    
    console.log(`[Middleware] Processing request: ${pathname}`);
    
    try {
        // Attempt to get user with retry logic
        const user = await getUserWithRetry();
        
        if (!user) {
            console.log('[Middleware] User not authenticated, redirecting to sign-in');
            
            // Store the original URL to redirect back after login
            const redirectUrl = new URL('/handler/sign-in', request.url);
            redirectUrl.searchParams.set('redirect', pathname);
            
            return NextResponse.redirect(redirectUrl);
        }
        
        // User is authenticated, allow request
        const response = NextResponse.next();
        
        // Add custom headers for debugging
        response.headers.set('X-Auth-Time', `${Date.now() - startTime}ms`);
        response.headers.set('X-User-Email', user.primaryEmail || 'unknown');
        
        console.log(`[Middleware] Request authorized (${Date.now() - startTime}ms)`);
        return response;
        
    } catch (error) {
        console.error('[Middleware] Critical error:', error);
        
        // Determine error type and response
        if (error.message?.includes('timeout')) {
            // Timeout error - show custom error page
            console.error('[Middleware] Authentication timeout');
            
            return NextResponse.rewrite(new URL('/auth-timeout', request.url), {
                status: 408,
                headers: {
                    'X-Error-Type': 'timeout',
                    'X-Error-Message': 'Authentication service timed out'
                }
            });
        }
        
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            // Network error
            console.error('[Middleware] Network error');
            
            return NextResponse.rewrite(new URL('/auth-error', request.url), {
                status: 503,
                headers: {
                    'X-Error-Type': 'network',
                    'X-Error-Message': 'Unable to connect to authentication service'
                }
            });
        }
        
        // Generic error - return 500 with error details
        return NextResponse.json(
            {
                error: 'Authentication failed',
                message: process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : 'An unexpected error occurred. Please try again.',
                timestamp: new Date().toISOString()
            },
            {
                status: 500,
                headers: {
                    'X-Error-Type': 'internal',
                    'X-Error-Time': `${Date.now() - startTime}ms`
                }
            }
        );
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/discussion-room/:path*',
        '/view-summery/:path*',
        '/community/:path*',
        '/mock-interview/:path*'
    ],
};
