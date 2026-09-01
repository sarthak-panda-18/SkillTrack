import { Router } from 'express';
import { getPublicCareerRoles, getCareerRoleDetails } from '../controllers/careerRole.controller';

const router = Router();

// Public / Student endpoints
router.get('/', getPublicCareerRoles);
router.get('/:id', getCareerRoleDetails);

export default router;
