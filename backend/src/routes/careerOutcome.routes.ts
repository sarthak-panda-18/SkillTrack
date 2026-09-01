import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCurrentOutcome,
  getOutcomeHistory,
  createOutcome,
  updateOutcome,
  archiveOutcome,
} from '../controllers/careerOutcome.controller';

const router = Router();

router.use(authenticate);

router.get('/', getCurrentOutcome);
router.get('/history', getOutcomeHistory);
router.post('/', createOutcome);
router.patch('/:id', updateOutcome);
router.post('/archive/:id', archiveOutcome);

export default router;
