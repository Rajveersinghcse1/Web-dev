// Stack Auth configuration for Vite/React SPA
const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

const STACK_BASE_URL = 'https://api.stack-auth.com';

export interface StackUser {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}

// Token storage
const TOKEN_KEY = 'stack_auth_tokens';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function getStoredTokens(): AuthTokens | null {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

// Get current user from stored token
export async function getCurrentUser(): Promise<StackUser | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  try {
    const response = await fetch(`${STACK_BASE_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'x-stack-project-id': projectId,
        'x-stack-publishable-client-key': publishableKey,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearTokens();
      }
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  clearTokens();
}

// Redirect to Stack Auth hosted sign-in page
export function redirectToSignIn() {
  const callbackUrl = encodeURIComponent(window.location.origin + '/auth/callback');
  window.location.href = `https://app.stack-auth.com/handler/${projectId}/sign-in?after_auth_return_to=${callbackUrl}`;
}

// Redirect to Stack Auth hosted sign-up page
export function redirectToSignUp() {
  const callbackUrl = encodeURIComponent(window.location.origin + '/auth/callback');
  window.location.href = `https://app.stack-auth.com/handler/${projectId}/sign-up?after_auth_return_to=${callbackUrl}`;
}

// Handle OAuth callback - extract tokens from URL
export function handleAuthCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');

  if (accessToken && refreshToken) {
    storeTokens({ accessToken, refreshToken });
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }

  // Also check hash for token (some OAuth flows use hash)
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const hashAccessToken = hashParams.get('access_token');
  const hashRefreshToken = hashParams.get('refresh_token');

  if (hashAccessToken && hashRefreshToken) {
    storeTokens({ accessToken: hashAccessToken, refreshToken: hashRefreshToken });
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }

  return false;
}

// Stack client object for compatibility
export const stackClient = {
  getUser: getCurrentUser,
  signOut,
  redirectToSignIn,
  redirectToSignUp,
};
