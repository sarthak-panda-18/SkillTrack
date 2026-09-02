import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  getDashboardStats,
  getTrainerDashboardStats,
  getUsersList,
  getUserById,
  updateUserStatus,
  deleteUser,
  forcePasswordReset,
  getAdminSkills,
  updateAdminSkill,
  toggleSkillStatus,
} from '../controllers/admin.controller';
import { createSkill } from '../controllers/skill.controller';
import {
  getAdminColleges,
  createCollege,
  updateCollege,
  toggleCollegeStatus,
  getAdminCollegeRequests,
  reviewCollegeRequest,
} from '../controllers/college.controller';
import {
  getAdminCareerRoles,
  createCareerRole,
  updateCareerRole,
  toggleCareerRoleStatus,
  addOrUpdateRoleSkill,
  removeRoleSkill,
} from '../controllers/careerRole.controller';
import {
  getAdminAssessments,
  createAssessment,
  updateAssessment,
  toggleAssessmentStatus,
  getAssessmentQuestions,
  generateAiQuestionsForSkill,
} from '../controllers/assessment.controller';
import {
  sendIndividualStudentEmail,
  sendBulkStudentEmail,
  getCommunicationLogs,
} from '../controllers/adminCommunication.controller';
import {
  sendIndividualEmailSchema,
  sendBulkEmailSchema,
} from '../validators/adminCommunication.validator';
import { updateUserStatusSchema, updateSkillAdminSchema } from '../validators/admin.validator';
import { createSkillSchema } from '../validators/skill.validator';
import { createCollegeSchema, updateCollegeSchema } from '../validators/college.validator';

const router = Router();

// Protect ALL admin/trainer routes with JWT Auth + ADMIN or TRAINER Role Authorization
router.use(authenticate, authorizeRoles('ADMIN', 'TRAINER'));

// Trainer & Admin Platform Dashboard Metrics
router.get('/dashboard', getDashboardStats);
router.get('/trainer-stats', getTrainerDashboardStats);

// Admin User Management
router.get('/users', getUsersList);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', validateRequest(updateUserStatusSchema), updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', forcePasswordReset);

// Admin Student Communication
router.post(
  '/users/bulk-email',
  validateRequest(sendBulkEmailSchema),
  sendBulkStudentEmail
);
router.post(
  '/users/:studentId/email',
  validateRequest(sendIndividualEmailSchema),
  sendIndividualStudentEmail
);
router.get('/communication-logs', getCommunicationLogs);

// Admin Skill Catalog Management
router.get('/skills', getAdminSkills);
router.post('/skills', validateRequest(createSkillSchema), createSkill);
router.put('/skills/:id', validateRequest(updateSkillAdminSchema), updateAdminSkill);
router.delete('/skills/:id', toggleSkillStatus);

// Admin College Management
router.get('/colleges', getAdminColleges);
router.post('/colleges', validateRequest(createCollegeSchema), createCollege);
router.put('/colleges/:id', validateRequest(updateCollegeSchema), updateCollege);
router.delete('/colleges/:id', toggleCollegeStatus);

// Admin Student College Addition Requests
router.get('/college-requests', getAdminCollegeRequests);
router.put('/college-requests/:id/status', reviewCollegeRequest);

// Admin Career Roles & Role-Skill Requirements Management
router.get('/career-roles', getAdminCareerRoles);
router.post('/career-roles', createCareerRole);
router.put('/career-roles/:id', updateCareerRole);
router.delete('/career-roles/:id', toggleCareerRoleStatus);
router.post('/career-roles/:id/skills', addOrUpdateRoleSkill);
router.delete('/career-roles/:id/skills/:skillId', removeRoleSkill);

// Admin Assessment & Question Bank Management
router.get('/assessments', getAdminAssessments);
router.post('/assessments', createAssessment);
router.put('/assessments/:id', updateAssessment);
router.delete('/assessments/:id', toggleAssessmentStatus);
router.get('/assessments/:id/questions', getAssessmentQuestions);
router.post('/assessments/generate-questions/:skillId', generateAiQuestionsForSkill);

export default router;
