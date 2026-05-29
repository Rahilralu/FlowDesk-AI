import { Server } from 'socket.io';

let io;

export const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Admin connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Admin disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};