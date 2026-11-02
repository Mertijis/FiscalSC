import { Queue, Worker } from 'bullmq';
import { redis } from '../redis/client';
import { fetchCityData } from '../services/cityApiService';
import { compileDashboardData } from '../services/dashboardService';
import { io } from '../socket/io';
import { setCache } from '../redis/client';

export const cityQueues: Record<string, Queue> = {};

export const getCityQueue = (cityId: string) => {
  if (!cityQueues[cityId]) {
    const queue = new Queue(`city_${cityId}`, { connection: redis });
    queue.on('error', (err) => {
      console.error(`[Queue ${cityId} Error]`, err.message);
    });
    cityQueues[cityId] = queue;
    // Inicializa o worker assim que a fila é criada
    createCityWorker(cityId);
  }
  return cityQueues[cityId];
};

export const createCityWorker = (cityId: string) => {
  console.log(`Worker inicializado para a cidade: ${cityId}`);
  const worker = new Worker(`city_${cityId}`, async (job) => {
    // 1. Job de Dashboard Consolidada
    if (job.name === 'fetchDashboard') {
      const { userId, periodo, cacheKey } = job.data;
      console.log(`[Worker ${cityId}] Compilando Dashboard para ${userId} - CacheKey: ${cacheKey}`);
      try {
        const dashboardData = await compileDashboardData(cityId, periodo, (partialPkg) => {
          if (io && userId) {
            console.log(`[Worker ${cityId}] Emitindo dashboard_partial em <400ms para ${userId}`);
            io.to(userId).emit('dashboard_partial', { cacheKey, data: partialPkg });
          }
        });
        await setCache(cacheKey, dashboardData, 86400); // 24 horas
        if (io && userId) {
          io.to(userId).emit('dashboard_result', { cacheKey, data: dashboardData });
        }
      } catch (error: any) {
        console.error(`[Worker ${cityId}] Erro ao compilar dashboard:`, error.message);
        if (io && userId) {
          io.to(userId).emit('dashboard_error', { cacheKey, error: error.message });
        }
        throw error;
      }
      return;
    }

    // 2. Job de Consulta Granular padrão
    const { userId, queryParams, cacheKey } = job.data;
    console.log(`[Worker ${cityId}] Processando job para ${userId} - CacheKey: ${cacheKey}`);
    try {
      // 1. Busca dados na prefeitura
      const result = await fetchCityData(cityId, queryParams);
      
      // 2. Salva no Cache por 24h
      await setCache(cacheKey, result, 86400); 
      
      // 3. Emite o resultado em tempo real para o cliente via sala do userId
      if (io && userId) {
        io.to(userId).emit('query_result', { cacheKey, data: result });
      }
    } catch (error: any) {
      console.error(`[Worker ${cityId}] Erro ao buscar dados:`, error.message);
      if (io) {
        io.to(userId).emit('query_error', { cacheKey, error: error.message });
      }
      throw error;
    }
    
  }, { 
    connection: redis,
    limiter: {
      max: 400, // Limite de 400
      duration: 60000 // Por minuto
    }
  });

  worker.on('error', (err) => {
    console.error(`[Worker ${cityId} Error]`, err.message);
  });

  return worker;
};
