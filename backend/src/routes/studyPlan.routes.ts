import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudentStudyPlan,
  generateStudyPlan,
  regenerateStudyPlan,
  getTodayPlan,
  updateTaskStatus,
  rescheduleTask,
} from '../controllers/studyPlan.controller';

const router = Router();

// Protect ALL study plan routes with student JWT authentication
router.use(authenticate);

router.get('/', getStudentStudyPlan);
router.post('/generate', generateStudyPlan);
router.post('/regenerate', regenerateStudyPlan);
router.get('/today', getTodayPlan);
router.patch('/tasks/:taskId', updateTaskStatus);
router.post('/tasks/:taskId/reschedule', rescheduleTask);

export default router;
