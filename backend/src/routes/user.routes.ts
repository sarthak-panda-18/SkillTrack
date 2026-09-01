import { Router } from 'express';
import { getProfile, updateProfile, completeOnboarding, changePassword, deleteAccount } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateProfileSchema, onboardingSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me/profile', validateRequest(updateProfileSchema), updateProfile);
router.put('/me/onboarding', validateRequest(onboardingSchema), completeOnboarding);
router.put('/me/password', validateRequest(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount);

export default router;
