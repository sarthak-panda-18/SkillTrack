import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import {
  submitFeedback,
  getStudentFeedback,
  getAggregatedFeedbackAnalytics,
} from '../controllers/trainingFeedback.controller';

const router = Router();

router.use(authenticate);

router.post('/', submitFeedback);
router.get('/student', getStudentFeedback);
router.get('/analytics', authorizeRoles('ADMIN', 'TRAINER'), getAggregatedFeedbackAnalytics);

export default router;
