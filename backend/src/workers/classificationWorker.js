import { Worker } from "bullmq";
import prisma from "../config/psql.js";
import { connectRedis } from "../config/redis.js";
import { classifyRequest } from '../services/geminiService.js';
import { getIO } from '../config/socket.js';