
import { useEffect, useRef, useState, useCallback } from 'react';

export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
  UNINSTANTIATED = -1,
}

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
}

interface UseWebSocketReturn {
  sendMessage: (message: string) => void;
  lastMessage: WebSocketEventMap['message'] | null;
  readyState: ReadyState;
  getWebSocket: () => WebSocket | null;
}

function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    onOpen,
    onClose,
    onMessage,
    onError,
  } = options;

  const webSocketRef = useRef<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.UNINSTANTIATED);
  const [lastMessage, setLastMessage] = useState<WebSocketEventMap['message'] | null>(null);
  const reconnectCount = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === ReadyState.OPEN) {
      return;
    }


    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    

    webSocketRef.current = new WebSocket(url);
    setReadyState(ReadyState.CONNECTING);

    webSocketRef.current.onopen = (event) => {
      setReadyState(ReadyState.OPEN);
      reconnectCount.current = 0;
      if (onOpen) onOpen(event);
    };

    webSocketRef.current.onclose = (event) => {
      setReadyState(ReadyState.CLOSED);
      
      if (!event.wasClean && reconnectCount.current < reconnectAttempts) {
        reconnectCount.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
      
      if (onClose) onClose(event);
    };

    webSocketRef.current.onmessage = (event) => {
      setLastMessage(event);
      if (onMessage) onMessage(event);
    };

    webSocketRef.current.onerror = (event) => {
      if (onError) onError(event);
    };
  }, [url, reconnectAttempts, reconnectInterval, onOpen, onClose, onMessage, onError]);


  useEffect(() => {
    connect();


    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [connect]);


  const sendMessage = useCallback((message: string) => {
    if (webSocketRef.current?.readyState === ReadyState.OPEN) {
      webSocketRef.current.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  
  const getWebSocket = useCallback(() => webSocketRef.current, []);

  return {
    sendMessage,
    lastMessage,
    readyState,
    getWebSocket,
  };
}

export default useWebSocket;