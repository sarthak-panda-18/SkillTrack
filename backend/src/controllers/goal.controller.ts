import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { goalService } from '../services/goal.service';

export const getStudentGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status, sort } = req.query;
    const data = await goalService.getStudentGoals(req.user!.userId, {
      category: category as string,
      status: status as string,
      sort: sort as string,
    });
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goal = await goalService.createGoal(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const goal = await goalService.updateGoal(req.user!.userId, id, req.body);
    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await goalService.deleteGoal(req.user!.userId, id);
    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateMilestoneStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goalId, milestoneId } = req.params;
    const { status } = req.body;
    const goal = await goalService.updateMilestoneStatus(req.user!.userId, goalId, milestoneId, status);
    res.status(200).json({
      success: true,
      message: 'Milestone status updated.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const getGoalRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const recommendations = await goalService.getGoalRecommendations(req.user!.userId);
    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
