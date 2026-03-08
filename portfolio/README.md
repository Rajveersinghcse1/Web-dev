# Rajveer Singh - Portfolio

A premium, data-driven personal portfolio built with Next.js 16 (App Router), React, Three.js, and Vanilla CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules) + Strict Token System
- **Visuals**: Three.js (@react-three/fiber)
- **Runtime**: Node.js (Compatible with Bun)

## Getting Started

First, install dependencies:

```bash
npm install
# or
bun install
```

Run the development server:

```bash
npm run dev
# or 
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design System

The project uses a strict CSS Variable system defined in `src/app/globals.css`.

- **Primary Background**: Obsidian (`#050505`)
- **Accent**: Electric Blue (`#2563eb`)
- **Typography**: Geist Sans / Mono

## Project Structure

- `src/app/`: App Router pages and layouts
- `src/components/`: Modular UI components (Hero, About, Projects, etc.)
- `src/components/*.module.css`: Component-scoped styles
- `src/components/ThreeBackground.tsx`: 3D Particle visualization

## Deployment

The application is optimized for Vercel deployment.
PUSH to a GitHub repository and import into Vercel.
```bash
git init
git add .
git commit -m "Initial commit"
```
