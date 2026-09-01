import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adaptiveService } from '../services/adaptive.service';

export const getAdaptiveState = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adaptiveService.getAdaptiveState(req.user!.userId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const state = await adaptiveService.analyzeProgress(req.user!.userId);
    const data = await adaptiveService.getAdaptiveState(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'Adaptive learning progress analyzed successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecommendationStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const rec = await adaptiveService.updateRecommendationStatus(req.user!.userId, req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Recommendation marked as ${status}`,
      data: rec,
    });
  } catch (error) {
    next(error);
  }
};
