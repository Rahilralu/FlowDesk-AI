import { Queue } from 'bullmq';
import { connectRedis } from '../config/redis.js'

export const requestQueue = new Queue('requests',{
    connection: connectRedis
})