import express from "express";
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from './src/routes/app.routes.js';
import { connectRedis } from "./src/config/redis.js";

dotenv.config();

const app = express();

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use('/api',routes);

//Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000

app.listen(PORT,async () => {
    await connectRedis();
    console.log(`Server running in ${PORT}`)
})