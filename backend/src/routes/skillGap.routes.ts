import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getStudentSkillGap, recalculateSkillGap } from '../controllers/skillGap.controller';

const router = Router();

// Protect ALL skill-gap routes with student JWT authentication
router.use(authenticate);

router.get('/', getStudentSkillGap);
router.post('/analyze', recalculateSkillGap);

export default router;
