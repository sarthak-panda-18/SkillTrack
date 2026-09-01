import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPublicAssessments,
  getAssessmentById,
  startAssessment,
  getAttemptForPlayer,
  submitAssessment,
  getAttemptResults,
  getUserAttemptHistory,
} from '../controllers/assessment.controller';

const router = Router();

// Protect ALL assessment routes with student JWT authentication
router.use(authenticate);

router.get('/', getPublicAssessments);
router.get('/history', getUserAttemptHistory);
router.get('/:id', getAssessmentById);
router.post('/:id/start', startAssessment);
router.get('/attempts/:attemptId/play', getAttemptForPlayer);
router.post('/attempts/:attemptId/submit', submitAssessment);
router.get('/attempts/:attemptId/results', getAttemptResults);

export default router;
