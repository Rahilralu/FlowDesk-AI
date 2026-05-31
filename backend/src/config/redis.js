import { Redis } from 'ioredis';

const redisOptions = process.env.NODE_ENV === 'production'
  ? { tls: {}, maxRetriesPerRequest: null }
  : { maxRetriesPerRequest: null };

// for BullMQ
export const redisConnection = new Redis(process.env.REDIS_URL, redisOptions);

// for pub/sub and general use
export const createRedisClient = () => new Redis(process.env.REDIS_URL, redisOptions);

export async function connectRedis() {
  console.log('Redis connected');
}

export default redisConnection;