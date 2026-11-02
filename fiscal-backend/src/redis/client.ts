import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null // Required by BullMQ
});

redis.on('error', (err) => {
  console.error('[Redis Client Error]', err.message);
});

export async function getCache(key: string) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key: string, data: any, ttlSeconds: number = 600) {
  await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
}
