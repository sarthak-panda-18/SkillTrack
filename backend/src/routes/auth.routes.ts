import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword, googleAuth } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/google', validateRequest(googleAuthSchema), googleAuth);

export default router;
