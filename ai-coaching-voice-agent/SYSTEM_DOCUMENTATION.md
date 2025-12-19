# AI Coaching Voice Agent - Complete System Documentation

## 🎯 Project Overview

An advanced AI-powered voice coaching application that enables real-time speech-based interactions with AI coaches for learning, interview practice, meditation, and language skills development.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI COACHING VOICE AGENT                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (Next.js 14)                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │   Dashboard  │  │ Discussion   │  │    View Summary Page     │   │   │
│  │  │    Page      │  │  Room Page   │  │  (Feedback + History)    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  │         │                  │                      │                   │   │
│  │         └──────────────────┼──────────────────────┘                   │   │
│  │                            │                                           │   │
│  │  ┌─────────────────────────▼─────────────────────────────────────┐   │   │
│  │  │                    GLOBAL SERVICES                              │   │   │
│  │  ├─────────────────────────────────────────────────────────────────┤   │   │
│  │  │  • OpenRouter AI Integration (Gemini 2.0)                       │   │   │
│  │  │  • Text-to-Speech (Python Server + Browser Fallback)            │   │   │
│  │  │  • Speech-to-Text (AssemblyAI + Web Speech API Fallback)        │   │   │
│  │  │  • PDF Export                                                    │   │   │
│  │  │  • Error Handling & Retry Logic                                  │   │   │
│  │  │  • Network Status Monitoring                                     │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                         EXTERNAL SERVICES                              │   │
│  ├───────────────────────────────────────────────────────────────────────┤   │
│  │                                                                        │   │
│  │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │   │
│  │  │   OpenRouter    │   │   AssemblyAI    │   │  Python TTS     │     │   │
│  │  │   (AI Model)    │   │  (Speech-to-    │   │   Server        │     │   │
│  │  │                 │   │    Text)        │   │  (gTTS + PDF)   │     │   │
│  │  │  Gemini 2.0     │   │                 │   │                 │     │   │
│  │  │  Flash (Free)   │   │  Real-time      │   │  Port: 5000     │     │   │
│  │  └─────────────────┘   │  Transcription  │   └─────────────────┘     │   │
│  │                        └─────────────────┘                            │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                         DATABASE (Convex)                              │   │
│  ├───────────────────────────────────────────────────────────────────────┤   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  users                    │  DiscussionRoom                      │ │   │
│  │  │  ────────────────────     │  ────────────────────────────────    │ │   │
│  │  │  • name                   │  • topic                             │ │   │
│  │  │  • email                  │  • coachingOption                    │ │   │
│  │  │  • credits                │  • expertName                        │ │   │
│  │  │  • subscriptionId         │  • conversation[] (stored history)   │ │   │
│  │  │                           │  • summery (AI feedback)             │ │   │
│  │  │                           │  • uid (user reference)              │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
User Speaks → Microphone → RecordRTC → AssemblyAI/Web Speech API
                                              │
                                              ▼
                                    [Transcribed Text]
                                              │
                                              ▼
                                    Add to Conversation
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │    OpenRouter (Gemini 2.0)    │
                              │    Context: Last 10 messages  │
                              │    + System Prompt            │
                              └───────────────────────────────┘
                                              │
                                              ▼
                                    [AI Response]
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                              ▼                               ▼
                      Add to Chat              Save to Convex DB
                        Display                (conversation[])
                              │                               
                              ▼                               
                    ┌─────────────────┐                       
                    │  Python TTS     │                       
                    │  (or Browser)   │                       
                    └─────────────────┘                       
                              │                               
                              ▼                               
                      Audio Playback                          
                      (Coach speaks)                          
