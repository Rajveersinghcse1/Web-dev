// WebSocket provider placeholder
const WebSocketProvider = ({ children }: { children: any }) => {
  return children;
};

const useWebSocket = () => {
  return {
    isConnected: false,
    connectionStatus: 'disconnected' as const,
    lastMessage: null,
    sendMessage: () => {},
  };
};

export { WebSocketProvider, useWebSocket };