import { getCityAdapter, CityQueryParams } from '../adapters';
import { getCache, setCache } from '../redis/client';
import crypto from 'crypto';

export function buildDeterministicHash(obj: Record<string, any>): string {
  const sortedKeys = Object.keys(obj).sort();
  const normalized: Record<string, any> = {};
  for (const key of sortedKeys) {
    if (obj[key] !== undefined) {
      normalized[key] = obj[key];
    }
  }
  return crypto.createHash('md5').update(JSON.stringify(normalized)).digest('hex');
}

export async function fetchCityData(cityId: string, queryParams: CityQueryParams) {
  const tipo = queryParams.tipo || 'receita';
  const hash = buildDeterministicHash(queryParams);
  const cacheKey = `raw_${cityId}_${tipo}_${hash}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const adapter = getCityAdapter(cityId);
  const data = await adapter.fetchData(queryParams);

  // Licitações possuem links assinados (PAR OCI) temporários. Cache curto (15 min) para evitar links 404 expirados.
  const ttl = tipo === 'licitacao' ? 900 : 86400;
  await setCache(cacheKey, data, ttl);

  return data;
}
