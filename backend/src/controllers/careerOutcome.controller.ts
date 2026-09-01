import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { careerOutcomeService } from '../services/careerOutcome.service';

export const getCurrentOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcome = await careerOutcomeService.getCurrentOutcome(req.user!.userId);
    res.status(200).json({
      success: true,
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const getOutcomeHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const history = await careerOutcomeService.getOutcomeHistory(req.user!.userId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const createOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcome = await careerOutcomeService.createOutcome(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Career outcome recorded successfully.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcome = await careerOutcomeService.updateOutcome(req.user!.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Career outcome updated successfully.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveOutcome = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcome = await careerOutcomeService.archiveOutcome(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Career outcome archived successfully.',
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};
