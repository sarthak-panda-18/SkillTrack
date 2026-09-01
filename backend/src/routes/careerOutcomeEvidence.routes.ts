import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import {
  uploadEvidence,
  getEvidenceList,
  getEvidenceFile,
  deleteEvidence,
} from '../controllers/careerOutcomeEvidence.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

const router = Router();

router.use(authenticate);

router.post('/:outcomeId/evidence', upload.single('file'), uploadEvidence);
router.get('/:outcomeId/evidence', getEvidenceList);
router.get('/:outcomeId/evidence/:evidenceId/file', getEvidenceFile);
router.delete('/:outcomeId/evidence/:evidenceId', deleteEvidence);

export default router;
