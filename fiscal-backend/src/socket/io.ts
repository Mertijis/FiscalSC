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
    // O ack confirma ao cliente que ele já está na sala, evitando perder eventos emitidos
    // antes do join (ex: erro rápido da prefeitura em ~100ms)
    socket.on('join', (userId: string, ack?: () => void) => {
      socket.join(userId);
      if (typeof ack === 'function') ack();
      console.log(`Socket ${socket.id} entrou na sala ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}
