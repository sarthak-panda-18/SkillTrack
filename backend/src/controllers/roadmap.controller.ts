import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { roadmapService } from '../services/roadmap.service';

export const getStudentRoadmap = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmap = await roadmapService.getStudentRoadmap(req.user!.userId);
    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const generateRoadmap = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmap = await roadmapService.generateRoadmap(req.user!.userId);
    res.status(201).json({
      success: true,
      message: 'Personalized Learning Roadmap generated successfully',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateRoadmap = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmap = await roadmapService.regenerateRoadmap(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'Learning Roadmap regenerated successfully',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopicProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { progress } = req.body;
    const roadmap = await roadmapService.updateTopicProgress(req.user!.userId, req.params.topicId, progress);
    res.status(200).json({
      success: true,
      message: 'Topic progress updated successfully',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const completeTopic = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmap = await roadmapService.completeTopic(req.user!.userId, req.params.topicId);
    res.status(200).json({
      success: true,
      message: 'Topic marked complete successfully',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await roadmapService.getTopicResource(req.user!.userId, req.params.topicId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTopicResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await roadmapService.refreshTopicResource(req.user!.userId, req.params.topicId);
    res.status(200).json({
      success: true,
      message: 'Alternative learning video recommended successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
