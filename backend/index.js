import express from "express";
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from './src/routes/app.routes.js';
import { connectRedis } from "./src/config/redis.js";
import http from 'http';
import { initSocket } from './src/config/socket.js';
import './src/workers/classificationWorker.js';
// import { globalLimiter } from "./src/middleware/rateLimiter.js";
import telegramWebhook from './src/webhooks/telegram.webhook.js'

dotenv.config();

const app = express();
app.set('trust proxy', 1)

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// app.use(globalLimiter)
app.use('/api', routes);
app.use('/webhooks', telegramWebhook)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const server = http.createServer(app);

const start = async () => {
  await connectRedis();
  await initSocket(server);
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
};

start();