import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { skillService } from '../services/skill.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await adminService.getTrainerDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const role = req.query.role as any;
    const status = req.query.status as any;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await adminService.getUsersList({ search, role, status, page, limit });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedUser = await adminService.updateUserStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: `User status updated to ${req.body.status}`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user?.id || req.user?.userId || '';
    const result = await adminService.deleteUser(req.params.id, adminId);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const forcePasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.forcePasswordReset(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skills = await skillService.getAdminSkills();
    res.status(200).json({
      success: true,
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skill = await skillService.updateSkill(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSkillStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await skillService.deactivateSkill(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { skill: result.skill },
    });
  } catch (error) {
    next(error);
  }
};
