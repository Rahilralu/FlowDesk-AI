import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log('Redis connected');
  }
}

export default client;