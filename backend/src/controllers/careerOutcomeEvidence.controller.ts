import { Response, NextFunction } from 'express';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { careerOutcomeEvidenceService } from '../services/careerOutcomeEvidence.service';

export const uploadEvidence = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const { documentType } = req.body;
    const file = req.file;

    const evidence = await careerOutcomeEvidenceService.uploadEvidence(
      req.user!.userId,
      outcomeId,
      documentType,
      file!
    );

    res.status(201).json({
      success: true,
      message: 'Supporting evidence document submitted successfully.',
      data: evidence,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvidenceList = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const evidenceList = await careerOutcomeEvidenceService.getEvidenceList(req.user!.userId, outcomeId);

    res.status(200).json({
      success: true,
      data: evidenceList,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvidenceFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId, evidenceId } = req.params;
    const { evidence, storagePath } = await careerOutcomeEvidenceService.getEvidenceFile(
      req.user!.userId,
      outcomeId,
      evidenceId
    );

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(evidence.originalFileName)}"`);
    res.sendFile(path.resolve(storagePath));
  } catch (error) {
    next(error);
  }
};

export const deleteEvidence = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId, evidenceId } = req.params;
    await careerOutcomeEvidenceService.deleteEvidence(req.user!.userId, outcomeId, evidenceId);

    res.status(200).json({
      success: true,
      message: 'Evidence document removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
