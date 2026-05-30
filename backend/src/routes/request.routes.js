import express from 'express';
import { handleCreateRequest, handleGetRequests, handleGetRequestEvents, handleGetRequestById, handleUpdateStatus, handleAddNote } from '../controllers/request.controllers.js';
import { csrfMiddleware,authenticate_token } from '../middleware/auth.middleware.js';
import { roleChecker } from '../middleware/roleChecker.js';
import { createRequestLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', createRequestLimiter, csrfMiddleware, handleCreateRequest);
router.get('/events', authenticate_token, roleChecker, handleGetRequestEvents);
router.get('/', authenticate_token, roleChecker, handleGetRequests);
router.get('/:id', authenticate_token, roleChecker, handleGetRequestById);
router.patch('/:id/status', authenticate_token, roleChecker, handleUpdateStatus);
router.post('/:id/notes',csrfMiddleware,authenticate_token, roleChecker, handleAddNote);

export default router;