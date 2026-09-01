import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudentGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateMilestoneStatus,
  getGoalRecommendations,
} from '../controllers/goal.controller';

const router = Router();

router.use(authenticate);

router.get('/', getStudentGoals);
router.post('/', createGoal);
router.get('/recommendations', getGoalRecommendations);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:goalId/milestones/:milestoneId', updateMilestoneStatus);

export default router;
