import express from "express";
import requestsRouter from './request.routes.js';
import authRoutes from './auth.routes.js'

const router = express.Router();

app.use('/auth',authRoutes);
app.use('/requests', requestsRouter);

export default router