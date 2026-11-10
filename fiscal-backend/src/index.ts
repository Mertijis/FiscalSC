import express from 'express';
import http from 'http';
import cors from 'cors';
import routes from './routes';
import { initSocket } from './socket/io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-socket-id', 'Authorization'],
  exposedHeaders: ['x-socket-id']
}));
app.use(express.json({ limit: '20mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', worker: 'fiscal-backend', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

const server = http.createServer(app);

// Inicializa WebSocket
initSocket(server);

const PORT = process.env.PORT || 3001;

import { compileDashboardData } from './services/dashboardService';
import { setCache, getCache } from './redis/client';

server.listen(PORT, () => {
  console.log(`🚀 Fiscal Backend (Worker) rodando na porta ${PORT}`);

  // Pre-aquecimento em segundo plano dos dashboards padrão (10/2026) para resposta instantânea (<10ms)
  setTimeout(async () => {
    const citiesToWarm = ['florianopolis', 'joinville', 'itajai', 'chapeco'];
    for (const cityId of citiesToWarm) {
      try {
        const cacheKey = `dashboard_v4_${cityId}_10_2026`;
        const existing = await getCache(cacheKey);
        if (!existing) {
          console.log(`[Cache Warm-up] Pré-aquecendo ${cacheKey} em segundo plano...`);
          const data = await compileDashboardData(cityId, '10/2026');
          await setCache(cacheKey, data, 86400);
          console.log(`[Cache Warm-up] ${cacheKey} pré-aquecido com sucesso!`);
        } else {
          console.log(`[Cache Warm-up] ${cacheKey} já presente no Redis.`);
        }
      } catch (e: any) {
        console.warn(`[Cache Warm-up Aviso (${cityId})]`, e.message);
      }
    }
  }, 1000);
});

process.on('uncaughtException', (err) => {
  console.error('[Worker Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Worker Unhandled Rejection]', reason);
});
