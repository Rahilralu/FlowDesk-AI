import express from 'express';
import { handleCreateRequest } from '../controllers/request.controllers.js';
import { csrfMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/',csrfMiddleware,handleCreateRequest);

export default router;