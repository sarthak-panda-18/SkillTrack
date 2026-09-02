import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { followUpService } from '../services/followUp.service';

export async function getStudentFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const followUps = await followUpService.getStudentFollowUps(userId);
    res.status(200).json({
      success: true,
      data: followUps,
      message: 'Student follow-ups retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function submitFollowUpResponse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const followUp = await followUpService.submitFollowUpResponse(userId, id, req.body);
    res.status(200).json({
      success: true,
      data: followUp,
      message: 'Follow-up survey response recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrainerFollowUpQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await followUpService.getTrainerFollowUpQueue({
      status: req.query.status as string,
      checkpoint: req.query.checkpoint as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Trainer follow-up queue retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function triggerDueNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await followUpService.triggerDueNotifications();
    res.status(200).json({
      success: true,
      data: result,
      message: 'Follow-up notification reminders triggered successfully.',
    });
  } catch (error) {
    next(error);
  }
}
