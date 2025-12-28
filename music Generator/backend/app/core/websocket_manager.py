"""
WebSocket manager for real-time communication
"""

import asyncio
import json
import logging
import uuid
from typing import Dict, List, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

from app.utils.logger import WebSocketLogger

logger = logging.getLogger(__name__)
ws_logger = WebSocketLogger(logger)

class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_info: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        
        # Generate unique client ID
        client_id = str(uuid.uuid4())
        
        # Store connection
        self.active_connections[client_id] = websocket
        self.connection_info[client_id] = {
            "connected_at": datetime.now(),
            "client_host": websocket.client.host if websocket.client else "unknown",
            "last_activity": datetime.now()
        }
        
        ws_logger.log_connection(client_id, websocket.client.host if websocket.client else "unknown")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "client_id": client_id,
            "message": "Connected to AI Music Generator",
            "timestamp": datetime.now().isoformat()
        }, websocket)
        
        return client_id
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
        if client_id in self.connection_info:
            del self.connection_info[client_id]
            
        ws_logger.log_disconnection(client_id)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
    
    async def send_message_to_client(self, message: dict, client_id: str):
        """Send message to specific client by ID"""
        if client_id in self.active_connections:
            await self.send_personal_message(message, self.active_connections[client_id])
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send broadcast to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_client_info(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific client"""
        return self.connection_info.get(client_id)

class WebSocketManager:
    """Main WebSocket manager with message handling"""
    
    def __init__(self):
        self.connection_manager = ConnectionManager()
        self.generation_tasks: Dict[str, asyncio.Task] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        """Handle new WebSocket connection"""
        return await self.connection_manager.connect(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Handle WebSocket disconnection"""
        # Find client ID by websocket
        client_id = None
        for cid, ws in self.connection_manager.active_connections.items():
            if ws == websocket:
                client_id = cid
                break
        
        if client_id:
            # Cancel any ongoing generation tasks
            if client_id in self.generation_tasks:
                self.generation_tasks[client_id].cancel()
                del self.generation_tasks[client_id]
            
            self.connection_manager.disconnect(client_id)
    
    async def handle_message(self, websocket: WebSocket, data: dict, model_manager):
        """Handle incoming WebSocket messages"""
        message_type = data.get("type", "unknown")
        client_id = data.get("client_id")
        
        if not client_id:
            await self.send_error(websocket, "Client ID required")
            return
        
        ws_logger.log_message(client_id, message_type)
        
        try:
            if message_type == "ping":
                await self.handle_ping(websocket, client_id)
            
            elif message_type == "generate_music":
                await self.handle_music_generation(websocket, client_id, data, model_manager)
            
            elif message_type == "generate_audio":
                await self.handle_audio_generation(websocket, client_id, data, model_manager)
            
            elif message_type == "cancel_generation":
                await self.handle_cancel_generation(websocket, client_id)
            
            elif message_type == "get_status":
                await self.handle_status_request(websocket, client_id, model_manager)
            
            else:
                await self.send_error(websocket, f"Unknown message type: {message_type}")
        
        except Exception as e:
            ws_logger.log_error(client_id, str(e))
            await self.send_error(websocket, str(e))
    
    async def handle_ping(self, websocket: WebSocket, client_id: str):
        """Handle ping message"""
        await self.connection_manager.send_personal_message({
            "type": "pong",
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    async def handle_music_generation(self, websocket: WebSocket, client_id: str, data: dict, model_manager):
        """Handle music generation request"""
        prompt = data.get("prompt", "")
        duration = data.get("duration", 10.0)
        model_size = data.get("model_size", "small")
        
        if not prompt:
            await self.send_error(websocket, "Prompt is required")
            return
        
        # Cancel any existing generation task
        if client_id in self.generation_tasks:
            self.generation_tasks[client_id].cancel()
        
        # Start new generation task
        task = asyncio.create_task(
            self.generate_music_task(websocket, client_id, prompt, duration, model_size, model_manager)
        )
        self.generation_tasks[client_id] = task
        
        # Send generation started message
        await self.connection_manager.send_personal_message({
            "type": "generation_started",
            "prompt": prompt,
            "duration": duration,
            "model_size": model_size,
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    async def generate_music_task(self, websocket: WebSocket, client_id: str, 
                                 prompt: str, duration: float, model_size: str, model_manager):
        """Background task for music generation"""
        try:
            # Send progress updates
            await self.send_progress(websocket, client_id, 0, "Loading model...")
            
            # Generate music
            wav, sample_rate = await model_manager.generate_music(
                prompt=prompt,
                duration=duration,
                model_size=model_size
            )
            
            await self.send_progress(websocket, client_id, 50, "Processing audio...")
            
            # Convert to format suitable for frontend
            import numpy as np
            audio_data = wav.cpu().numpy()[0]  # Take first channel
            
            await self.send_progress(websocket, client_id, 90, "Finalizing...")
            
            # Send completion message with audio data
            await self.connection_manager.send_personal_message({
                "type": "generation_complete",
                "prompt": prompt,
                "duration": duration,
                "sample_rate": sample_rate,
                "audio_shape": audio_data.shape,
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            await self.send_progress(websocket, client_id, 100, "Complete!")
            
        except asyncio.CancelledError:
            await self.connection_manager.send_personal_message({
                "type": "generation_cancelled",
                "timestamp": datetime.now().isoformat()
            }, websocket)
        except Exception as e:
            await self.send_error(websocket, f"Generation failed: {str(e)}")
        finally:
            if client_id in self.generation_tasks:
                del self.generation_tasks[client_id]
    
    async def handle_audio_generation(self, websocket: WebSocket, client_id: str, data: dict, model_manager):
        """Handle audio effect generation request"""
        prompt = data.get("prompt", "")
        duration = data.get("duration", 5.0)
        
        if not prompt:
            await self.send_error(websocket, "Prompt is required")
            return
        
        # Similar to music generation but for audio effects
        task = asyncio.create_task(
            self.generate_audio_task(websocket, client_id, prompt, duration, model_manager)
        )
        self.generation_tasks[client_id] = task
    
    async def generate_audio_task(self, websocket: WebSocket, client_id: str,
                                 prompt: str, duration: float, model_manager):
        """Background task for audio effect generation"""
        try:
            await self.send_progress(websocket, client_id, 0, "Loading AudioGen model...")
            
            wav, sample_rate = await model_manager.generate_audio_effect(
                prompt=prompt,
                duration=duration
            )
            
            await self.send_progress(websocket, client_id, 70, "Processing audio...")
            
            import numpy as np
            audio_data = wav.cpu().numpy()[0]
            
            await self.connection_manager.send_personal_message({
                "type": "audio_generation_complete",
                "prompt": prompt,
                "duration": duration,
                "sample_rate": sample_rate,
                "audio_shape": audio_data.shape,
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            await self.send_progress(websocket, client_id, 100, "Complete!")
            
        except asyncio.CancelledError:
            await self.connection_manager.send_personal_message({
                "type": "generation_cancelled",
                "timestamp": datetime.now().isoformat()
            }, websocket)
        except Exception as e:
            await self.send_error(websocket, f"Audio generation failed: {str(e)}")
        finally:
            if client_id in self.generation_tasks:
                del self.generation_tasks[client_id]
    
    async def handle_cancel_generation(self, websocket: WebSocket, client_id: str):
        """Handle generation cancellation"""
        if client_id in self.generation_tasks:
            self.generation_tasks[client_id].cancel()
            await self.connection_manager.send_personal_message({
                "type": "generation_cancelled",
                "timestamp": datetime.now().isoformat()
            }, websocket)
        else:
            await self.send_error(websocket, "No active generation to cancel")
    
    async def handle_status_request(self, websocket: WebSocket, client_id: str, model_manager):
        """Handle status request"""
        status = {
            "type": "status",
            "models_ready": model_manager.is_ready() if model_manager else False,
            "active_connections": self.connection_manager.get_connection_count(),
            "has_active_generation": client_id in self.generation_tasks,
            "timestamp": datetime.now().isoformat()
        }
        
        if model_manager:
            status["memory_usage"] = model_manager.get_memory_usage()
        
        await self.connection_manager.send_personal_message(status, websocket)
    
    async def send_progress(self, websocket: WebSocket, client_id: str, 
                           progress: int, message: str):
        """Send progress update"""
        await self.connection_manager.send_personal_message({
            "type": "progress",
            "progress": progress,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    async def send_error(self, websocket: WebSocket, error_message: str):
        """Send error message"""
        await self.connection_manager.send_personal_message({
            "type": "error",
            "error": error_message,
            "timestamp": datetime.now().isoformat()
        }, websocket)