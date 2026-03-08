# Stack Auth Vercel Deployment Fix

## ❌ Error
```json
{
  "code": "REDIRECT_URL_NOT_WHITELISTED",
  "error": "Redirect URL not whitelisted. Did you forget to add this domain to the trusted domains list on the Stack Auth dashboard?"
}
```

## ✅ Solution

### 1. Add Domain to Stack Auth Dashboard
1. Go to [Stack Auth Dashboard](https://app.stack-auth.com)
2. Select your project: `760e2266-e91a-4e07-874e-eaa06820de35`
3. Navigate to **Settings** → **Domains**
4. Add these Vercel domains:
   - `https://placement-trannie.vercel.app`
   - `https://placement-trannie.vercel.app/*`
   - `https://placement-trannie-5qx5kzxcw-rajveersinghcse1s-projects.vercel.app`
   - `https://placement-trannie-5qx5kzxcw-rajveersinghcse1s-projects.vercel.app/*`

### 2. Configure OAuth Redirect URLs
Under **OAuth Settings** → **Google OAuth**:
```
https://api.stack-auth.com/api/v1/auth/oauth/callback/google
https://placement-trannie.vercel.app/auth/callback
https://placement-trannie-5qx5kzxcw-rajveersinghcse1s-projects.vercel.app/auth/callback
```

### 3. Environment Variables
Ensure these are set in Vercel:
```env
VITE_STACK_PROJECT_ID=760e2266-e91a-4e07-874e-eaa06820de35
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_0p905jny1x20essfy0cejx8twqrz3estg15jsva8637jg
VITE_CONVEX_URL=https://combative-cat-768.convex.cloud
```

### 4. Redeploy
After making changes in Stack Auth dashboard:
1. Trigger a new Vercel deployment
2. Test OAuth login again

## 🔗 Useful Links
- [Stack Auth Dashboard](https://app.stack-auth.com)
- [Stack Auth Domains Documentation](https://docs.stack-auth.com/config/domains)