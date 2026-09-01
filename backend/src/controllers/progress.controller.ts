import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { progressService } from '../services/progress.service';

export const getStudentProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await progressService.getStudentProgress(req.user!.userId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getReadinessHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const history = await progressService.getReadinessHistory(req.user!.userId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const achievements = await progressService.getAchievements(req.user!.userId);
    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await progressService.refreshProgress(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'Progress and career readiness index recalculated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentTimeline = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, category, dateFilter, sort } = req.query;
    const result = await progressService.getStudentTimeline(req.user!.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category: category as string,
      dateFilter: dateFilter as string,
      sort: sort as 'DESC' | 'ASC',
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