```

## 🚀 Features

### Core Features
| Feature | Status | Description |
|---------|--------|-------------|
| Real-time Speech Recognition | ✅ | AssemblyAI with Web Speech API fallback |
| Text-to-Speech | ✅ | Python gTTS server with browser fallback |
| AI Coaching | ✅ | OpenRouter Gemini 2.0 Flash (free tier) |
| Conversation Storage | ✅ | Convex database with real-time sync |
| Session History | ✅ | View and manage past sessions |
| Feedback Generation | ✅ | AI-generated summaries and feedback |

### Advanced Features (NEW)
| Feature | Description | Academic Value |
|---------|-------------|----------------|
| Dual STT Fallback | AssemblyAI → Web Speech API | Demonstrates fault tolerance |
| Dual TTS Fallback | Python Server → Browser API | Shows graceful degradation |
| Real-time Transcript | Live preview of speech | Improves user experience |
| Service Health Monitor | Live status of all services | Production-ready monitoring |
| PDF Export | Export sessions as PDF | Professional documentation |
| Copy to Clipboard | Quick sharing of messages | User convenience |
| Audio Level Visualization | Real-time audio feedback | Interactive UI |
| Markdown Rendering | Rich AI responses | Better content display |
| Network Status Detection | Online/offline awareness | Robust error handling |
| Rate Limiting | Server-side protection | Security best practice |

## 📁 Project Structure

```
ai-coaching-voice-agent/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── discussion-room/     # Voice chat room
│   │   │   └── view-summery/        # Session review
│   │   ├── api/
│   │   │   └── getToken/            # AssemblyAI token endpoint
│   │   └── globals.css              # Enhanced animations
│   ├── components/
│   │   ├── ui/                      # Shadcn UI components
│   │   └── ServiceStatus.jsx        # Service health monitor
│   └── services/
│       ├── GlobalServices.jsx       # Core services (AI, TTS, STT)
│       └── Options.jsx              # Coaching options config
├── convex/
│   ├── schema.js                    # Database schema
│   ├── DiscussionRoom.js            # Room mutations/queries
│   └── users.js                     # User mutations/queries
├── python-tts/
│   ├── speech_server.py             # Enhanced TTS server
│   ├── requirements.txt             # Python dependencies
│   └── start-tts-server.bat         # Windows startup script
└── public/                          # Static assets
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Environment Variables
Create `.env.local` with:
```env
# Convex
CONVEX_DEPLOYMENT=your_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# AssemblyAI (for speech-to-text)
ASSEMBLY_API_KEY=your_assemblyai_key

# OpenRouter (for AI)
NEXT_PUBLIC_AI_OPENROUTER=your_openrouter_key

# Stack Auth (optional)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
STACK_SECRET_SERVER_KEY=your_server_key
```

### Installation

1. **Install Node dependencies:**
```bash
npm install
```

2. **Set up Python TTS server:**
```bash
cd python-tts
pip install -r requirements.txt
```

3. **Start Convex:**
```bash
npx convex dev
```

4. **Start Python TTS Server:**
```bash
cd python-tts
python speech_server.py
# Or use: start-tts-server.bat (Windows)
```

5. **Start Next.js:**
```bash
npm run dev
```

## 🧪 Verification Checklist

### Speech System
- [ ] Microphone permission granted
- [ ] AssemblyAI token fetched successfully
- [ ] Web Speech API fallback works
- [ ] Real-time transcript appears
- [ ] Final transcript shows in chat

### AI Integration
- [ ] OpenRouter responds to messages
- [ ] Conversation context maintained
- [ ] Error messages are user-friendly
- [ ] Rate limiting works

### Text-to-Speech
- [ ] Python server responds (http://localhost:5000/health)
- [ ] AI responses are spoken
- [ ] Browser fallback works if server down
- [ ] Stop speaking button works

### Data Persistence
- [ ] Conversations saved to Convex
- [ ] History shows past sessions
- [ ] Feedback is generated and saved
- [ ] Sessions can be deleted

### Export & Sharing
- [ ] PDF export downloads file
- [ ] Text export works as fallback
- [ ] Copy to clipboard works
- [ ] Share link copies URL

## 🔍 Troubleshooting

### "Speech recognition not working"
1. Check microphone permissions in browser
2. Verify ASSEMBLY_API_KEY is set
3. Check if Web Speech API is supported (Chrome recommended)
4. Look for errors in browser console

### "AI not responding"
1. Verify NEXT_PUBLIC_AI_OPENROUTER key
2. Check network connection
3. View OpenRouter dashboard for quota
4. Check browser console for errors

### "TTS not working"
1. Ensure Python server is running on port 5000
2. Check http://localhost:5000/health
3. Browser fallback should still work
4. Check browser audio permissions

### "Conversations not saving"
1. Verify Convex is running
2. Check CONVEX_URL in env
3. Look for errors in Convex dashboard
4. Check network tab for failed requests

## 📊 API Endpoints

### Python TTS Server (localhost:5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/tts` | POST | Text-to-speech |
| `/api/tts/stream` | POST | Streaming TTS |
| `/api/tts/offline` | POST | Offline TTS (pyttsx3) |
| `/api/export/pdf` | POST | Export conversation as PDF |

### Next.js API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/getToken` | GET | Get AssemblyAI temporary token |

## 🎓 Academic Value

This project demonstrates:

1. **Full-Stack Development**: Next.js, React, Python Flask
2. **Real-time Systems**: WebSockets, streaming audio
3. **API Integration**: OpenRouter, AssemblyAI, gTTS
4. **Database Design**: Convex with real-time sync
5. **Error Handling**: Graceful degradation, fallbacks
6. **Modern UI/UX**: Tailwind CSS, animations, responsive
7. **Production Patterns**: Rate limiting, health checks, logging
8. **DevOps**: Multi-service architecture, environment management

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

Built with ❤️ for academic excellence and practical learning.
