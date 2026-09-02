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
    const filters = {
      cohort: req.query.cohort as string,
      course: req.query.course as string,
      district: req.query.district as string,
      provider: req.query.provider as string,
    };
    const stats = await adminService.getTrainerDashboardStats(filters);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getCohortAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getCohortAnalytics({
      district: req.query.district as string,
      course: req.query.course as string,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCourseAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getCourseAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProviderAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getProviderAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDistrictAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getDistrictAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDemographicAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getDemographicAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getNonPlacementAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getNonPlacementAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttritionAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getAttritionAnalytics();
    res.status(200).json({ success: true, data });
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
