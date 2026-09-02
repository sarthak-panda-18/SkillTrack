import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import {
  getMyCareerStatus,
  updateMyCareerStatus,
  addEmploymentDocument,
  deleteEmploymentDocument,
  getStudentCareerStatus,
  verifyEmploymentDocument,
} from '../controllers/careerStatus.controller';

import { uploadDocumentMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

// Trainee self endpoints
router.get('/me', getMyCareerStatus);
router.put('/me', updateMyCareerStatus);
router.post('/me/documents', uploadDocumentMiddleware.single('file'), addEmploymentDocument);
router.delete('/me/documents/:docId', deleteEmploymentDocument);

// Trainer / Admin endpoints
router.get('/student/:userId', authorizeRoles('ADMIN', 'TRAINER'), getStudentCareerStatus);
router.patch('/admin/documents/:docId/verify', authorizeRoles('ADMIN', 'TRAINER'), verifyEmploymentDocument);

export default router;
