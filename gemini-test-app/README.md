# Free Prep - AI-Powered Test Generator

<p align="center">
  <img src="public/favicon.svg" alt="Free Prep Logo" width="80" height="80">
</p>

<p align="center">
  <strong>Generate unlimited AI-powered practice tests for competitive exams</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 🎯 Overview

Free Prep is an AI-powered test generator that helps students prepare for competitive exams like Railway, SSC, JEE, NEET, Banking, and UPSC. Using Google's Gemini AI, it generates realistic practice questions that match real exam patterns.

## ✨ Features

- **🤖 AI-Powered Questions**: Gemini AI generates questions from real exam patterns
- **📝 Multiple Exam Support**: Railway, SSC, JEE, NEET, Banking, UPSC, and more
- **⏱️ Timed Practice**: Simulate real exam conditions with customizable time limits
- **📊 Detailed Analytics**: Track performance with comprehensive reports and time analysis
- **🔐 User Authentication**: Secure sign-in with Stack Auth
- **💾 Progress Tracking**: Save test history and track improvement over time
- **🏆 Leaderboard**: Compare your performance with other students

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google Gemini API Key (free from [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/free-prep.git
cd free-prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with the following:
VITE_CONVEX_URL=your_convex_deployment_url
VITE_STACK_PROJECT_ID=your_stack_auth_project_id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_auth_publishable_key
```

4. Start Convex dev server:
```bash
npx convex dev
```

5. In another terminal, start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4
- **Build Tool**: Vite 7
- **Authentication**: Stack Auth
- **Database**: Convex (real-time serverless database)
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── api/
│   └── gemini.ts        # Gemini AI integration
├── components/
│   ├── LandingPage.tsx  # Landing page with features
│   ├── Dashboard.tsx    # User dashboard
│   ├── ChatBot.tsx      # Test configuration interface
│   ├── TestInterface.tsx # Test taking interface
│   ├── Result.tsx       # Test results and analytics
│   └── ...
├── context/
│   ├── AuthContext.tsx  # Authentication context
│   └── TestContext.tsx  # Test state management
├── lib/
│   └── stack.ts         # Stack Auth configuration
└── types/
    └── index.ts         # TypeScript types

convex/
├── schema.ts            # Database schema
├── users.ts             # User functions
└── testResults.ts       # Test results functions
```

## 🔐 Authentication

The app uses [Stack Auth](https://stack-auth.com/) for authentication. Features include:
- Email/password sign-up and sign-in
- Social logins (configurable)
- Secure session management

## 💾 Database

The app uses [Convex](https://convex.dev/) as a real-time serverless database. Data stored includes:
- User profiles
- Test results and history
- Question analytics

## 🚢 Deployment

### Convex
```bash
npx convex deploy
```

### Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">Made with ❤️ for competitive exam aspirants</p>
