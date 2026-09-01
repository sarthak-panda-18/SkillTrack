import { Router } from 'express';
import {
  getAllSkills,
  createSkill,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  getSkillGrowth,
  getSkillHistory,
} from '../controllers/skill.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createSkillSchema, addUserSkillSchema } from '../validators/skill.validator';

const router = Router();

// Skill growth endpoints
router.get('/growth', authenticate, getSkillGrowth);
router.get('/:skillId/history', authenticate, getSkillHistory);

// Public skill catalog listing
router.get('/', getAllSkills);
router.post('/', authenticate, validateRequest(createSkillSchema), createSkill);

// User specific skills
router.get('/user/me', authenticate, getUserSkills);
router.post('/user/me', authenticate, validateRequest(addUserSkillSchema), addUserSkill);
router.delete('/user/me/:skillId', authenticate, removeUserSkill);

export default router;

