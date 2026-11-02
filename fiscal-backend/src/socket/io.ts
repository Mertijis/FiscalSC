import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

export let io: SocketIOServer;

export function initSocket(server: Server) {
  io = new SocketIOServer(server, {
    maxHttpBufferSize: 20 * 1024 * 1024, // 20 MB para suportar payloads de 500-1000 registros
    cors: {
      origin: '*', // Ajuste em produção para a URL do Next.js
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    
    // O cliente vai emitir 'join' passando um ID único para criar uma sala privada
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} entrou na sala ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}
