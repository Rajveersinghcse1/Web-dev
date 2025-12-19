# Team Communication System - Implementation Plan

## 1. Overview
This document outlines the "Ultra Advanced" plan for the Team Communication feature. The goal is to create a real-time, multiplayer coaching session environment with video conferencing, live speech-to-text transcription, and persistent chat history.

## 2. Architecture

### 2.1. Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend/Database:** Convex (Real-time database, Signaling, Chat Storage)
- **Video/Audio:** WebRTC (Peer-to-Peer Mesh Topology via Convex Signaling)
- **Speech-to-Text (STT):** Web Speech API (Client-side, zero latency) + Optional AssemblyAI integration for post-processing.

### 2.2. Data Flow
1.  **Session Creation:** Host creates session -> Convex `teamSessions` table.
2.  **Signaling:** Clients exchange SDP offers/answers/candidates via Convex `signals` table.
3.  **Media:** P2P Video/Audio streams directly between clients.
4.  **Transcription:** 
    *   Client speaks -> Web Speech API converts to text.
    *   Text sent to Convex `messages` table as `type: 'transcript'`.
5.  **Chat:** 
    *   User types -> Convex `messages` table as `type: 'chat'`.
6.  **Storage:** All messages (chat + transcripts) persisted in Convex.

## 3. Database Schema (Convex)

### `teamSessions` (Update)
- `hostId`: string
- `topic`: string
- `maxParticipants`: number (New)
- `status`: 'waiting' | 'active' | 'completed'
- `participants`: Array<{ userId, name, avatar, ... }>

### `messages` (New)
- `sessionId`: id('teamSessions')
- `userId`: string
- `userName`: string
- `content`: string
- `type`: 'chat' | 'transcript' | 'system'
- `timestamp`: number

### `signals` (New - For WebRTC)
- `sessionId`: id('teamSessions')
- `senderId`: string
- `receiverId`: string
- `type`: 'offer' | 'answer' | 'candidate'
- `payload`: string (JSON)

## 4. User Interface Flow

### 4.1. Create Session (Enhanced)
- **Inputs:** 
    - Topic (e.g., "Design Review")
    - Max Participants (e.g., 4)
    - Host Name (if guest)
- **Action:** Creates session, redirects to Lobby.

### 4.2. Lobby (Waiting Room)
- **Display:**
    - Session Code (Large, Copyable)
    - List of joined participants (Avatars + Names)
    - "Waiting for host to start..." (for guests)
- **Host Controls:**
    - "Start Session" button (Enabled only when `participants.length > 1`)

### 4.3. Live Session (The "Window")
- **Layout:**
    - **Main Stage:** Grid of video feeds (User + Peers).
    - **Sidebar/Overlay:** Real-time Chat & Transcription Log.
- **Features:**
    - **Video:** Toggle Camera/Mic.
    - **Live Captions:** As users speak, text appears in the chat stream automatically.
    - **Export:** "Export Chat" button -> Downloads `.txt` or `.json` of the session.
    - **End Session:** Host can end the session for everyone.

## 5. Implementation Steps

1.  **Schema Update:** Add `messages` and `signals` tables; update `teamSessions`.
2.  **Backend Functions:** Create mutations for signaling and messaging.
3.  **UI - Create/Lobby:** Update `TeamSessions.jsx` to support max participants and waiting logic.
4.  **UI - Live Session:** 
    - Implement `VideoGrid` component.
    - Implement `ChatBox` with STT integration.
    - Implement `WebRTC` signaling logic using Convex.

## 6. "Ultra Advanced" Features
- **Auto-Save:** Chat is saved automatically (Convex handles this by default).
- **Hybrid Chat:** Distinguishes between spoken words (Transcript) and typed messages (Chat) visually.
- **Export:** One-click download of the entire conversation.

