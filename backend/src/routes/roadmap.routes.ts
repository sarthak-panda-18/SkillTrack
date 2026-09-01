import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudentRoadmap,
  generateRoadmap,
  regenerateRoadmap,
  updateTopicProgress,
  completeTopic,
  getTopicResource,
  refreshTopicResource,
} from '../controllers/roadmap.controller';

const router = Router();

// Protect ALL roadmap routes with student JWT authentication
router.use(authenticate);

router.get('/', getStudentRoadmap);
router.post('/generate', generateRoadmap);
router.post('/regenerate', regenerateRoadmap);
router.patch('/topics/:topicId/progress', updateTopicProgress);
router.post('/topics/:topicId/complete', completeTopic);
router.get('/topics/:topicId/resource', getTopicResource);
router.post('/topics/:topicId/resource/refresh', refreshTopicResource);

export default router;
