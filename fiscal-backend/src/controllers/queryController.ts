import { Request, Response } from 'express';
import { getCache, setCache } from '../redis/client';
import { getCityQueue } from '../queues/cityQueue';
import { fetchCityData, buildDeterministicHash } from '../services/cityApiService';
import { aggregateReceitasTrimestre } from '../services/aggregationService';
import { compileDashboardData } from '../services/dashboardService';
import { toErrorPayload } from '../errors';

export async function handleCityQuery(req: Request, res: Response): Promise<any> {
  const { cityId, queryParams } = req.body;
  const userId = req.headers['x-socket-id'] as string;

  if (!cityId || !queryParams) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes: cityId e queryParams.' });
  }

  const tipo = queryParams.tipo || 'receita';
  const hash = buildDeterministicHash(queryParams);
  const cacheKey = `${cityId}_${tipo}_${hash}`;

  try {
    // 1. Cache Check
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Devolvendo ${cacheKey}`);
      return res.json({ status: 'success', source: 'cache', data: cachedData, cacheKey });
    }

    // Se o cliente forneceu x-socket-id, enfileira no BullMQ para resposta assíncrona
    if (userId) {
      console.log(`[Cache Miss] Enfileirando ${cacheKey} na fila de ${cityId} para sala ${userId}`);
      const queue = getCityQueue(cityId);
      await queue.add('fetchData', { userId, queryParams, cacheKey });

      return res.status(202).json({
        status: 'queued',
        message: 'Requisição na fila do Worker. Resultados serão enviados via WebSocket.',
        cacheKey,
      });
    }

    // Se não forneceu WebSocket ID (chamada REST síncrona direta), executa e salva no cache
    console.log(`[REST Sync] Buscando diretamente ${cacheKey} e salvando no cache`);
    const liveData = await fetchCityData(cityId, queryParams);
    await setCache(cacheKey, liveData, 86400);

    return res.json({
      status: 'success',
      source: 'live',
      data: liveData,
      cacheKey,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function handleDirectQuery(req: Request, res: Response): Promise<any> {
  const cityId = (req.query.cityId as string) || 'florianopolis';
  const queryParams = { ...req.query };
  delete queryParams.cityId;

  const tipo = (queryParams.tipo as string) || 'receita';
  const hash = buildDeterministicHash(queryParams);
  const cacheKey = `${cityId}_${tipo}_${hash}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ status: 'success', source: 'cache', data: cached, cacheKey });
    }

    const liveData = await fetchCityData(cityId, queryParams);
    await setCache(cacheKey, liveData, 86400);

    return res.json({ status: 'success', source: 'live', data: liveData, cacheKey });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function handleAggregateQuery(req: Request, res: Response): Promise<any> {
  const { cityId = 'florianopolis', params = {} } = req.body;

  try {
    const result = await aggregateReceitasTrimestre(cityId, params);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleDashboardQuery(req: Request, res: Response): Promise<any> {
  const cityId = (req.params.cityId as string) || 'florianopolis';
  const periodo = (req.query.periodo as string) || '01/2024';
  const userId = req.headers['x-socket-id'] as string;

  const cacheKey = `dashboard_v4_${cityId}_${periodo.replace('/', '_')}`;

  try {
    // 1. Cache Check
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Dashboard Cache Hit] Devolvendo ${cacheKey}`);
      return res.json({
        status: 'success',
        source: 'cache',
        data: { ...cachedData, source: 'cache' },
        cacheKey,
      });
    }

    // 2. Se o cliente forneceu x-socket-id, enfileira o job agregador no BullMQ
    if (userId) {
      console.log(`[Dashboard Cache Miss] Enfileirando ${cacheKey} na fila de ${cityId} para sala ${userId}`);
      const queue = getCityQueue(cityId);
      await queue.add('fetchDashboard', { userId, periodo, cacheKey, cityId });

      return res.status(202).json({
        status: 'queued',
        message: 'Dashboard em processamento no Worker. Resultados serão enviados via WebSocket.',
        cacheKey,
      });
    }

    // 3. Se for requisição REST síncrona sem WebSocket ID, compila direto e salva no cache
    console.log(`[Dashboard REST Sync] Compilando ${cacheKey} e salvando no cache`);
    const liveDashboard = await compileDashboardData(cityId, periodo);
    await setCache(cacheKey, liveDashboard, 86400);

    return res.json({
      status: 'success',
      source: 'live',
      data: { ...liveDashboard, source: 'live' },
      cacheKey,
    });
  } catch (err: any) {
    console.error('[Dashboard Error]', err.message);
    const payload = toErrorPayload(err);
    // 502 Bad Gateway: a falha é do servidor upstream (prefeitura), não do fiscal-backend
    const status = payload.code === 'MUNICIPIO_INDISPONIVEL' ? 502 : 500;
    return res.status(status).json(payload);
  }
}
