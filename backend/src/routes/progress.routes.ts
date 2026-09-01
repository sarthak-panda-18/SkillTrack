import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudentProgress,
  getReadinessHistory,
  getAchievements,
  refreshProgress,
  getStudentTimeline,
} from '../controllers/progress.controller';

const router = Router();

router.use(authenticate);

router.get('/', getStudentProgress);
router.get('/readiness', getStudentProgress);
router.get('/timeline', getStudentTimeline);
router.get('/history', getReadinessHistory);
router.get('/achievements', getAchievements);
router.post('/refresh', refreshProgress);

export default router;
