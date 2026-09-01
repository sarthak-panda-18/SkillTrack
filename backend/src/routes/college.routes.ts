import { Router } from 'express';
import { searchColleges, requestCollegeAddition } from '../controllers/college.controller';

const router = Router();

// Public college search & addition request endpoints
router.get('/', searchColleges);
router.post('/request', requestCollegeAddition);

export default router;
