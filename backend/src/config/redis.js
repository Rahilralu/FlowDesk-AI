import { createClient } from 'redis';
import { Redis } from 'ioredis';

const client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}

const redisOptions = process.env.NODE_ENV === 'production'
  ? { tls: {}, maxRetriesPerRequest: null }
  : { maxRetriesPerRequest: null };

export const redisConnection = new Redis(process.env.REDIS_URL, redisOptions);

export default client;