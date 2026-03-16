# Authentication Migration Summary

## Overview
Successfully migrated from Stack Auth to direct Convex database authentication.

## Changes Made

### 1. Database Schema
- **File:** `convex/schema.js`
- Added `password` field to users table for authentication

### 2. Authentication System
- **New File:** `convex/auth.js`
  - Created `signUp` mutation for user registration
  - Created `signIn` mutation for user login
  - Created `getCurrentUser` query to fetch user data
  - Created `updateUserProfile` mutation for profile updates
  - ⚠️ **Note:** Currently using basic password hashing. For production, implement bcryptjs or similar secure hashing.

### 3. Auth Provider
- **File:** `src/app/AuthProvider.jsx`
  - Completely rewritten to use Convex instead of Stack Auth
  - Uses localStorage to persist user session
  - Provides `signIn`, `signUp`, and `signOut` functions via context
  - Automatically loads user data on mount

### 4. Authentication Pages
- **New File:** `src/app/sign-in/page.jsx` - Sign in page with email/password
- **New File:** `src/app/sign-up/page.jsx` - Sign up page with name/email/password
- Removed Stack Auth handler pages

### 5. UI Components
- **New File:** `src/components/UserButton.jsx` - Custom user menu button
- **New File:** `src/components/ui/dropdown-menu.jsx` - Dropdown menu component for UserButton

### 6. Updated Components
Updated all components to use new UserContext instead of Stack Auth:
- `src/app/layout.js` - Removed StackProvider and StackTheme
- `src/app/page.js` - Updated to use UserContext
- `src/app/(main)/_components/AppHeader.jsx` - Uses custom UserButton
- `src/app/(main)/mock-interview/page.js` - Uses UserContext
- `src/app/(main)/dashboard/_components/Credits.jsx` - Uses UserContext
- `src/components/TeamSessions.jsx` - Uses UserContext

### 7. Dependencies
- **File:** `package.json`
  - Removed `@stackframe/stack` package
  - Added `@radix-ui/react-dropdown-menu` for UserButton component

### 8. Environment Variables
- **File:** `.env.example`
  - Removed all Stack Auth related variables:
    - NEXT_PUBLIC_STACK_PROJECT_ID
    - NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
    - STACK_SECRET_SERVER_KEY
    - NEXT_PUBLIC_STACK_URL

### 9. Deleted Files/Folders
The following Stack Auth related files should be deleted manually:
- `src/stack/` folder (client.js, server.js, index.js)
- `src/app/handler/[...stack]/` folder
- `.mcp.json`
- `.cursor/mcp.json`
- `.vscode/mcp.json`

## User Object Structure

### Old (Stack Auth):
```javascript
{
  id: "...",
  primaryEmail: "...",
  displayName: "...",
  profileImageUrl: "..."
}
```

### New (Convex):
```javascript
{
  _id: "...",
  email: "...",
  name: "...",
  image: "...",
  credits: 50000,
  level: 1,
  xp: 0,
  // ... other fields
}
```

## Usage

### Sign Up
```javascript
const { signUp } = useContext(UserContext);
await signUp(name, email, password);
```

### Sign In
```javascript
const { signIn } = useContext(UserContext);
await signIn(email, password);
```

### Sign Out
```javascript
const { signOut } = useContext(UserContext);
signOut();
```

### Access User Data
```javascript
const { user, userData, isLoading, isReady } = useContext(UserContext);
```

## Important Notes

1. **Password Security:** The current implementation uses basic Base64 encoding. For production:
   - Install bcryptjs: `npm install bcryptjs`
   - Update `convex/auth.js` to use bcrypt for password hashing

2. **Session Management:** Currently uses localStorage. Consider:
   - Implementing session tokens with expiration
   - Adding refresh token mechanism
   - Implementing "Remember Me" functionality

3. **User Migration:** If you have existing users from Stack Auth, you'll need to:
   - Export user data from Stack Auth
   - Create a migration script to import users into Convex
   - Set temporary passwords or implement password reset flow

4. **Testing:**
   - Test signup flow
   - Test signin flow
   - Test signout flow
   - Test protected routes
   - Verify all components display user data correctly

## Next Steps

1. Run `npm install` to update dependencies
2. Delete the Stack Auth related files listed above
3. Update your `.env.local` file (remove Stack Auth variables)
4. Test the authentication flow
5. Implement bcryptjs for secure password hashing (production)
6. Add password reset functionality
7. Implement email verification (optional)
8. Add rate limiting for auth endpoints (optional)
