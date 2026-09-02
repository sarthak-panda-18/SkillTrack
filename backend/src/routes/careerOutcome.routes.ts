import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCurrentOutcome,
  getOutcomeHistory,
  createOutcome,
  updateOutcome,
  archiveOutcome,
  getConsentStatus,
  updateConsent,
} from '../controllers/careerOutcome.controller';
import {
  getStudentFollowUps,
  submitFollowUpResponse,
} from '../controllers/followUp.controller';

const router = Router();

router.use(authenticate);

router.get('/', getCurrentOutcome);
router.get('/history', getOutcomeHistory);
router.post('/', createOutcome);
router.patch('/:id', updateOutcome);
router.post('/archive/:id', archiveOutcome);

// Student Consent routes
router.get('/consent', getConsentStatus);
router.post('/consent', updateConsent);

// Student Follow-up routes
router.get('/follow-ups', getStudentFollowUps);
router.post('/follow-ups/:id', submitFollowUpResponse);

export default router;
