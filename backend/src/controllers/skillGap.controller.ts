import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { skillGapService } from '../services/skillGap.service';

export const getStudentSkillGap = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analysis = await skillGapService.getStudentSkillGap(req.user!.userId);
    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const recalculateSkillGap = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analysis = await skillGapService.recalculateSkillGap(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'Skill Gap Analysis recalculated successfully',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
