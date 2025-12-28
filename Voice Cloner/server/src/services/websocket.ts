import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export const setupWebSocket = (io: Server) => {
  logger.info('Setting up WebSocket server');

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle voice streaming events
    socket.on('voice:start', (data) => {
      logger.info(`Voice streaming started for ${socket.id}`);
      socket.emit('voice:started', { sessionId: socket.id });
    });

    socket.on('voice:data', (audioData) => {
      // Process audio data here
      // For now, just echo it back
      socket.emit('voice:processed', audioData);
    });

    socket.on('voice:stop', () => {
      logger.info(`Voice streaming stopped for ${socket.id}`);
      socket.emit('voice:stopped');
    });

    // Handle real-time processing events
    socket.on('realtime:connect', (config) => {
      logger.info(`Real-time processing connection for ${socket.id}`);
      socket.emit('realtime:connected', { 
        status: 'connected',
        latency: Math.random() * 50 + 100 // Simulated latency
      });
    });

    socket.on('realtime:audio', (audioData) => {
      // Process real-time audio here
      // For now, simulate processing delay
      setTimeout(() => {
        socket.emit('realtime:result', {
          processedAudio: audioData,
          timestamp: Date.now()
        });
      }, 50);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket server setup complete');
};