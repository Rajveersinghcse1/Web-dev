# 🚀 Coding Society - The Game Changer

A modern, comprehensive coding education and community platform built with React, featuring interactive learning tools, social networking, and career development resources.

![Coding Society](https://img.shields.io/badge/React-18+-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3+-green.svg)
![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🎯 Core Functionality
- **Complete Authentication System** - Login, Register, Password Reset with role-based access
- **Social Feed** - Instagram-like interface for sharing code snippets and posts
- **Interactive Code Editor** - Multi-file editor with live preview and console output
- **Learning Roadmaps** - Structured learning paths for Frontend, Backend, AI/ML, DevOps
- **Quiz System** - Interactive coding quizzes with real-time scoring and leaderboards
- **Research Hub** - Discover and share research papers with peer review system
- **Career Portal** - Internship listings, hackathons, and portfolio builder

### 🎨 Design & UX
- **Mobile-First Responsive Design** - Works perfectly on all screen sizes
- **Dark/Light Mode** - System preference detection with manual toggle
- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **Smooth Animations** - Framer Motion integration for enhanced user experience
- **Accessibility** - WCAG compliant with proper ARIA labels

### 🔧 Technical Features
- **React 18** with modern hooks and patterns
- **TypeScript Ready** - Easy migration path
- **Component Architecture** - Reusable, maintainable component structure
- **State Management** - Context API with local storage persistence
- **Routing** - Protected routes with role-based access control
- **API Ready** - Placeholder API calls ready for backend integration

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, JavaScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State:** React Context API + localStorage
- **Package Manager:** npm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/1Rajveer-Singh/CODING-SOCIETY.git
   cd CODING-SOCIETY
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📱 Pages & Features

### 🏠 Home Page
- Hero section with call-to-action
- Feature showcase with animations
- Trending posts preview
- Responsive navigation with hamburger menu

### 🔐 Authentication
- **Login** - Email/password with "Remember me"
- **Register** - Multi-role signup (Student/Admin/Management)
- **Password Reset** - Email-based recovery system
- **Role-based UI** - Different interfaces based on user role

### 👤 Profile Management
- **Profile Dashboard** - Avatar, bio, social links, statistics
- **Post History** - User's posts with engagement metrics
- **Achievements** - Gamified progress tracking
- **Settings** - Privacy controls and preferences

### 📱 Social Feed
- **Create Posts** - Text, code snippets, images
- **Engagement** - Like, comment, share, follow
- **Search & Filter** - Find posts by topic, author, tags
- **Infinite Scroll** - Smooth content loading

### 🗺️ Interactive Roadmaps
- **Learning Paths** - Frontend, Backend, AI/ML, DevOps
- **Progress Tracking** - Visual completion indicators
- **AI Suggestions** - Personalized learning recommendations
- **Skill Assessment** - Self-evaluation tools

### 💻 Code Editor
- **Multi-file Support** - HTML, CSS, JavaScript tabs
- **Live Preview** - Real-time HTML/CSS rendering
- **Console Output** - JavaScript execution results
- **Save & Share** - Project persistence and sharing

### 🏆 Quiz System
- **Interactive Quizzes** - Multiple choice with timer
- **Real-time Scoring** - Instant feedback and results
- **Leaderboards** - Community competition
- **Progress Analytics** - Performance tracking

### 🔬 Research Hub
- **Paper Discovery** - Browse and search research papers
- **Peer Review** - Community-driven quality control
- **Download & Preview** - PDF viewing and access
- **Trending Topics** - Popular research areas

### 💼 Career Development
- **Progress Dashboard** - Skills and achievement tracking
- **Internship Portal** - Job listings with application tracking
- **Hackathon Calendar** - Event discovery and registration
- **Portfolio Builder** - Professional profile creation

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── tabs.jsx
│   │   └── index.js
│   └── Navigation.jsx      # Main navigation component
├── pages/
│   ├── HomePage.jsx        # Landing page
│   ├── AuthPage.jsx        # Authentication
│   ├── ProfilePage.jsx     # User profiles
│   ├── FeedPage.jsx        # Social feed
│   ├── RoadmapPage.jsx     # Learning paths
│   ├── CodingPage.jsx      # Code editor
│   ├── QuizPage.jsx        # Quiz system
│   ├── ResearchPage.jsx    # Research hub
│   └── CareerPage.jsx      # Career portal
├── context/
│   └── AuthContext.jsx     # Authentication state
├── lib/
│   └── utils.js           # Utility functions
├── App.jsx                # Main app component
└── main.jsx              # App entry point
```

## 🎨 UI Components

Built with **shadcn/ui** for consistent, accessible design:

- **Button** - Various styles and sizes
- **Card** - Content containers with headers
- **Input** - Form inputs with validation
- **Label** - Accessible form labels
- **Tabs** - Navigation between content sections

## 🔄 State Management

### Authentication Context
```javascript
const { user, login, register, logout, isAuthenticated } = useAuth();
```

### Features
- **Persistent Sessions** - localStorage integration
- **Role-based Access** - Different UI for user roles
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages

## 🌐 API Integration Ready

The application includes placeholder API calls that can be easily replaced with real backend endpoints:

```javascript
// Example API structure
const login = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Perfect medium screen experience
- **Desktop Enhanced** - Full feature utilization on large screens
- **Touch Friendly** - Proper touch targets and gestures

## 🌙 Dark Mode

- **System Preference** - Automatic detection
- **Manual Toggle** - User-controlled switching
- **Consistent Theming** - All components support both modes
- **Smooth Transitions** - Animated mode switching

## 🚀 Performance

- **Vite Build** - Lightning-fast development and builds
- **Code Splitting** - Optimized bundle sizes
- **Lazy Loading** - Components loaded on demand
- **Optimized Images** - Responsive image loading

## 🔒 Security

- **Input Validation** - Client-side validation for all forms
- **XSS Protection** - Proper data sanitization
- **CSRF Ready** - Token-based protection ready
- **Secure Routing** - Protected routes with authentication

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Video call integration for mentoring
- [ ] Advanced code collaboration
- [ ] AI-powered code review
- [ ] Mobile app development
- [ ] Integration with GitHub/GitLab
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - For beautiful, accessible components
- **Tailwind CSS** - For utility-first styling
- **Lucide** - For consistent iconography
- **React Team** - For the amazing framework

## 📞 Support

For support, email support@codingsociety.dev or join our Discord community.

---

**Made with ❤️ by the Coding Society Team**

⭐ Star this repository if you found it helpful!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
