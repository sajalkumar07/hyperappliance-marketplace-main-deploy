// @ts-nocheck

import { Server as IOServer } from 'socket.io';
import { NextApiResponse } from 'next';

let io: IOServer | null = null;

export const setupSocket = (res: NextApiResponse): IOServer => {
  if (!io) {
    io = new IOServer((res.socket as any).server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      const { userId } = socket.handshake.query;
      if (userId && typeof userId === 'string') {
        socket.join(userId);
      }
    });
  }
  return io;
};

export const getIO = (): IOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 