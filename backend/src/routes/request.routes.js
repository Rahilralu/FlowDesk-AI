import express from 'express';
import { handleCreateRequest, handleGetRequests, handleGetRequestEvents, handleGetRequestById, handleUpdateStatus, handleAddNote , handleDeleteRequest , handleDeleteNote , handleGetEvents } from '../controllers/request.controllers.js';
import { authenticate_token } from '../middleware/auth.middleware.js';
import { roleChecker } from '../middleware/roleChecker.js';
import { createRequestLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', createRequestLimiter, handleCreateRequest);
router.get('/events', authenticate_token, roleChecker, handleGetRequestEvents);
router.get('/', authenticate_token, roleChecker, handleGetRequests);
router.get('/events', authenticate_token, roleChecker, handleGetEvents);
router.get('/:id', authenticate_token, roleChecker, handleGetRequestById);
router.patch('/:id/status', authenticate_token, roleChecker, handleUpdateStatus);
router.post('/:id/notes',authenticate_token, roleChecker, handleAddNote);
router.delete('/:id',authenticate_token,roleChecker,handleDeleteRequest);
router.delete('/:id/notes/:noteId', authenticate_token, roleChecker, handleDeleteNote);

export default router;