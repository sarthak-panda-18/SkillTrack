import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { studyPlanService } from '../services/studyPlan.service';

export const getStudentStudyPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await studyPlanService.getStudentStudyPlan(req.user!.userId);
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const generateStudyPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await studyPlanService.generateStudyPlan(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Personalized Study Plan generated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateStudyPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await studyPlanService.regenerateStudyPlan(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'Study Plan regenerated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await studyPlanService.getStudentStudyPlan(req.user!.userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDay = plan.days?.find((d: any) => d.date === todayStr) || plan.days?.[0];

    res.status(200).json({
      success: true,
      data: {
        planId: plan._id,
        title: plan.title,
        careerRoleName: plan.careerRoleName,
        overallProgress: plan.overallProgress,
        streakDays: plan.streakDays,
        todayDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const plan = await studyPlanService.updateTaskStatus(req.user!.userId, req.params.taskId, status);
    res.status(200).json({
      success: true,
      message: 'Study task status updated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetDate } = req.body;
    const plan = await studyPlanService.rescheduleTask(req.user!.userId, req.params.taskId, targetDate);
    res.status(200).json({
      success: true,
      message: 'Task rescheduled successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};
