import { Request, Response, NextFunction } from 'express';
import { skillService } from '../services/skill.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skills = await skillService.getAllSkills();
    res.status(200).json({
      success: true,
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skill = await skillService.createSkill(req.body);
    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSkills = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userSkills = await skillService.getUserSkills(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { userSkills },
    });
  } catch (error) {
    next(error);
  }
};

export const addUserSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userSkill = await skillService.addUserSkill(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Skill updated/added successfully',
      data: { userSkill },
    });
  } catch (error) {
    next(error);
  }
};

export const removeUserSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await skillService.removeUserSkill(req.user!.userId, req.params.skillId);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillGrowth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { timeRange, category } = req.query;
    const growthData = await skillService.getSkillGrowthData(req.user!.userId, {
      timeRange: timeRange as string,
      category: category as string,
    });
    res.status(200).json({
      success: true,
      data: growthData,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skillId } = req.params;
    const historyData = await skillService.getSkillHistory(req.user!.userId, skillId);
    res.status(200).json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    next(error);
  }
};

