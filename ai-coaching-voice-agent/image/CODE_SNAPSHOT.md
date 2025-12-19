# AI Coaching Voice Agent — Code Snapshot

This document provides a comprehensive snapshot and guide for the repository at the time of analysis (Dec 4, 2025). It includes architecture notes, key files and excerpts, environment variables, run instructions, and troubleshooting information gathered during debugging.

---

**Project**: AI Coaching Voice Agent

**Root**: `C:/Users/rkste/Desktop/ai-coaching-voice-agent`

**Primary Tech**: Next.js (v14.x), React 18.x, Convex (serverless DB), Stack Auth (`@stackframe/stack`), Tailwind CSS

---

## High-level Architecture

- Next.js app (app router) hosts the frontend (server components + client components).
- `@stackframe/stack` provides authentication and user management.
- Convex is used as the backend database/edge functions (`convex/` folder).
- Services for speech and AI: `assemblyai`, `openai`, AWS Polly, etc.

The UI lives under `src/app` with a provider chain in `src/app/layout.js` that wires up the Stack provider and an app-level Provider.

---

## Key Files (with representative snippets)

- `package.json` — main dependencies and scripts

```json
// excerpt
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@stackframe/stack": "^2.4.8",
    "convex": "^1.29.3",
    "next": "^14.2.33",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    // other deps omitted
  }
}
```

- `src/stack/client.js` — Stack client configuration (important: `baseUrl`)

```javascript
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  baseUrl: "https://api.stack-auth.com",
});
```

Notes:
- The `@stackframe/stack` internals expect `baseUrl` (not `apiUrl`) to compute the API endpoint (`baseUrl + "/api/v1"`). Using the dashboard URL (`https://app.stack-auth.com`) will return a 400 error; use `https://api.stack-auth.com`.

- `src/app/AuthProvider.jsx` — Auth provider using `useUser()` and Convex mutation

```jsx
"use client";
import React, { useEffect, useState, createContext } from 'react';
import { useUser } from '@stackframe/stack';
import { api } from '../../convex/_generated/api';
import { useMutation } from 'convex/react';

export const UserContext = createContext(null);

function AuthProvider({ children }){
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData , setUserData] = useState(null);

    useEffect(() =>{
        console.log('AuthProvider user:', user);
        if (user && user.primaryEmail) {
            CreateNewUser();
        }
    },[user])

    const CreateNewUser = async () =>{
        try {
            const result = await CreateUser({
                name: user?.displayName || 'Unknown',
                email: user?.primaryEmail || ''
            });
            setUserData(result);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    return (
        <UserContext.Provider value={{userData , setUserData}}>
            {children}
        </UserContext.Provider>
    )
}

export default AuthProvider;
```

- `src/app/layout.js` — root layout wiring the StackProvider

```javascript
import { Inter } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import Provider from "./provider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Provider>{children}</Provider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
```

- `convex/schema.js` — database schema (Convex)

```javascript
import {defineSchema , defineTable } from "convex/server";
import {v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        credits: v.number(),
        subscriptionId: v.optional(v.string()),
    }),

    DiscussionRoom: defineTable({
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        conversation: v.optional(v.any()),
    }),
});
```

---

## Environment variables (required/observed)

- `NEXT_PUBLIC_STACK_PROJECT_ID` — Stack project id (client accessible)
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` — Stack publishable client key (client-side)
- Convex credentials & other secrets should be configured as required by Convex and other services (e.g., AssemblyAI, OpenAI, AWS creds). Typically stored in `.env.local`.

Important: Make sure the client-side publishable key is of the correct type (publishable) and the server uses the appropriate secret key where needed. A mismatch can cause KnownError codes like `PROJECT_KEY_WITHOUT_ACCESS_TYPE`.

---

## Run & Development

1. Install dependencies:

```powershell
npm install
```

2. Start Convex local dev (if used):

```powershell
npx convex dev
```

3. Start Next.js dev server:

```powershell
npm run dev
```

Open http://localhost:3000

Note: On Windows PowerShell, join multiple commands with `;` if needed.

---

## Known Issues & Troubleshooting

- 400 Bad Request when Stack client tries to call `https://app.stack-auth.com/api/v1/current-user` — symptom message:

  "You attempted to access /api on the Stack Auth dashboard URL, instead of the API URL. Did you mean to access https://api.stack-auth.com/api instead (with an I instead of a P)?"

  Cause & Fix:
  - `StackClientApp` expects `baseUrl` as the option name. If `baseUrl` points to `https://app.stack-auth.com` (dashboard URL) or if `apiUrl` was used, the library builds the wrong endpoint and returns 400.
  - Ensure `src/stack/client.js` is configured with `baseUrl: "https://api.stack-auth.com"`.

