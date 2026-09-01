import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import {
  getVerificationQueue,
  getVerificationDetails,
  startReview,
  verifyOutcome,
  rejectOutcome,
  requestChanges,
  streamAdminEvidenceFile,
} from '../controllers/adminOutcomeVerification.controller';

const router = Router();

// Protect all verification routes for Admin users only
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/', getVerificationQueue);
router.get('/:outcomeId', getVerificationDetails);
router.post('/:outcomeId/start-review', startReview);
router.post('/:outcomeId/verify', verifyOutcome);
router.post('/:outcomeId/reject', rejectOutcome);
router.post('/:outcomeId/request-changes', requestChanges);
router.get('/:outcomeId/file/:evidenceId', streamAdminEvidenceFile);

export default router;
