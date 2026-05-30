import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axios';

export const useSocket = (onClassified, onFailed) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) return; // already connected, don't reconnect

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
      auth: { token: getAccessToken() },
      reconnection: true,
    });

    socketRef.current.on('request:classified', onClassified);
    socketRef.current.on('request:failed', onFailed);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []); // empty deps — only runs once
};