- KnownError: `PROJECT_KEY_WITHOUT_ACCESS_TYPE`

  - Meaning: The key provided by client or server to the Stack API is missing a declared access type or is the wrong key type for the intended operation.
  - Action steps:
    - Verify `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` is set to the publishable key (client).
    - Ensure server-side code (if any) uses the secret key (not publishable) for server-only endpoints.
    - Check the Stack dashboard key configuration; rotate/regenerate keys if necessary.

- Fast Refresh / full reloads may occur when runtime errors are thrown by stack init code. Fixing the `baseUrl` and ensuring environment keys are present avoids repeated reloads.

---

## Recommendations & Next Steps

- Confirm `.env.local` contains the two stack env vars shown above and restart Next.js.
- If you use server-only Stack features, validate the server environment contains the server secret key (not publishable).
- Add a `.env.example` with keys names for easier onboarding.
- Consider adding a small `docs/` folder with a `SETUP.md` to document local Convex + Next steps and required environment variables.

---

## Quick File Map (important paths)

- `src/stack/client.js` — Stack client config (baseUrl, keys)
- `src/app/layout.js` — Root layout wiring StackProvider
- `src/app/AuthProvider.jsx` — Client-side auth wrapper; creates user records in Convex
- `convex/schema.js` — Convex DB schema
- `src` — UI components and pages

---

## Detailed Code Snapshots

Below are complete copies of several important source files (UI, provider, and dashboard components) captured for troubleshooting and reference.

- `src/app/provider.jsx`

```jsx
"use client";
import React, { Suspense } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import AuthProvider from './AuthProvider';

function Provider({ children }) {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <Suspense fallback ={<p>Loading..</p>}>
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
    </Suspense>
  );
}

export default Provider;
```

- `src/app/(main)/layout.jsx`

```jsx
import React from 'react';
import AppHeader from './_components/AppHeader';
export const metadata = {
  title: "Dashboard",
  description: "User dashboard for managing settings and data",
};

export default function DashboardLayout({ children }) {
  return (
  <div>
    <AppHeader/>
    <div className ='p-10 mt-14 md:px-20 lg:px-32 xl:px-56 2xl:px-72'>

    {children}
    </div>
  </div>
  );
}
```

- `src/app/(main)/_components/AppHeader.jsx`

```jsx
"use client";
import React from 'react';
import Image from 'next/image';
import {UserButton} from '@stackframe/stack';

function AppHeader(){
  return (
    <div className='p-3 shadow-sm flex justify-between items-center'>
      <Image src={'/logo.svg'} alt='logo' width={200} height={200}/>
      <UserButton />
    </div>
  );
}

export default AppHeader;
```

- `src/app/(main)/dashboard/page.jsx`

```jsx
import React, { Suspense } from 'react';
import FeatureAssistants from './_components/FeatureAssistants';
import Feedback from './_components/Feedback';
import History from './_components/History';

export default function Dashboard() {
  return (
  <div className="p-8">
    <Suspense fallback={<div>Loading assistants...</div>}>
    <FeatureAssistants/>
    </Suspense>
      
    <div className ='grid grid-cols-1 md:grid-cols-2 gap-10 mt-20'>
    <History/>
    <Feedback/>

    </div>
  </div>
  );
}

```

- `src/app/(main)/dashboard/_components/FeatureAssistants.jsx`

