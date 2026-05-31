import { Redis } from 'ioredis';

const getRedisOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isProduction ? { rejectUnauthorized: false } : undefined,
  };
};

export const redisConnection = new Redis(process.env.REDIS_URL, getRedisOptions());

export const createRedisClient = () => new Redis(process.env.REDIS_URL, getRedisOptions());

export async function connectRedis() {
  console.log('Redis connected');
}

export default redisConnection;