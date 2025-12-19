# Phase 9: Network Accessibility & Configuration

## Overview
This phase focused on enabling the application to be accessed from other devices on the same network (LAN), such as mobile phones or other computers. This involved configuring the Next.js server, Python backend servers, and client-side service definitions to support external connections and dynamic host resolution.

## Changes Implemented

### 1. Next.js Server Configuration
- **File**: `package.json`
- **Change**: Updated the `dev` script to bind to all network interfaces (`0.0.0.0`) instead of just `localhost`.
- **Command**: `next dev -H 0.0.0.0`
- **Impact**: Allows the Next.js application to be accessed via the host machine's LAN IP address (e.g., `http://192.168.1.x:3000`).

### 2. Python Backend Configuration (CORS)
- **Files**: `python-tts/app.py`, `python-tts/speech_server.py`
- **Change**: Updated CORS (Cross-Origin Resource Sharing) settings to allow requests from any origin (`origins="*"`) or specifically configured patterns.
- **Impact**: Prevents browser security blocks when a device at `192.168.1.x:3000` tries to fetch data from the Python server.

### 3. Client-Side Service Discovery
- **File**: `src/services/GlobalServices.jsx`
- **Change**: Replaced the hardcoded `PYTHON_TTS_URL: 'http://localhost:5000'` with a dynamic getter function.
- **Logic**:
  ```javascript
  const getPythonTTSUrl = () => {
      if (typeof window !== 'undefined') {
          return `http://${window.location.hostname}:5000`;
      }
      return 'http://localhost:5000';
  };
  ```
- **Impact**: When a user accesses the app from a phone, the app will correctly look for the Python server at the *server's* IP address, not the phone's local address.

## Verification Steps
1. **Find your LAN IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IPv4 address (e.g., `192.168.1.5`).
2. **Start Servers**:
   - Run `npm run dev`
   - Run `python-tts/start-tts-server.bat`
3. **Access from Mobile**:
   - Open a browser on your phone connected to the same Wi-Fi.
   - Navigate to `http://<YOUR_IP>:3000`.
4. **Test Features**:
   - Try logging in (Stack Auth).
   - Try the "Speech" chat mode to verify the connection to the Python TTS server.

## Notes on Authentication
- **Stack Auth**: If you encounter login issues on the new network IP, ensure that your Stack Auth project settings allow the new domain/IP or that you are in "Development" mode which is often more permissive.
