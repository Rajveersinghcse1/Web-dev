# Coding Society - The AI-Native Developer Ecosystem

## Project Description
Coding Society is not just a learning platform; it is a Career Acceleration Ecosystem powered by Google Gemini 3. It bridges the gap between "learning syntax" and "building production-ready software" by providing every user with an AI Co-Founder.

While traditional platforms offer static tutorials, Coding Society integrates a multimodal AI that acts as a Senior Architect, Product Manager, and Code Reviewer. Users can upload napkin sketches to generate project scaffolding, debug complex full-stack issues with an AI that understands their entire codebase history, and collaborate in a gamified social environment. We are democratizing software engineering mentorship, making FAANG-level guidance accessible to everyone.

## How I built it
I built Coding Society using the MERN stack (MongoDB, Express.js, React, Node.js) supercharged with Google Gemini 3.

AI Engine (The Brain): I utilized Gemini 3's massive context window to ingest the entire project codebase, allowing the AI to provide context-aware debugging and architectural advice rather than generic snippets. I also leveraged Gemini's multimodal capabilities to implement the "Napkin-to-Code" feature, where users upload UI sketches that are instantly converted into React components with Tailwind CSS.

Frontend: Built with React 18 and Vite for performance, styled with Tailwind CSS and shadcn/ui for a modern aesthetic, and animated with Framer Motion to create a polished, app-like feel.

Backend: A robust Node.js/Express server handles authentication and API requests, while MongoDB stores user profiles, social posts, and learning progress.

Storage: MinIO (S3-compatible) is used for handling user uploads (avatars, project assets) securely.

Real-time: Socket.io enables live collaboration and instant AI feedback.

## Why it's important
The biggest hurdle for new developers isn't learning syntax—it's applying it.
1.  Escaping Tutorial Hell: Most learners get stuck following guides without understanding why decisions are made. Coding Society's AI explains the architecture, not just the code.
2.  The "Experience" Paradox: You need experience to get a job, but a job to get experience. Our platform simulates a real-world work environment with AI-driven code reviews and "tickets" (quests), giving users a portfolio that proves they can ship software.
3.  Democratizing Mentorship: Senior mentorship is scarce and expensive. By using Gemini 3 as an "always-on" Senior Engineer, we provide high-quality guidance to anyone, anywhere, for free.

## Checklist
- [ ] Kaggle Writeup (This document)
- [ ] Attached Video Demo (Max 2 mins) - [Insert Public Video Link Here]
- [ ] Attached Public AI Studio App Link - [Insert AI Studio App Link Here]