```jsx
"use client";
import React from 'react';
import {BlurFade} from '@/components/ui/blur-fade';
import { CoachingOptions } from '@/services/Options';
import UserInputDialog from './UserInputDialog';
import Image from 'next/image';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
function FeatureAssistants() {
  const user = useUser();
  return (
    <div>
      <div className ='flex justify-between items-center '>
      <div>
       <h2 className='font-medium text-muted-foreground'>My Workspace</h2>
       <h2 className ='text-3xl font-bold'>Welcome Back, {user?.displayName}</h2>
    </div>
    <Button> Profile</Button>
    </div>
    <div className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-10 mt-10'>
       {CoachingOptions.map((option,index)=>(
      <BlurFade key={option.icon} delay ={0.25 + index * 0.05} inView>
        <div className = 'p-3 bg-secondary rounded-3xl flex flex-col justify-center items-center'>
         <UserInputDialog coachingOption={option}>
       <div key={index} className='flex flex-col justify-center items-center'>

        <Image src ={option.icon} alt={option.name}
        width ={150}
        height ={150}
        className='h-[70px] w-[70px] hover:rotate-12 cursor-pointer transition-all'
        />
        <h2 className='mt-2'>{option.name}</h2>
      </div>

        </UserInputDialog>
        </div>
      </BlurFade>
       ))}

          
    </div>
    </div>
  )
}

export default FeatureAssistants;

```

- `src/app/(main)/dashboard/_components/UserInputDialog.jsx`

```jsx
import React, { useState } from 'react';
import {
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CoachingExpert } from '@/services/Options';
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

function  UserInputDialog ({children , coachingOption}){

  const [selectedExpert , setSelectedExpert]  = useState();
  const [ topic , setTopic] = useState();
  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
  const [loading, setLoading] = useState (false);
  const [openDialog, setOpenDialog] = useState(false);

  const router = useRouter();
  const OnClickNext=async()=>{
    setLoading(true);
    const result = await createDiscussionRoom({
      topic: topic,
      coachingOption: coachingOption?.name,
      expertName: selectedExpert,
    })
    console.log(result);

    setLoading(false);
    setOpenDialog(false);
    router.push('/discussion-room/'+ result);
  }
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coachingOption.name}</DialogTitle>
          <DialogDescription asChild>
            <div className='mt-3'>
              <h2 className='text-black'>Enter a topic to master your skills in {coachingOption.name}</h2>
              <Textarea placeholder=" Enter your topic  here ..." className='mt-2' 
              onChange={(e) => setTopic(e.target.value)}
                />

              <h2 className='text-black mt-4'>Select Your Coaching expert</h2>
              <div className='grid grid-cols-3 md:grid-cols-5 gap-6 mt-3'>
                {CoachingExpert.map((expert, index) => (
                  <div key={index} onClick={() => setSelectedExpert(expert.name)} className="flex flex-col items-center cursor-pointer">
                    <Image
                      src={expert.avatar}
                      alt={expert.name}
                      width={100}
                      height={100}
                      className={`rounded-2xl h-20 w-20 object-cover hover:scale-105 transition-all cursor-pointer p-1 border-primary ${selectedExpert === expert.name ? 'border' : ''}`}
                    />
                    <h2 className='text-center'>{expert.name}</h2>
                  </div>
                ))}
                <div className='flex gap-5 justify-end mt-5'>
                  <DialogClose asChild>

                  <Button variant ={'ghost'}>Cancel</Button>

                  </DialogClose>
                  <Button disabled = {(!topic || !selectedExpert || loading)} onClick ={OnClickNext} >
                    {loading&&<LoaderCircle className ='animation-spin' />}
                    Next</Button>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
export default UserInputDialog;
```


If you want, I can:

- run a live verification (check env vars and query the Stack API) and show server logs,
- add a `.env.example`, or
- expand this snapshot with more file-level snapshots (e.g., all files under `src/(main)/_components`).

---

Generated by an automated repo scan. Update or ask for deeper extraction of specific directories if you want a larger code dump.
