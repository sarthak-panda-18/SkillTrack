import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import {
  submitCompanyInsight,
  getCompanyInsights,
  getAdminInsightsQueue,
  moderateCompanyInsight,
} from '../controllers/opportunity.controller';

const router = Router();

router.use(authenticate);

router.post('/insights', submitCompanyInsight);
router.get('/insights', getCompanyInsights);

// Trainer / Admin moderation routes
router.get('/admin/insights', authorizeRoles('ADMIN', 'TRAINER'), getAdminInsightsQueue);
router.patch('/admin/insights/:id', authorizeRoles('ADMIN', 'TRAINER'), moderateCompanyInsight);

export default router;
