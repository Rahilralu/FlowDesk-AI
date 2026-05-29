import express from 'express';
import { login,refresh,logout } from '../controllers/auth.controllers.js';
import { authenticate_token, cookie_validator, } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login',login);
router.post('/refresh',cookie_validator,refresh);
router.post('/logout',cookie_validator,authenticate_token,logout);

export default router;