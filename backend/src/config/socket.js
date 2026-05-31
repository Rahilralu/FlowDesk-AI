import { Server } from 'socket.io';
import { createClient } from 'redis';

let io;

export const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  const subscriber = createClient({ url: process.env.REDIS_URL });
  await subscriber.connect();

  await subscriber.subscribe('request:classified', (message) => {
    try {
      const data = JSON.parse(message);
      io.emit('request:classified', data);
    } catch (err) {
      console.error('Failed to parse classified message', err);
    }
  });

  await subscriber.subscribe('request:failed', (message) => {
    try {
      const data = JSON.parse(message);
      io.emit('request:failed', data);
    } catch (err) {
      console.error('Failed to parse failed message', err);
    }
  });

  await subscriber.subscribe('request:event', (message) => {
    try {
      const data = JSON.parse(message);
      io.emit('request:event', data);
    } catch (err) {
      console.error('Failed to parse request event message', err);
    }
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};