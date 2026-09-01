import { Request, Response, NextFunction } from 'express';
import { careerRoleService } from '../services/careerRole.service';

export const getPublicCareerRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const roles = await careerRoleService.getPublicCareerRoles(search, category);
    res.status(200).json({
      success: true,
      data: { roles },
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerRoleDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await careerRoleService.getCareerRoleDetails(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCareerRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await careerRoleService.getAdminCareerRoles({ search, category, page, limit });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createCareerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = await careerRoleService.createCareerRole(req.body);
    res.status(201).json({
      success: true,
      message: 'Career role created successfully',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCareerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = await careerRoleService.updateCareerRole(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Career role updated successfully',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCareerRoleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = await careerRoleService.toggleCareerRoleStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Career role status updated to ${role.isActive ? 'Active' : 'Inactive'}`,
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const addOrUpdateRoleSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skillId, importance, minimumProficiency, recommendedProficiency } = req.body;
    const mapping = await careerRoleService.addOrUpdateRoleSkill(
      req.params.id,
      skillId,
      importance,
      minimumProficiency,
      recommendedProficiency
    );
    res.status(200).json({
      success: true,
      message: 'Role skill requirement saved successfully',
      data: { mapping },
    });
  } catch (error) {
    next(error);
  }
};

export const removeRoleSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await careerRoleService.removeRoleSkill(req.params.id, req.params.skillId);
    res.status(200).json({
      success: true,
      message: 'Role skill requirement removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
