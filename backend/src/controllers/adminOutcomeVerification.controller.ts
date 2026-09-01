import { Response, NextFunction } from 'express';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { careerOutcomeVerificationService } from '../services/careerOutcomeVerification.service';
import { careerOutcomeEvidenceService } from '../services/careerOutcomeEvidence.service';

export const getVerificationQueue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await careerOutcomeVerificationService.getVerificationQueue(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const details = await careerOutcomeVerificationService.getVerificationDetails(outcomeId);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

export const startReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const outcome = await careerOutcomeVerificationService.startReview(req.user!.userId, outcomeId);
    res.status(200).json({
      success: true,
      message: 'Review process started for career outcome.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const { notes } = req.body;
    const outcome = await careerOutcomeVerificationService.verifyOutcome(req.user!.userId, outcomeId, notes);
    res.status(200).json({
      success: true,
      message: 'Career outcome verified successfully!',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const { reason, notes } = req.body;
    const outcome = await careerOutcomeVerificationService.rejectOutcome(req.user!.userId, outcomeId, reason, notes);
    res.status(200).json({
      success: true,
      message: 'Career outcome rejected.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const requestChanges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const { reason, notes } = req.body;
    const outcome = await careerOutcomeVerificationService.requestChanges(req.user!.userId, outcomeId, reason, notes);
    res.status(200).json({
      success: true,
      message: 'Changes requested from student.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const streamAdminEvidenceFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { outcomeId, evidenceId } = req.params;
    // Admins can access any student's evidence document securely
    const details = await careerOutcomeVerificationService.getVerificationDetails(outcomeId);
    const evidence = details.evidenceList.find((e) => e._id.toString() === evidenceId);

    if (!evidence) {
      res.status(404).json({ success: false, message: 'Evidence document not found.' });
      return;
    }

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(evidence.originalFileName)}"`);
    res.sendFile(path.resolve(evidence.storagePath));
  } catch (error) {
    next(error);
  }
};
